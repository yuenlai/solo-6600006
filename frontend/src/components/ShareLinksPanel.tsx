import React, { useState } from 'react';
import { ShareLink, FileVersion, SyncFile } from '../types';
import { useSyncStore } from '../store/sync';

interface Props {
  file: SyncFile;
  versions: FileVersion[];
}

const formatSize = (size?: number) => {
  if (!size) return '';
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

const formatExpiryTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  
  if (diffMs <= 0) return '已过期';
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}分钟后过期`;
  if (diffHours < 24) return `${diffHours}小时后过期`;
  return `${diffDays}天后过期`;
};

const getShareUrl = (token: string) => {
  return `${window.location.origin}/share/${token}`;
};

export const ShareLinksPanel: React.FC<Props> = ({ file, versions }) => {
  const { shareLinks, closeShareLinksPanel, addShareLink, deleteShareLink, updateShareLink } = useSyncStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [maxAccessCount, setMaxAccessCount] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileLinks = shareLinks.filter(link => link.fileId === file.id);
  const sortedLinks = [...fileLinks].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleCreateLink = () => {
    const version = selectedVersionId 
      ? versions.find(v => v.id === selectedVersionId)
      : versions[0];
    
    if (!version) return;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 3600000);
    
    const newLink: ShareLink = {
      id: `sl-${Date.now()}`,
      token: Math.random().toString(36).substring(2, 18),
      fileId: file.id,
      fileName: file.name,
      filePath: file.path,
      versionId: version.id,
      versionNumber: version.version,
      size: version.size,
      hash: version.hash,
      createdBy: '当前用户',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      accessCount: 0,
      maxAccessCount: maxAccessCount ? parseInt(maxAccessCount) : undefined,
      isActive: true,
    };

    addShareLink(newLink);
    setShowCreateForm(false);
    setSelectedVersionId(null);
    setMaxAccessCount('');
  };

  const handleCopyLink = (link: ShareLink) => {
    const url = getShareUrl(link.token);
    navigator.clipboard.writeText(url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = (link: ShareLink) => {
    updateShareLink(link.id, { isActive: !link.isActive });
  };

  const handleDelete = (linkId: string) => {
    if (confirm('确定要删除此分享链接吗？')) {
      deleteShareLink(linkId);
    }
  };

  const getStatusBadge = (link: ShareLink) => {
    const now = new Date();
    const expiresAt = new Date(link.expiresAt);
    const expired = now > expiresAt;
    const maxReached = link.maxAccessCount ? link.accessCount >= link.maxAccessCount : false;

    if (!link.isActive || expired || maxReached) {
      return { label: '已失效', color: '#c62828', bg: '#ffebee' };
    }
    return { label: '有效', color: '#2e7d32', bg: '#e8f5e9' };
  };

  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  return (
    <div style={{ padding: '16px', background: '#fafafa', minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px' }}>分享链接</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{file.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              padding: '6px 16px',
              border: 'none',
              borderRadius: '4px',
              background: '#1976d2',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            生成分享链接
          </button>
          <button
            onClick={closeShareLinksPanel}
            style={{
              padding: '6px 16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            返回
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div style={{
          padding: '20px',
          background: '#fff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginBottom: '20px',
        }}>
          <h4 style={{ margin: '0 0 16px' }}>生成分享链接</h4>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px' }}>
              选择版本
            </label>
            <select
              value={selectedVersionId || ''}
              onChange={(e) => setSelectedVersionId(e.target.value || null)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            >
              <option value="">最新版本</option>
              {sortedVersions.map(v => (
                <option key={v.id} value={v.id}>
                  v{v.version} - {formatSize(v.size)} - {formatTime(v.createdAt)}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px' }}>
              有效期
            </label>
            <select
              value={expiresInHours}
              onChange={(e) => setExpiresInHours(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            >
              <option value={1}>1 小时</option>
              <option value={6}>6 小时</option>
              <option value={24}>1 天</option>
              <option value={72}>3 天</option>
              <option value={168}>7 天</option>
              <option value={720}>30 天</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px' }}>
              最大访问次数（留空表示不限制）
            </label>
            <input
              type="number"
              value={maxAccessCount}
              onChange={(e) => setMaxAccessCount(e.target.value)}
              placeholder="不限制"
              min="1"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setSelectedVersionId(null);
                setMaxAccessCount('');
              }}
              style={{
                padding: '6px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              取消
            </button>
            <button
              onClick={handleCreateLink}
              style={{
                padding: '6px 16px',
                border: 'none',
                borderRadius: '4px',
                background: '#1976d2',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              生成
            </button>
          </div>
        </div>
      )}

      {sortedLinks.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>暂无分享链接</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sortedLinks.map(link => {
            const status = getStatusBadge(link);
            const shareUrl = getShareUrl(link.token);
            return (
              <div
                key={link.id}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 500, fontSize: '14px' }}>
                        {link.versionNumber ? `v${link.versionNumber}` : '最新版本'}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        color: status.color,
                        background: status.bg,
                      }}>
                        {status.label}
                      </span>
                      <span style={{ fontSize: '12px', color: '#888' }}>
                        {formatSize(link.size)}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      <span>创建者：{link.createdBy}</span>
                      <span style={{ marginLeft: '12px' }}>创建于：{formatTime(link.createdAt)}</span>
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: link.isActive ? '#666' : '#c62828',
                      marginBottom: '8px',
                    }}>
                      {formatExpiryTime(link.expiresAt)}
                      {link.maxAccessCount && (
                        <span style={{ marginLeft: '12px' }}>
                          访问次数：{link.accessCount}/{link.maxAccessCount}
                        </span>
                      )}
                      {!link.maxAccessCount && (
                        <span style={{ marginLeft: '12px' }}>
                          访问次数：{link.accessCount}
                        </span>
                      )}
                    </div>
                    <div style={{
                      padding: '8px 12px',
                      background: '#f5f5f5',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#666',
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                    }}>
                      {shareUrl}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleCopyLink(link)}
                    disabled={!link.isActive}
                    style={{
                      padding: '4px 12px',
                      border: '1px solid #1976d2',
                      borderRadius: '4px',
                      background: copiedId === link.id ? '#e8f5e9' : 'transparent',
                      color: copiedId === link.id ? '#2e7d32' : '#1976d2',
                      cursor: link.isActive ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      opacity: link.isActive ? 1 : 0.5,
                    }}
                  >
                    {copiedId === link.id ? '已复制' : '复制链接'}
                  </button>
                  <button
                    onClick={() => handleToggleActive(link)}
                    style={{
                      padding: '4px 12px',
                      border: `1px solid ${link.isActive ? '#ef6c00' : '#2e7d32'}`,
                      borderRadius: '4px',
                      background: 'transparent',
                      color: link.isActive ? '#ef6c00' : '#2e7d32',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {link.isActive ? '禁用' : '启用'}
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    style={{
                      padding: '4px 12px',
                      border: '1px solid #c62828',
                      borderRadius: '4px',
                      background: 'transparent',
                      color: '#c62828',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    删除
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
