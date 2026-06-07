import React, { useState } from 'react';
import { Notification, NotificationType } from '../types';
import { NotificationItem } from './NotificationItem';

interface Props {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onAction?: (action: any, notification: Notification) => void;
}

type FilterType = 'all' | 'unread' | NotificationType;

const filterOptions: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'unread', label: '未读' },
  { key: 'sync_success', label: '同步成功' },
  { key: 'sync_failed', label: '同步失败' },
  { key: 'sync_conflict', label: '同步冲突' },
  { key: 'storage_insufficient', label: '空间不足' },
  { key: 'system', label: '系统' },
];

export const NotificationCenter: React.FC<Props> = ({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemove,
  onClearAll,
  onAction,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const stats = {
    all: notifications.length,
    unread: unreadCount,
    sync_success: notifications.filter(n => n.type === 'sync_success').length,
    sync_failed: notifications.filter(n => n.type === 'sync_failed').length,
    sync_conflict: notifications.filter(n => n.type === 'sync_conflict').length,
    storage_insufficient: notifications.filter(n => n.type === 'storage_insufficient').length,
    system: notifications.filter(n => n.type === 'system').length,
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '420px',
      height: '100vh',
      background: '#fff',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #e0e0e0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>通知中心</h3>
          {unreadCount > 0 && (
            <span style={{
              background: '#1976d2',
              color: '#fff',
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 500,
            }}>
              {unreadCount} 条未读
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '20px',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f0f0f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          ×
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px 20px',
        borderBottom: '1px solid #f0f0f0',
        overflowX: 'auto',
      }}>
        {filterOptions.map(option => (
          <button
            key={option.key}
            onClick={() => setFilter(option.key)}
            style={{
              padding: '6px 14px',
              borderRadius: '16px',
              border: 'none',
              background: filter === option.key ? '#1976d2' : '#f5f5f5',
              color: filter === option.key ? '#fff' : '#666',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            {option.label}
            {stats[option.key] > 0 && (
              <span style={{ marginLeft: '4px', opacity: 0.8 }}>
                ({stats[option.key]})
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        borderBottom: '1px solid #f0f0f0',
        background: '#fafafa',
      }}>
        <span style={{ fontSize: '12px', color: '#666' }}>
          共 {filteredNotifications.length} 条通知
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: '#1976d2',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e3f2fd';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              全部标为已读
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: '#c62828',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffebee';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              清空全部
            </button>
          )}
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
      }}>
        {filteredNotifications.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            color: '#999',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
            <p style={{ margin: 0, fontSize: '14px' }}>暂无通知</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onRemove={onRemove}
                onAction={onAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
