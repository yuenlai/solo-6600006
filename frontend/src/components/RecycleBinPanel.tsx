import React, { useState, useEffect } from 'react';
import { RecycleBinItem, RestoreResult } from '../types';

interface Props {
  items: RecycleBinItem[];
  onRestore: (itemId: string) => RestoreResult;
  onDeletePermanently: (itemId: string) => void;
  onClearExpired: () => void;
}

export const RecycleBinPanel: React.FC<Props> = ({ items, onRestore, onDeletePermanently, onClearExpired }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'restored'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    onClearExpired();
  }, [onClearExpired]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRestore = (item: RecycleBinItem) => {
    const result = onRestore(item.id);
    showNotification(result.success ? 'success' : 'error', result.message);
  };

  const handleDeletePermanently = (item: RecycleBinItem) => {
    if (window.confirm(`确定要永久删除 "${item.fileName}" 吗？此操作不可撤销。`)) {
      onDeletePermanently(item.id);
      showNotification('success', '文件已永久删除');
    }
  };

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
    return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRemainingTime = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    
    if (diffMs <= 0) return '已过期';
    
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHours = Math.floor((diffMs % 86400000) / 3600000);
    
    if (diffDays > 0) return `剩余 ${diffDays} 天`;
    if (diffHours > 0) return `剩余 ${diffHours} 小时`;
    return '即将过期';
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'active') return !item.restored && new Date(item.expiresAt) > new Date();
    if (filter === 'restored') return item.restored;
    return true;
  });

  const sortedItems = [...filteredItems].sort(
    (a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
  );

  const stats = {
    total: items.length,
    active: items.filter(i => !i.restored && new Date(i.expiresAt) > new Date()).length,
    restored: items.filter(i => i.restored).length,
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>同步回收站</h3>
        <div style={{ fontSize: '12px', color: '#888' }}>
          文件保留期限：30 天
        </div>
      </div>

      {notification && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            background: notification.type === 'success' ? '#e8f5e9' : '#ffebee',
            color: notification.type === 'success' ? '#2e7d32' : '#c62828',
            fontSize: '14px',
          }}
        >
          {notification.message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { key: 'all', label: '全部', count: stats.total, color: '#1976d2' },
          { key: 'active', label: '可恢复', count: stats.active, color: '#2e7d32' },
          { key: 'restored', label: '已恢复', count: stats.restored, color: '#ef6c00' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key as 'all' | 'active' | 'restored')}
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

      {sortedItems.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>回收站为空</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sortedItems.map(item => {
            const isExpired = new Date(item.expiresAt) <= new Date();
            const remainingTime = getRemainingTime(item.expiresAt);
            
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: item.restored ? '#f5f5f5' : '#fff',
                  border: `1px solid ${item.restored ? '#e0e0e0' : '#e0e0e0'}`,
                  opacity: item.restored || isExpired ? 0.7 : 1,
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
                    background: item.restored ? '#fff3e0' : isExpired ? '#ffebee' : '#e3f2fd',
                    color: item.restored ? '#ef6c00' : isExpired ? '#c62828' : '#1565c0',
                    fontSize: '20px',
                    flexShrink: 0,
                  }}
                >
                  {item.restored ? '↩' : isExpired ? '⏰' : '🗑'}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.fileName}
                    </span>
                    {item.restored && (
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: '#fff3e0',
                          color: '#ef6c00',
                        }}
                      >
                        已恢复
                      </span>
                    )}
                    {isExpired && !item.restored && (
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: '#ffebee',
                          color: '#c62828',
                        }}
                      >
                        已过期
                      </span>
                    )}
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    {item.filePath}
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11px', color: '#999', marginTop: '4px' }}>
                    <span>📁 {formatSize(item.size)}</span>
                    <span>🖥 删除来源: {item.deletedFrom}</span>
                    <span>👤 删除人: {item.deletedBy}</span>
                    <span>🕐 删除时间: {formatTime(item.deletedAt)}</span>
                    {!item.restored && <span style={{ color: isExpired ? '#c62828' : '#2e7d32' }}>⏳ {remainingTime}</span>}
                    {item.restored && item.restoredAt && (
                      <span style={{ color: '#ef6c00' }}>✅ 恢复时间: {formatTime(item.restoredAt)}</span>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {!item.restored && !isExpired && (
                    <button
                      onClick={() => handleRestore(item)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        border: 'none',
                        borderRadius: '4px',
                        background: '#2e7d32',
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      恢复
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePermanently(item)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      border: '1px solid #c62828',
                      borderRadius: '4px',
                      background: 'transparent',
                      color: '#c62828',
                      cursor: 'pointer',
                    }}
                  >
                    永久删除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
