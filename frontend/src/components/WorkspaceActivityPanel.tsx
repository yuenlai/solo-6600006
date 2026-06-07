import React from 'react';
import { WorkspaceFileActivity } from '../types';

interface Props {
  activities: WorkspaceFileActivity[];
}

const actionConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  upload: { label: '上传', color: '#2e7d32', bg: '#e8f5e9', icon: '⬆' },
  download: { label: '下载', color: '#1565c0', bg: '#e3f2fd', icon: '⬇' },
  delete: { label: '删除', color: '#c62828', bg: '#ffebee', icon: '🗑' },
  modify: { label: '修改', color: '#ef6c00', bg: '#fff3e0', icon: '✏' },
  rename: { label: '重命名', color: '#7b1fa2', bg: '#f3e5f5', icon: '✎' },
  share: { label: '分享', color: '#00838f', bg: '#e0f7fa', icon: '🔗' },
};

const formatTime = (timestamp: string): string => {
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

const formatSize = (size?: number): string => {
  if (!size) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

export const WorkspaceActivityPanel: React.FC<Props> = ({ activities }) => {
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div style={{ padding: '16px' }}>
      <h4 style={{ margin: '0 0 16px', fontSize: '16px' }}>文件动态</h4>

      {sortedActivities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
          <p style={{ fontSize: '48px', margin: '0 0 12px' }}>📋</p>
          <p>暂无文件动态</p>
          <p style={{ fontSize: '12px', marginTop: '4px' }}>成员的文件操作将显示在这里</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sortedActivities.map((activity) => {
            const config = actionConfig[activity.action] || actionConfig.modify;
            return (
              <div
                key={activity.id}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: config.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: config.color,
                    fontSize: '16px',
                    flexShrink: 0,
                  }}
                >
                  {config.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 500, fontSize: '13px' }}>{activity.memberName}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: config.bg,
                        color: config.color,
                      }}
                    >
                      {config.label}
                    </span>
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: '13px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {activity.fileName}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    {activity.filePath}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                    {activity.size && <span>{formatSize(activity.size)}</span>}
                    {activity.device && <span>设备: {activity.device}</span>}
                    <span>{formatTime(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
