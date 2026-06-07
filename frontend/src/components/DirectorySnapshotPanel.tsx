import React, { useState } from 'react';
import { DirectorySnapshot, DirectoryStorageItem, RestoreSnapshotResult } from '../types';

interface Props {
  snapshots: DirectorySnapshot[];
  directories: DirectoryStorageItem[];
  onCreateSnapshot: (directoryPath: string, directoryName: string, name: string, description?: string) => DirectorySnapshot;
  onRestoreSnapshot: (snapshotId: string) => RestoreSnapshotResult;
  onDeleteSnapshot: (snapshotId: string) => void;
  onUpdateSnapshot: (snapshotId: string, updates: Partial<DirectorySnapshot>) => void;
}

export const DirectorySnapshotPanel: React.FC<Props> = ({
  snapshots,
  directories,
  onCreateSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
  onUpdateSnapshot,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDirectory, setSelectedDirectory] = useState('');
  const [snapshotName, setSnapshotName] = useState('');
  const [snapshotDescription, setSnapshotDescription] = useState('');
  const [expandedSnapshot, setExpandedSnapshot] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
    return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString();
  };

  const handleCreateSnapshot = () => {
    if (!selectedDirectory || !snapshotName.trim()) {
      showNotification('error', '请选择目录并输入快照名称');
      return;
    }
    const dir = directories.find(d => d.path === selectedDirectory);
    if (dir) {
      onCreateSnapshot(selectedDirectory, dir.name, snapshotName.trim(), snapshotDescription.trim() || undefined);
      setShowCreateModal(false);
      setSelectedDirectory('');
      setSnapshotName('');
      setSnapshotDescription('');
      showNotification('success', '快照创建成功');
    }
  };

  const handleRestoreSnapshot = async (snapshotId: string) => {
    setRestoringId(snapshotId);
    setTimeout(() => {
      const result = onRestoreSnapshot(snapshotId);
      setRestoringId(null);
      showNotification(result.success ? 'success' : 'error', result.message);
    }, 1000);
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    if (window.confirm('确定要删除这个快照吗？此操作无法撤销。')) {
      onDeleteSnapshot(snapshotId);
      showNotification('success', '快照已删除');
    }
  };

  const startEdit = (snapshot: DirectorySnapshot) => {
    setEditingId(snapshot.id);
    setEditName(snapshot.name);
    setEditDescription(snapshot.description || '');
  };

  const saveEdit = (snapshotId: string) => {
    if (!editName.trim()) {
      showNotification('error', '快照名称不能为空');
      return;
    }
    onUpdateSnapshot(snapshotId, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
    });
    setEditingId(null);
    showNotification('success', '快照信息已更新');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };

  return (
    <div style={{ padding: '16px', position: 'relative' }}>
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            background: notification.type === 'success' ? '#4caf50' : '#f44336',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease',
          }}
        >
          {notification.message}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>目录历史快照</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 20px',
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          + 创建快照
        </button>
      </div>

      {snapshots.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
          <p style={{ fontSize: '16px', margin: '0 0 8px' }}>暂无目录快照</p>
          <p style={{ fontSize: '13px' }}>点击"创建快照"按钮，为重要目录保存一个可命名的历史版本</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {snapshots.map(snapshot => (
            <div
              key={snapshot.id}
              style={{
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    background: '#e3f2fd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0,
                  }}
                >
                  📁
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === snapshot.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="快照名称"
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px',
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="描述（可选）"
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '13px',
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => saveEdit(snapshot.id)}
                          style={{
                            padding: '4px 12px',
                            background: '#4caf50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          保存
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            padding: '4px 12px',
                            background: '#f5f5f5',
                            color: '#666',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: '15px' }}>{snapshot.name}</span>
                        <span
                          style={{
                            padding: '2px 8px',
                            background: '#f5f5f5',
                            borderRadius: '4px',
                            fontSize: '11px',
                            color: '#666',
                          }}
                        >
                          {snapshot.directoryName}
                        </span>
                      </div>
                      {snapshot.description && (
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
                          {snapshot.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#888', flexWrap: 'wrap' }}>
                        <span>📄 {snapshot.fileCount} 个文件</span>
                        <span>💾 {formatSize(snapshot.totalSize)}</span>
                        <span>⏰ {formatTime(snapshot.createdAt)}</span>
                        {snapshot.device && <span>🖥️ {snapshot.device}</span>}
                        <span>👤 {snapshot.createdBy}</span>
                      </div>
                    </>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {editingId !== snapshot.id && (
                    <>
                      <button
                        onClick={() => handleRestoreSnapshot(snapshot.id)}
                        disabled={restoringId === snapshot.id}
                        style={{
                          padding: '8px 16px',
                          background: restoringId === snapshot.id ? '#90caf9' : '#1976d2',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: restoringId === snapshot.id ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          fontWeight: 500,
                        }}
                      >
                        {restoringId === snapshot.id ? '恢复中...' : '一键恢复'}
                      </button>
                      <button
                        onClick={() => setExpandedSnapshot(expandedSnapshot === snapshot.id ? null : snapshot.id)}
                        style={{
                          padding: '8px 12px',
                          background: '#f5f5f5',
                          color: '#333',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        {expandedSnapshot === snapshot.id ? '收起' : '详情'}
                      </button>
                      <button
                        onClick={() => startEdit(snapshot)}
                        style={{
                          padding: '8px 12px',
                          background: '#fff',
                          color: '#666',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteSnapshot(snapshot.id)}
                        style={{
                          padding: '8px 12px',
                          background: '#ffebee',
                          color: '#c62828',
                          border: '1px solid #ffcdd2',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        删除
                      </button>
                    </>
                  )}
                </div>
              </div>
              {expandedSnapshot === snapshot.id && snapshot.files.length > 0 && (
                <div
                  style={{
                    borderTop: '1px solid #f0f0f0',
                    background: '#fafafa',
                    padding: '12px 16px',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: '#555' }}>
                    包含的文件：
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {snapshot.files.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: '#fff',
                          borderRadius: '4px',
                          fontSize: '13px',
                          border: '1px solid #eee',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>📄</span>
                          <span style={{ fontFamily: 'monospace' }}>{file.path}</span>
                        </span>
                        <span style={{ color: '#888', fontSize: '12px' }}>{formatSize(file.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
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
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              width: '480px',
              maxWidth: '90vw',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 20px', fontSize: '18px' }}>创建目录快照</h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                选择目录
              </label>
              <select
                value={selectedDirectory}
                onChange={(e) => setSelectedDirectory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: '#fff',
                }}
              >
                <option value="">请选择要快照的目录</option>
                {directories.map(dir => (
                  <option key={dir.path} value={dir.path}>
                    {dir.name} ({dir.path}) - {dir.fileCount} 个文件
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                快照名称 <span style={{ color: '#f44336' }}>*</span>
              </label>
              <input
                type="text"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                placeholder="例如：项目发布前备份、设计稿定稿等"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                描述（可选）
              </label>
              <textarea
                value={snapshotDescription}
                onChange={(e) => setSnapshotDescription(e.target.value)}
                placeholder="添加一些备注信息，方便日后了解这个快照的用途..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                取消
              </button>
              <button
                onClick={handleCreateSnapshot}
                style={{
                  padding: '10px 20px',
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                创建快照
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
