import React from 'react';
import { Notification } from '../types';

interface Props {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
  onAction?: (action: any, notification: Notification) => void;
}

const typeConfig: Record<Notification['type'], { icon: string; color: string; bgColor: string; label: string }> = {
  sync_success: { icon: '✓', color: '#2e7d32', bgColor: '#e8f5e9', label: '同步成功' },
  sync_failed: { icon: '✗', color: '#c62828', bgColor: '#ffebee', label: '同步失败' },
  sync_conflict: { icon: '⚠', color: '#ef6c00', bgColor: '#fff3e0', label: '同步冲突' },
  storage_insufficient: { icon: '⚠', color: '#c62828', bgColor: '#ffebee', label: '空间不足' },
  system: { icon: 'ℹ', color: '#1565c0', bgColor: '#e3f2fd', label: '系统通知' },
};

const priorityConfig: Record<Notification['priority'], { color: string; label: string }> = {
  low: { color: '#757575', label: '低' },
  normal: { color: '#1976d2', label: '普通' },
  high: { color: '#ef6c00', label: '高' },
  urgent: { color: '#c62828', label: '紧急' },
};

export const NotificationItem: React.FC<Props> = ({ notification, onMarkAsRead, onRemove, onAction }) => {
  const config = typeConfig[notification.type];
  const priority = priorityConfig[notification.priority];

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

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        gap: '12px',
        padding: '14px',
        borderRadius: '8px',
        background: notification.read ? '#fff' : '#f5f9ff',
        border: '1px solid #e0e0e0',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {!notification.read && (
        <div style={{
          position: 'absolute',
          top: '14px',
          right: '14px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#1976d2',
        }} />
      )}

      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: config.bgColor,
        color: config.color,
        fontWeight: 'bold',
        fontSize: '18px',
        flexShrink: 0,
      }}>
        {config.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontWeight: 600, color: '#333', fontSize: '14px' }}>
            {notification.title}
          </span>
          <span style={{
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: priority.color + '20',
            color: priority.color,
            fontWeight: 500,
          }}>
            {priority.label}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
          {notification.message}
        </p>

        {notification.actions && notification.actions.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            {notification.actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAction) {
                    onAction(action, notification);
                  }
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: index === 0 ? '#1976d2' : '#f5f5f5',
                  color: index === 0 ? '#fff' : '#666',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '8px' }}>
          {formatTime(notification.timestamp)}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(notification.id);
        }}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: 'none',
          background: 'transparent',
          color: '#aaa',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f0f0f0';
          e.currentTarget.style.color = '#666';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#aaa';
        }}
      >
        ×
      </button>
    </div>
  );
};
