import React, { useState } from 'react';
import { SyncActivity, SyncActivityStatus } from '../types';

interface Props {
  activities: SyncActivity[];
}

const statusConfig: Record<SyncActivityStatus, { label: string; color: string; bg: string; icon: string }> = {
  success: { label: '成功', color: '#2e7d32', bg: '#e8f5e9', icon: '✓' },
  failed: { label: '失败', color: '#c62828', bg: '#ffebee', icon: '✗' },
  conflict: { label: '冲突', color: '#ef6c00', bg: '#fff3e0', icon: '⚠' },
  pending: { label: '排队中', color: '#1565c0', bg: '#e3f2fd', icon: '⏳' },
};

const actionLabels: Record<string, string> = {
  upload: '上传',
  download: '下载',
  delete: '删除',
  modify: '修改',
};

export const SyncActivityPanel: React.FC<Props> = ({ activities }) => {
  const [filter, setFilter] = useState<SyncActivityStatus | 'all'>('all');

  const stats = {
    total: activities.length,
    success: activities.filter(a => a.status === 'success').length,
    failed: activities.filter(a => a.status === 'failed').length,
    conflict: activities.filter(a => a.status === 'conflict').length,
    pending: activities.filter(a => a.status === 'pending').length,
  };

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.status === filter);

  const sortedActivities = [...filteredActivities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
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
    <div style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 16px' }}>同步动态</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { key: 'total', label: '全部', count: stats.total, color: '#1976d2' },
          { key: 'success', label: '成功', count: stats.success, color: '#2e7d32' },
          { key: 'failed', label: '失败', count: stats.failed, color: '#c62828' },
          { key: 'conflict', label: '冲突', count: stats.conflict, color: '#ef6c00' },
          { key: 'pending', label: '排队中', count: stats.pending, color: '#1565c0' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key as SyncActivityStatus | 'all')}
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

      {sortedActivities.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>暂无同步记录</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sortedActivities.map(activity => {
            const config = statusConfig[activity.status];
            return (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: config.bg,
                    color: config.color,
                    fontWeight: 'bold',
                    fontSize: '16px',
                    flexShrink: 0,
                  }}
                >
                  {config.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activity.fileName}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: config.bg,
                        color: config.color,
                      }}
                    >
                      {config.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                    {actionLabels[activity.action] || activity.action}
                    {activity.size ? ` · ${formatSize(activity.size)}` : ''}
                    {activity.device ? ` · ${activity.device}` : ''}
                  </div>
                  {activity.errorMessage && (
                    <div style={{ fontSize: '11px', color: '#c62828', marginTop: '4px' }}>
                      {activity.errorMessage}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#aaa', flexShrink: 0 }}>
                  {formatTime(activity.timestamp)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
