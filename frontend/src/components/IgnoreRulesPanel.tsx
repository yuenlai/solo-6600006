import React, { useState, useMemo } from 'react';
import { IgnoreRule, IgnoreRuleType, IgnoreRuleMatchResult } from '../types';

interface Props {
  rules: IgnoreRule[];
  directories: { path: string; name: string }[];
  onAddRule: (rule: Omit<IgnoreRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateRule: (id: string, updates: Partial<IgnoreRule>) => void;
  onDeleteRule: (id: string) => void;
  onToggleRule: (id: string) => void;
  onCheckFile: (filePath: string) => IgnoreRuleMatchResult;
}

const typeConfig: Record<IgnoreRuleType, { label: string; color: string; icon: string }> = {
  extension: { label: '文件扩展名', color: '#1976d2', icon: '📄' },
  name_pattern: { label: '名称匹配', color: '#7b1fa2', icon: '🔍' },
  directory: { label: '目录名称', color: '#388e3c', icon: '📁' },
};

export const IgnoreRulesPanel: React.FC<Props> = ({
  rules,
  directories,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onToggleRule,
  onCheckFile,
}) => {
  const [selectedDirectory, setSelectedDirectory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState<IgnoreRule | null>(null);
  const [testFilePath, setTestFilePath] = useState('');
  const [testResult, setTestResult] = useState<IgnoreRuleMatchResult | null>(null);
  const [newRule, setNewRule] = useState<Omit<IgnoreRule, 'id' | 'createdAt' | 'updatedAt'>>({
    type: 'extension',
    pattern: '',
    description: '',
    directoryPath: '/',
    enabled: true,
  });

  const allDirectories = useMemo(() => {
    const dirs = [{ path: '/', name: '根目录' }, ...directories];
    const uniqueDirs = dirs.filter((dir, index, self) =>
      index === self.findIndex(d => d.path === dir.path)
    );
    return uniqueDirs;
  }, [directories]);

  const groupedRules = useMemo(() => {
    const groups: Record<string, IgnoreRule[]> = {};
    rules.forEach(rule => {
      if (!groups[rule.directoryPath]) {
        groups[rule.directoryPath] = [];
      }
      groups[rule.directoryPath].push(rule);
    });
    return groups;
  }, [rules]);

  const filteredRules = useMemo(() => {
    if (selectedDirectory === 'all') return rules;
    return rules.filter(r => r.directoryPath === selectedDirectory);
  }, [rules, selectedDirectory]);

  const stats = useMemo(() => ({
    total: rules.length,
    enabled: rules.filter(r => r.enabled).length,
    disabled: rules.filter(r => !r.enabled).length,
    byExtension: rules.filter(r => r.type === 'extension').length,
    byName: rules.filter(r => r.type === 'name_pattern').length,
    byDirectory: rules.filter(r => r.type === 'directory').length,
  }), [rules]);

  const handleTestFile = () => {
    if (!testFilePath) return;
    const result = onCheckFile(testFilePath);
    setTestResult(result);
  };

  const handleSaveRule = () => {
    if (!newRule.pattern.trim()) return;
    if (editingRule) {
      onUpdateRule(editingRule.id, newRule);
      setEditingRule(null);
    } else {
      onAddRule(newRule);
    }
    setNewRule({
      type: 'extension',
      pattern: '',
      description: '',
      directoryPath: '/',
      enabled: true,
    });
    setShowAddModal(false);
  };

  const handleEditRule = (rule: IgnoreRule) => {
    setEditingRule(rule);
    setNewRule({
      type: rule.type,
      pattern: rule.pattern,
      description: rule.description || '',
      directoryPath: rule.directoryPath,
      enabled: rule.enabled,
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingRule(null);
    setNewRule({
      type: 'extension',
      pattern: '',
      description: '',
      directoryPath: '/',
      enabled: true,
    });
  };

  const getDirectoryName = (path: string) => {
    const dir = allDirectories.find(d => d.path === path);
    return dir ? dir.name : path;
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>忽略规则管理</h3>
        <button
          onClick={() => setShowAddModal(true)}
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
          + 添加规则
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { key: 'total', label: '总规则数', count: stats.total, color: '#1976d2' },
          { key: 'enabled', label: '已启用', count: stats.enabled, color: '#2e7d32' },
          { key: 'disabled', label: '已禁用', count: stats.disabled, color: '#757575' },
          { key: 'ext', label: '扩展名规则', count: stats.byExtension, color: '#1976d2' },
          { key: 'name', label: '名称匹配', count: stats.byName, color: '#7b1fa2' },
          { key: 'dir', label: '目录规则', count: stats.byDirectory, color: '#388e3c' },
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

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '16px', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '14px' }}>🧪 规则测试</h4>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="输入文件路径测试，如: /docs/temp/file.tmp"
            value={testFilePath}
            onChange={(e) => setTestFilePath(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTestFile()}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e0e0e0',
              fontSize: '14px',
            }}
          />
          <button
            onClick={handleTestFile}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#7b1fa2',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            测试
          </button>
        </div>
        {testResult && (
          <div
            style={{
              padding: '12px',
              borderRadius: '6px',
              background: testResult.matched ? '#ffebee' : '#e8f5e9',
              border: `1px solid ${testResult.matched ? '#ef9a9a' : '#a5d6a7'}`,
            }}
          >
            {testResult.matched ? (
              <div>
                <div style={{ color: '#c62828', fontWeight: 500, marginBottom: '4px' }}>⚠️ 文件将被忽略</div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  匹配规则: <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                    {testResult.matchedRule?.pattern}
                  </code>
                  <span style={{ marginLeft: '8px', color: '#888' }}>
                    ({typeConfig[testResult.matchedRule!.type].label})
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ color: '#2e7d32', fontWeight: 500 }}>✅ 文件将参与同步</div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedDirectory('all')}
          style={{
            padding: '6px 12px',
            borderRadius: '16px',
            border: 'none',
            background: selectedDirectory === 'all' ? '#1976d2' : '#f5f5f5',
            color: selectedDirectory === 'all' ? '#fff' : '#333',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          全部目录 ({rules.length})
        </button>
        {allDirectories.map(dir => {
          const count = (groupedRules[dir.path] || []).length;
          if (count === 0 && dir.path !== '/') return null;
          return (
            <button
              key={dir.path}
              onClick={() => setSelectedDirectory(dir.path)}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                border: 'none',
                background: selectedDirectory === dir.path ? '#1976d2' : '#f5f5f5',
                color: selectedDirectory === dir.path ? '#fff' : '#333',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {dir.name} ({count})
            </button>
          );
        })}
      </div>

      {filteredRules.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <p>暂无忽略规则</p>
          <button
            onClick={() => setShowAddModal(true)}
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
            添加第一条规则
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredRules.map(rule => {
            const config = typeConfig[rule.type];
            return (
              <div
                key={rule.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  opacity: rule.enabled ? 1 : 0.6,
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `${config.color}15`,
                    fontSize: '20px',
                    flexShrink: 0,
                  }}
                >
                  {config.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <code
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#f5f5f5',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}
                    >
                      {rule.pattern}
                    </code>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: `${config.color}15`,
                        color: config.color,
                      }}
                    >
                      {config.label}
                    </span>
                    {!rule.enabled && (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: '#f5f5f5',
                          color: '#757575',
                        }}
                      >
                        已禁用
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {rule.description || '无描述'}
                    <span style={{ margin: '0 8px', color: '#ddd' }}>|</span>
                    作用于: <span style={{ color: '#1976d2' }}>{getDirectoryName(rule.directoryPath)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => onToggleRule(rule.id)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: '1px solid #e0e0e0',
                      background: rule.enabled ? '#fff' : '#4caf50',
                      color: rule.enabled ? '#666' : '#fff',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                    title={rule.enabled ? '禁用规则' : '启用规则'}
                  >
                    {rule.enabled ? '⏸️ 禁用' : '▶️ 启用'}
                  </button>
                  <button
                    onClick={() => handleEditRule(rule)}
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
                      if (confirm('确定要删除此规则吗？')) {
                        onDeleteRule(rule.id);
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
              width: '480px',
              maxWidth: '90vw',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 20px' }}>{editingRule ? '编辑规则' : '添加忽略规则'}</h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                规则类型
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {(['extension', 'name_pattern', 'directory'] as IgnoreRuleType[]).map(type => {
                  const config = typeConfig[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setNewRule({ ...newRule, type })}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '8px',
                        border: newRule.type === type ? `2px solid ${config.color}` : '2px solid #e0e0e0',
                        background: newRule.type === type ? `${config.color}10` : '#fff',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{config.icon}</div>
                      <div style={{ color: newRule.type === type ? config.color : '#333' }}>{config.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                {newRule.type === 'extension' ? '文件扩展名' : newRule.type === 'directory' ? '目录名称' : '匹配模式'}
              </label>
              <input
                type="text"
                placeholder={newRule.type === 'extension' ? '例如: .tmp 或 tmp' : newRule.type === 'directory' ? '例如: node_modules' : '例如: temp_* 或正则表达式'}
                value={newRule.pattern}
                onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
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
                作用目录
              </label>
              <select
                value={newRule.directoryPath}
                onChange={(e) => setNewRule({ ...newRule, directoryPath: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              >
                {allDirectories.map(dir => (
                  <option key={dir.path} value={dir.path}>{dir.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                描述 (可选)
              </label>
              <input
                type="text"
                placeholder="规则说明，例如: 临时文件"
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
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

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newRule.enabled}
                  onChange={(e) => setNewRule({ ...newRule, enabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px' }}>启用此规则</span>
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
                onClick={handleSaveRule}
                disabled={!newRule.pattern.trim()}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: newRule.pattern.trim() ? '#1976d2' : '#bdbdbd',
                  color: '#fff',
                  cursor: newRule.pattern.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                {editingRule ? '保存修改' : '添加规则'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
