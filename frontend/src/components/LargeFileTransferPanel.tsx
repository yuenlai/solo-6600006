import React, { useState } from 'react';
import { LargeFileTransferItem, LargeFileTransferStatus } from '../types';

interface Props {
  transfers: LargeFileTransferItem[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
}

const statusConfig: Record<LargeFileTransferStatus, { label: string; color: string; bg: string; icon: string }> = {
  uploading: { label: '上传中', color: '#1976d2', bg: '#e3f2fd', icon: '↑' },
  paused: { label: '已暂停', color: '#ef6c00', bg: '#fff3e0', icon: '⏸' },
  pending: { label: '排队中', color: '#7b1fa2', bg: '#f3e5f5', icon: '⏳' },
  completed: { label: '已完成', color: '#2e7d32', bg: '#e8f5e9', icon: '✓' },
  failed: { label: '失败', color: '#c62828', bg: '#ffebee', icon: '✗' },
};

export const LargeFileTransferPanel: React.FC<Props> = ({ transfers, onPause, onResume, onRetry, onCancel }) => {
  const [filter, setFilter] = useState<LargeFileTransferStatus | 'all'>('all');

  const stats = {
    total: transfers.length,
    uploading: transfers.filter(t => t.status === 'uploading').length,
    paused: transfers.filter(t => t.status === 'paused').length,
    pending: transfers.filter(t => t.status === 'pending').length,
    completed: transfers.filter(t => t.status === 'completed').length,
    failed: transfers.filter(t => t.status === 'failed').length,
  };

  const filteredTransfers = filter === 'all'
    ? transfers
    : transfers.filter(t => t.status === filter);

  const sortedTransfers = [...filteredTransfers].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
    return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
  };

  const formatSpeed = (speed: number) => {
    if (speed <= 0) return '0 B/s';
    if (speed < 1024) return `${speed.toFixed(0)} B/s`;
    if (speed < 1024 * 1024) return `${(speed / 1024).toFixed(1)} KB/s`;
    if (speed < 1024 * 1024 * 1024) return `${(speed / 1024 / 1024).toFixed(1)} MB/s`;
    return `${(speed / 1024 / 1024 / 1024).toFixed(1)} GB/s`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚开始';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString();
  };

  const getProgress = (uploaded: number, size: number) => {
    if (size <= 0) return 0;
    return Math.min(100, Math.round((uploaded / size) * 100));
  };

  const renderActions = (transfer: LargeFileTransferItem) => {
    switch (transfer.status) {
      case 'uploading':
        return (
          <>
            <button
              onClick={() => onPause(transfer.id)}
              style={actionButtonStyle}
              title="暂停"
            >
              ⏸ 暂停
            </button>
            <button
              onClick={() => onCancel(transfer.id)}
              style={{ ...actionButtonStyle, color: '#c62828' }}
              title="取消"
            >
              ✕ 取消
            </button>
          </>
        );
      case 'paused':
        return (
          <>
            <button
              onClick={() => onResume(transfer.id)}
              style={{ ...actionButtonStyle, color: '#2e7d32' }}
              title="恢复"
            >
              ▶ 恢复
            </button>
            <button
              onClick={() => onCancel(transfer.id)}
              style={{ ...actionButtonStyle, color: '#c62828' }}
              title="取消"
            >
              ✕ 取消
            </button>
          </>
        );
      case 'pending':
        return (
          <button
            onClick={() => onCancel(transfer.id)}
            style={{ ...actionButtonStyle, color: '#c62828' }}
            title="取消"
          >
            ✕ 取消
          </button>
        );
      case 'failed':
        return (
          <>
            <button
              onClick={() => onRetry(transfer.id)}
              style={{ ...actionButtonStyle, color: '#1976d2' }}
              title="重试"
              disabled={transfer.retryCount >= transfer.maxRetries}
            >
              ↻ 重试 {transfer.retryCount > 0 ? `(${transfer.retryCount}/${transfer.maxRetries})` : ''}
            </button>
            <button
              onClick={() => onCancel(transfer.id)}
              style={{ ...actionButtonStyle, color: '#c62828' }}
              title="删除"
            >
              ✕ 删除
            </button>
          </>
        );
      case 'completed':
        return (
          <button
            onClick={() => onCancel(transfer.id)}
            style={actionButtonStyle}
            title="清除记录"
          >
            ✕ 清除
          </button>
        );
      default:
        return null;
    }
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 16px' }}>大文件传输队列</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { key: 'all', label: '全部', count: stats.total, color: '#1976d2' },
          { key: 'uploading', label: '上传中', count: stats.uploading, color: '#1976d2' },
          { key: 'paused', label: '已暂停', count: stats.paused, color: '#ef6c00' },
          { key: 'pending', label: '排队中', count: stats.pending, color: '#7b1fa2' },
          { key: 'completed', label: '已完成', count: stats.completed, color: '#2e7d32' },
          { key: 'failed', label: '失败', count: stats.failed, color: '#c62828' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key as LargeFileTransferStatus | 'all')}
            style={{
              padding: '16px 12px',
              borderRadius: '8px',
              border: filter === item.key ? `2px solid ${item.color}` : '2px solid transparent',
              background: filter === item.key ? `${item.color}10` : '#fff',
              cursor: 'pointer',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: item.color }}>{item.count}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{item.label}</div>
          </button>
        ))}
      </div>

      {sortedTransfers.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>暂无大文件传输任务</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sortedTransfers.map(transfer => {
            const config = statusConfig[transfer.status];
            const progress = getProgress(transfer.uploaded, transfer.size);
            return (
              <div
                key={transfer.id}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: config.bg,
                      color: config.color,
                      fontWeight: 'bold',
                      fontSize: '18px',
                      flexShrink: 0,
                    }}
                  >
                    {config.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 500, fontSize: '14px' }}>
                        {transfer.fileName}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: config.bg,
                          color: config.color,
                        }}
                      >
                        {config.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                      {formatSize(transfer.uploaded)} / {formatSize(transfer.size)}
                      {transfer.speed > 0 && transfer.status === 'uploading' && (
                        <span style={{ marginLeft: '8px' }}>· {formatSpeed(transfer.speed)}</span>
                      )}
                      {transfer.device && <span style={{ marginLeft: '8px' }}>· {transfer.device}</span>}
                    </div>
                    {transfer.errorMessage && (
                      <div style={{ fontSize: '12px', color: '#c62828', marginTop: '4px' }}>
                        ⚠ {transfer.errorMessage}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#aaa', flexShrink: 0 }}>
                    {formatTime(transfer.startTime)}
                  </div>
                </div>

                {transfer.status !== 'completed' && transfer.status !== 'failed' && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      <span>{progress}%</span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        background: '#f0f0f0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${progress}%`,
                          background: transfer.status === 'paused' ? '#ef6c00' : '#1976d2',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  {renderActions(transfer)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
