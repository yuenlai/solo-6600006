import React, { useState, useMemo } from 'react';
import { SensitiveProtection, ProtectionMode, ProtectionVerifyResult } from '../types';

interface Props {
  protections: SensitiveProtection[];
  directories: { path: string; name: string }[];
  onAddProtection: (protection: Omit<SensitiveProtection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateProtection: (id: string, updates: Partial<SensitiveProtection>) => void;
  onDeleteProtection: (id: string) => void;
  onToggleProtection: (id: string) => void;
  onVerifyProtection: (id: string, input: string) => ProtectionVerifyResult;
}

const modeConfig: Record<ProtectionMode, { label: string; color: string; icon: string; description: string }> = {
  confirm: { label: '额外确认', color: '#f57c00', icon: '🛡️', description: '操作前弹出确认提示，防止误操作' },
  password: { label: '访问口令', color: '#c62828', icon: '🔐', description: '需要输入口令才能访问该目录' },
  recovery: { label: '恢复校验', color: '#1565c0', icon: '🔑', description: '通过安全问题验证身份后才可访问' },
};

export const SensitiveProtectionPanel: React.FC<Props> = ({
  protections,
  directories,
  onAddProtection,
  onUpdateProtection,
  onDeleteProtection,
  onToggleProtection,
  onVerifyProtection,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProtection, setEditingProtection] = useState<SensitiveProtection | null>(null);
  const [verifyModalId, setVerifyModalId] = useState<string | null>(null);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<ProtectionVerifyResult | null>(null);

  const [formMode, setFormMode] = useState<ProtectionMode>('confirm');
  const [formDirectoryPath, setFormDirectoryPath] = useState('');
  const [formConfirmMessage, setFormConfirmMessage] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRecoveryQuestion, setFormRecoveryQuestion] = useState('');
  const [formRecoveryAnswer, setFormRecoveryAnswer] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);

  const availableDirectories = useMemo(() => {
    const protectedPaths = new Set(protections.map(p => p.directoryPath));
    if (editingProtection) {
      return directories;
    }
    return directories.filter(d => !protectedPaths.has(d.path));
  }, [directories, protections, editingProtection]);

  const stats = useMemo(() => ({
    total: protections.length,
    enabled: protections.filter(p => p.enabled).length,
    disabled: protections.filter(p => !p.enabled).length,
    byConfirm: protections.filter(p => p.mode === 'confirm').length,
    byPassword: protections.filter(p => p.mode === 'password').length,
    byRecovery: protections.filter(p => p.mode === 'recovery').length,
  }), [protections]);

  const resetForm = () => {
    setFormMode('confirm');
    setFormDirectoryPath('');
    setFormConfirmMessage('');
    setFormPassword('');
    setFormRecoveryQuestion('');
    setFormRecoveryAnswer('');
    setFormEnabled(true);
  };

  const handleOpenAdd = () => {
    resetForm();
    setEditingProtection(null);
    setShowAddModal(true);
  };

  const handleEdit = (protection: SensitiveProtection) => {
    setEditingProtection(protection);
    setFormMode(protection.mode);
    setFormDirectoryPath(protection.directoryPath);
    setFormConfirmMessage(protection.confirmMessage || '');
    setFormPassword(protection.password || '');
    setFormRecoveryQuestion(protection.recoveryQuestion || '');
    setFormRecoveryAnswer(protection.recoveryAnswer || '');
    setFormEnabled(protection.enabled);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProtection(null);
    resetForm();
  };

  const handleSave = () => {
    const dirName = directories.find(d => d.path === formDirectoryPath)?.name || formDirectoryPath.split('/').pop() || formDirectoryPath;

    const data: Omit<SensitiveProtection, 'id' | 'createdAt' | 'updatedAt'> = {
      directoryPath: formDirectoryPath,
      directoryName: dirName,
      mode: formMode,
      enabled: formEnabled,
      ...(formMode === 'confirm' ? { confirmMessage: formConfirmMessage || `确认访问 ${dirName} 目录？` } : {}),
      ...(formMode === 'password' ? { password: formPassword } : {}),
      ...(formMode === 'recovery' ? { recoveryQuestion: formRecoveryQuestion, recoveryAnswer: formRecoveryAnswer } : {}),
    };

    if (editingProtection) {
      onUpdateProtection(editingProtection.id, data);
    } else {
      onAddProtection(data);
    }
    handleCloseModal();
  };

  const isFormValid = () => {
    if (!formDirectoryPath) return false;
    if (formMode === 'password' && !formPassword.trim()) return false;
    if (formMode === 'recovery' && (!formRecoveryQuestion.trim() || !formRecoveryAnswer.trim())) return false;
    return true;
  };

  const handleVerify = () => {
    if (!verifyModalId) return;
    const result = onVerifyProtection(verifyModalId, verifyInput);
    setVerifyResult(result);
  };

  const handleCloseVerifyModal = () => {
    setVerifyModalId(null);
    setVerifyInput('');
    setVerifyResult(null);
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0 }}>🔒 敏感文件保护</h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
            为指定目录开启额外确认、访问口令或恢复校验，降低误操作风险
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: '#1976d2',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          + 添加保护
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { key: 'total', label: '保护规则', count: stats.total, color: '#1976d2' },
          { key: 'enabled', label: '已启用', count: stats.enabled, color: '#2e7d32' },
          { key: 'disabled', label: '已禁用', count: stats.disabled, color: '#757575' },
          { key: 'confirm', label: '额外确认', count: stats.byConfirm, color: '#f57c00' },
          { key: 'password', label: '访问口令', count: stats.byPassword, color: '#c62828' },
          { key: 'recovery', label: '恢复校验', count: stats.byRecovery, color: '#1565c0' },
        ].map(item => (
          <div
            key={item.key}
            style={{
              padding: '12px',
              borderRadius: '8px',
              background: '#fff',
              border: '1px solid #e0e0e0',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: item.color }}>{item.count}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: '#fff3e0',
        borderRadius: '8px',
        border: '1px solid #ffe0b2',
        padding: '14px 16px',
        marginBottom: '20px',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: '18px' }}>💡</span>
        <div>
          <div style={{ fontWeight: 500, fontSize: '14px', color: '#e65100', marginBottom: '4px' }}>保护模式说明</div>
          <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
            <span style={{ color: '#f57c00', fontWeight: 500 }}>额外确认</span>：操作前需二次确认，适合一般敏感目录；
            <span style={{ color: '#c62828', fontWeight: 500 }}>访问口令</span>：需输入预设口令，适合重要数据目录；
            <span style={{ color: '#1565c0', fontWeight: 500 }}>恢复校验</span>：回答安全问题后访问，适合关键备份目录
          </div>
        </div>
      </div>

      {protections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
          <p>暂无敏感文件保护规则</p>
          <p style={{ fontSize: '13px', color: '#aaa' }}>添加保护规则，防止对重要目录的误操作</p>
          <button
            onClick={handleOpenAdd}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #1976d2',
              background: 'transparent',
              color: '#1976d2',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            添加第一条保护
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {protections.map(protection => {
            const config = modeConfig[protection.mode];
            return (
              <div
                key={protection.id}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: '#fff',
                  border: `1px solid ${protection.enabled ? '#e0e0e0' : '#f0f0f0'}`,
                  opacity: protection.enabled ? 1 : 0.6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `${config.color}15`,
                    fontSize: '22px',
                    flexShrink: 0,
                  }}>
                    {config.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 500, fontSize: '15px' }}>{protection.directoryName}</span>
                      <code style={{ fontSize: '12px', color: '#666', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                        {protection.directoryPath}
                      </code>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: protection.enabled ? '#e8f5e9' : '#f5f5f5',
                        color: protection.enabled ? '#2e7d32' : '#999',
                      }}>
                        {protection.enabled ? '已启用' : '已禁用'}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: `${config.color}15`,
                        color: config.color,
                        fontWeight: 500,
                      }}>
                        {config.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      {protection.mode === 'confirm' && (protection.confirmMessage || '操作前需要确认')}
                      {protection.mode === 'password' && '访问时需要输入口令验证'}
                      {protection.mode === 'recovery' && `安全问题: ${protection.recoveryQuestion}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {protection.enabled && protection.mode !== 'confirm' && (
                      <button
                        onClick={() => {
                          setVerifyModalId(protection.id);
                          setVerifyInput('');
                          setVerifyResult(null);
                        }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: '1px solid #bbdefb',
                          background: '#e3f2fd',
                          color: '#1565c0',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        🔍 测试验证
                      </button>
                    )}
                    <button
                      onClick={() => onToggleProtection(protection.id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #e0e0e0',
                        background: protection.enabled ? '#fff' : '#4caf50',
                        color: protection.enabled ? '#666' : '#fff',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      {protection.enabled ? '⏸️ 禁用' : '▶️ 启用'}
                    </button>
                    <button
                      onClick={() => handleEdit(protection)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #e0e0e0',
                        background: '#fff',
                        color: '#1976d2',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      ✏️ 编辑
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定要删除此保护规则吗？删除后该目录将不再受保护。')) {
                          onDeleteProtection(protection.id);
                        }
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ef9a9a',
                        background: '#fff',
                        color: '#c62828',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      🗑️ 删除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              width: '520px',
              maxWidth: '90vw',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 20px' }}>{editingProtection ? '编辑保护规则' : '添加敏感文件保护'}</h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                保护模式
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {(['confirm', 'password', 'recovery'] as ProtectionMode[]).map(mode => {
                  const config = modeConfig[mode];
                  return (
                    <button
                      key={mode}
                      onClick={() => setFormMode(mode)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '8px',
                        border: formMode === mode ? `2px solid ${config.color}` : '2px solid #e0e0e0',
                        background: formMode === mode ? `${config.color}10` : '#fff',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '22px', marginBottom: '4px' }}>{config.icon}</div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: formMode === mode ? config.color : '#333' }}>
                        {config.label}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', paddingLeft: '4px' }}>
                {modeConfig[formMode].description}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                受保护目录
              </label>
              <select
                value={formDirectoryPath}
                onChange={(e) => setFormDirectoryPath(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">请选择目录</option>
                {availableDirectories.map(dir => (
                  <option key={dir.path} value={dir.path}>{dir.name} ({dir.path})</option>
                ))}
              </select>
            </div>

            {formMode === 'confirm' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                  确认提示语
                </label>
                <input
                  type="text"
                  placeholder="例如：您正在访问敏感目录，确认继续操作？"
                  value={formConfirmMessage}
                  onChange={(e) => setFormConfirmMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {formMode === 'password' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                  访问口令
                </label>
                <input
                  type="password"
                  placeholder="设置访问口令"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  访问该目录时需要输入此口令
                </div>
              </div>
            )}

            {formMode === 'recovery' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                    安全问题
                  </label>
                  <input
                    type="text"
                    placeholder="例如：您的第一所学校是？"
                    value={formRecoveryQuestion}
                    onChange={(e) => setFormRecoveryQuestion(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e0e0e0',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                    安全答案
                  </label>
                  <input
                    type="text"
                    placeholder="输入安全问题的答案"
                    value={formRecoveryAnswer}
                    onChange={(e) => setFormRecoveryAnswer(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e0e0e0',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    访问该目录时需正确回答此问题
                  </div>
                </div>
              </>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formEnabled}
                  onChange={(e) => setFormEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px' }}>立即启用此保护</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0',
                  background: '#fff',
                  color: '#333',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!isFormValid()}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isFormValid() ? '#1976d2' : '#bdbdbd',
                  color: '#fff',
                  cursor: isFormValid() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                {editingProtection ? '保存修改' : '添加保护'}
              </button>
            </div>
          </div>
        </div>
      )}

      {verifyModalId && (() => {
        const protection = protections.find(p => p.id === verifyModalId);
        if (!protection) return null;
        const config = modeConfig[protection.mode];
        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={handleCloseVerifyModal}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '24px',
                width: '420px',
                maxWidth: '90vw',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${config.color}15`,
                  fontSize: '22px',
                }}>
                  {config.icon}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>验证保护 - {protection.directoryName}</h3>
                  <div style={{ fontSize: '13px', color: '#666' }}>{config.label}模式</div>
                </div>
              </div>

              {protection.mode === 'confirm' && (
                <div style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: '#fff3e0',
                  border: '1px solid #ffe0b2',
                  marginBottom: '16px',
                }}>
                  <div style={{ fontSize: '14px', color: '#e65100', fontWeight: 500 }}>
                    {protection.confirmMessage || '确认访问此目录？'}
                  </div>
                </div>
              )}

              {protection.mode === 'password' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                    请输入访问口令
                  </label>
                  <input
                    type="password"
                    placeholder="输入口令"
                    value={verifyInput}
                    onChange={(e) => { setVerifyInput(e.target.value); setVerifyResult(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e0e0e0',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              {protection.mode === 'recovery' && (
                <>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: '#e3f2fd',
                    border: '1px solid #bbdefb',
                    marginBottom: '12px',
                  }}>
                    <div style={{ fontSize: '13px', color: '#1565c0', fontWeight: 500 }}>
                      安全问题: {protection.recoveryQuestion}
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                      请输入答案
                    </label>
                    <input
                      type="text"
                      placeholder="输入安全问题的答案"
                      value={verifyInput}
                      onChange={(e) => { setVerifyInput(e.target.value); setVerifyResult(null); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e0e0e0',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </>
              )}

              {verifyResult && (
                <div style={{
                  padding: '12px',
                  borderRadius: '6px',
                  background: verifyResult.verified ? '#e8f5e9' : '#ffebee',
                  border: `1px solid ${verifyResult.verified ? '#a5d6a7' : '#ef9a9a'}`,
                  marginBottom: '16px',
                }}>
                  <span style={{ color: verifyResult.verified ? '#2e7d32' : '#c62828', fontWeight: 500 }}>
                    {verifyResult.verified ? '✅' : '❌'} {verifyResult.message}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCloseVerifyModal}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                    background: '#fff',
                    color: '#333',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  关闭
                </button>
                {protection.mode !== 'confirm' && (
                  <button
                    onClick={handleVerify}
                    disabled={!verifyInput.trim()}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '6px',
                      border: 'none',
                      background: verifyInput.trim() ? '#1976d2' : '#bdbdbd',
                      color: '#fff',
                      cursor: verifyInput.trim() ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    验证
                  </button>
                )}
                {protection.mode === 'confirm' && (
                  <button
                    onClick={() => {
                      const result = onVerifyProtection(protection.id, '');
                      setVerifyResult(result);
                    }}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#f57c00',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    确认操作
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
