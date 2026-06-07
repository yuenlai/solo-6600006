import React, { useState } from 'react';
import { OfflineChange, OfflineChangeStatus, SyncProgress } from '../types';

interface Props {
  changes: OfflineChange[];
  progress: SyncProgress;
  isOnline: boolean;
  isManualOfflineMode: boolean;
  onStartSync: () => void;
  onRetry: (id: string) => void;
  onRetryAll: () => void;
  onClearSynced: () => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  onToggleOfflineMode: () => void;
}

const statusConfig: Record<OfflineChangeStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: '等待同步', color: '#1565c0', bg: '#e3f2fd', icon: '⏳' },
  syncing: { label: '同步中', color: '#0277bd', bg: '#e1f5fe', icon: '⬆' },
  success: { label: '同步成功', color: '#2e7d32', bg: '#e8f5e9', icon: '✓' },
  failed: { label: '同步失败', color: '#c62828', bg: '#ffebee', icon: '✗' },
};

const actionLabels: Record<string, string> = {
  upload: '上传',
  delete: '删除',
  modify: '修改',
};

export const OfflineSyncPanel: React.FC<Props> = ({
  changes,
  progress,
  isOnline,
  isManualOfflineMode,
  onStartSync,
  onRetry,
  onRetryAll,
  onClearSynced,
  onRemove,
  onClose,
  onToggleOfflineMode,
}) => {
  const [filter, setFilter] = useState<OfflineChangeStatus | 'all'>('all');

  const pendingCount = changes.filter(c => c.status === 'pending' || c.status === 'failed').length;
  const successCount = changes.filter(c => c.status === 'success').length;
  const failedCount = changes.filter(c => c.status === 'failed').length;

  const filteredChanges = filter === 'all'
    ? changes
    : changes.filter(c => c.status === filter);

  const sortedChanges = [...filteredChanges].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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

  const formatSize = (size?: number) => {
    if (!size) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
    return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '480px',
      height: '100vh',
      background: '#fff',
      boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e0e0e0',
        background: '#fafafa',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>待同步内容</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            ×
          </button>
        </div>
        <div style={{
          padding: '10px 12px',
          borderRadius: '8px',
          background: isOnline ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
          border: `1px solid ${isOnline ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: isOnline ? '#4caf50' : '#f44336',
              boxShadow: isOnline ? '0 0 8px #4caf50' : '0 0 8px #f44336',
            }} />
            <span style={{ fontSize: '13px', color: isOnline ? '#2e7d32' : '#c62828', fontWeight: 500 }}>
              {isManualOfflineMode ? '🔌 离线模式 (手动)' : isOnline ? '🌐 网络已连接' : '📴 网络已断开'}
            </span>
          </div>
          <button
            onClick={onToggleOfflineMode}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: isOnline ? '#f44336' : '#4caf50',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {isOnline ? '🔌 切换离线' : '▶️ 恢复联网'}
          </button>
        </div>
      </div>

      <div style={{
        padding: '16px 20px',
        background: '#fafafa',
        borderBottom: '1px solid #e0e0e0',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[
            { label: '待同步', count: pendingCount, color: '#1565c0', bg: '#e3f2fd' },
            { label: '同步中', count: changes.filter(c => c.status === 'syncing').length, color: '#0277bd', bg: '#e1f5fe' },
            { label: '已成功', count: successCount, color: '#2e7d32', bg: '#e8f5e9' },
            { label: '失败', count: failedCount, color: '#c62828', bg: '#ffebee' },
          ].map(item => (
            <div
              key={item.label}
              style={{
                padding: '12px 8px',
                borderRadius: '8px',
                background: item.bg,
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: item.color,
                lineHeight: 1.2,
              }}>
                {item.count}
              </div>
              <div style={{ fontSize: '12px', color: item.color, marginTop: '4px' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {progress.isSyncing && (
        <div style={{ padding: '16px 20px', background: '#e3f2fd', borderBottom: '1px solid #bbdefb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#1565c0' }}>
              🔄 正在同步: {progress.currentFile}
            </span>
            <span style={{ fontSize: '13px', color: '#1565c0', fontWeight: 500 }}>
              {progress.completed} 成功 / {progress.failed} 失败 / {progress.total} 总计
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#bbdefb',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
          }}>
            <div style={{
              height: '100%',
              width: `${progress.total > 0 ? (progress.completed / progress.total * 100) : 0}%`,
              background: '#4caf50',
              transition: 'width 0.3s ease',
            }} />
            <div style={{
              height: '100%',
              width: `${progress.total > 0 ? (progress.failed / progress.total * 100) : 0}%`,
              background: '#f44336',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#666' }}>
            <span>✅ 成功 {progress.completed}</span>
            <span>❌ 失败 {progress.failed}</span>
            <span>⏳ 剩余 {progress.total - progress.completed - progress.failed}</span>
          </div>
        </div>
      )}

      <div style={{ padding: '12px 20px', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={onStartSync}
            disabled={!isOnline || pendingCount === 0 || progress.isSyncing}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: isOnline && pendingCount > 0 && !progress.isSyncing ? '#1976d2' : '#bdbdbd',
              color: '#fff',
              cursor: isOnline && pendingCount > 0 && !progress.isSyncing ? 'pointer' : 'not-allowed',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {progress.isSyncing ? '🔄 同步中...' : pendingCount > 0 ? `▶️ 开始同步 (${pendingCount})` : '✅ 暂无待同步'}
          </button>
          {failedCount > 0 && (
            <button
              onClick={onRetryAll}
              disabled={!isOnline || progress.isSyncing}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #c62828',
                background: isOnline && !progress.isSyncing ? '#fff' : '#f5f5f5',
                color: isOnline && !progress.isSyncing ? '#c62828' : '#9e9e9e',
                cursor: isOnline && !progress.isSyncing ? 'pointer' : 'not-allowed',
                fontSize: '13px',
              }}
            >
              🔄 重试失败 ({failedCount})
            </button>
          )}
          {successCount > 0 && (
            <button
              onClick={onClearSynced}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #e0e0e0',
                background: '#fff',
                color: '#666',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              🗑️ 清除已同步 ({successCount})
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '12px 20px', display: 'flex', gap: '8px' }}>
        {[
          { key: 'all', label: '全部', count: changes.length },
          { key: 'pending', label: '⏳ 等待中', count: changes.filter(c => c.status === 'pending').length },
          { key: 'success', label: '✅ 已成功', count: successCount },
          { key: 'failed', label: '❌ 失败', count: failedCount },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key as OfflineChangeStatus | 'all')}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              border: 'none',
              background: filter === item.key ? '#1976d2' : '#f0f0f0',
              color: filter === item.key ? '#fff' : '#666',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 20px' }}>
        {sortedChanges.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
            <p style={{ margin: 0 }}>暂无待同步内容</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>
              离线期间的文件变更将显示在这里
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sortedChanges.map(change => {
              const config = statusConfig[change.status];
              return (
                <div
                  key={change.id}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    background: '#fff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: config.bg,
                        color: config.color,
                        fontWeight: 'bold',
                        fontSize: '14px',
                        flexShrink: 0,
                      }}
                    >
                      {config.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontWeight: 500,
                          fontSize: '14px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}>
                          {change.fileName}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: config.bg,
                            color: config.color,
                            flexShrink: 0,
                          }}
                        >
                          {config.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                        {actionLabels[change.action] || change.action}
                        {change.size ? ` · ${formatSize(change.size)}` : ''}
                        {' · '}{formatTime(change.createdAt)}
                      </div>
                      {change.errorMessage && (
                        <div style={{ fontSize: '11px', color: '#c62828', marginTop: '4px' }}>
                          {change.errorMessage}
                        </div>
                      )}
                      {change.syncedAt && (
                        <div style={{ fontSize: '11px', color: '#2e7d32', marginTop: '4px' }}>
                          同步于 {formatTime(change.syncedAt)}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      {change.status === 'failed' && (
                        <button
                          onClick={() => onRetry(change.id)}
                          disabled={!isOnline}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: isOnline ? '#fff3e0' : '#f5f5f5',
                            color: isOnline ? '#ef6c00' : '#9e9e9e',
                            cursor: isOnline ? 'pointer' : 'not-allowed',
                            fontSize: '12px',
                          }}
                        >
                          重试
                        </button>
                      )}
                      {change.status !== 'syncing' && (
                        <button
                          onClick={() => onRemove(change.id)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: 'transparent',
                            color: '#999',
                            cursor: 'pointer',
                            fontSize: '16px',
                          }}
                          title="删除"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
