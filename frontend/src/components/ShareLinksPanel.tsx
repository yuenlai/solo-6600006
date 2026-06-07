import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ShareLink, FileVersion, SyncFile, CreateShareLinkRequest } from '../types';
import { useSyncStore } from '../store/sync';

interface Props {
  file: SyncFile;
  versions: FileVersion[];
}

const API_BASE = 'http://127.0.0.1:8080/api';

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
  const { 
    shareLinks, 
    addShareLink, 
    deleteShareLink, 
    updateShareLink, 
    closeShareLinksPanel,
    setShareLinks,
  } = useSyncStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [maxAccessCount, setMaxAccessCount] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(true);

  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);
  const latestVersion = sortedVersions[0];

  const fetchShareLinks = useCallback(async () => {
    setFetchLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/share-links/file/${file.id}`, { timeout: 3000 });
      if (response.data && Array.isArray(response.data)) {
        setShareLinks(response.data);
        setApiAvailable(true);
      }
    } catch (error) {
      console.warn('Backend API not available, using local state:', error);
      setApiAvailable(false);
    } finally {
      setFetchLoading(false);
    }
  }, [file.id, setShareLinks]);

  useEffect(() => {
    fetchShareLinks();
  }, [fetchShareLinks]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchShareLinks();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchShareLinks]);

  const fileLinks = shareLinks.filter(link => link.fileId === file.id);
  const sortedLinks = [...fileLinks].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getSelectedVersion = (): FileVersion | undefined => {
    if (selectedVersionId) {
      return versions.find(v => v.id === selectedVersionId);
    }
    return latestVersion;
  };

  const handleCreateLink = async () => {
    const version = getSelectedVersion();
    
    if (!version) {
      alert('请选择有效的文件版本');
      return;
    }

    setLoading(true);
    try {
      const requestData: CreateShareLinkRequest = {
        fileId: file.id,
        fileName: file.name,
        filePath: file.path,
        versionId: version.id,
        versionNumber: version.version,
        size: version.size,
        hash: version.hash,
        createdBy: '当前用户',
        expiresInHours: expiresInHours,
        maxAccessCount: maxAccessCount ? parseInt(maxAccessCount) : undefined,
      };

      let newLink: ShareLink;
      
      if (apiAvailable) {
        const response = await axios.post(`${API_BASE}/share-links`, requestData, { timeout: 3000 });
        newLink = response.data;
      } else {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + expiresInHours * 3600000);
        newLink = {
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
      }
      
      addShareLink(newLink);
      setShowCreateForm(false);
      setSelectedVersionId(null);
      setMaxAccessCount('');
      
      setTimeout(() => {
        const linkElement = document.getElementById(`share-link-${newLink.id}`);
        if (linkElement) {
          linkElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          linkElement.style.animation = 'highlight 1.5s ease-in-out';
        }
      }, 100);
    } catch (error) {
      console.error('Failed to create share link:', error);
      alert('创建分享链接失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (link: ShareLink) => {
    const url = getShareUrl(link.token);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      alert('复制失败，请手动复制: ' + url);
    });
  };

  const handleOpenLink = (link: ShareLink) => {
    const url = getShareUrl(link.token);
    window.open(url, '_blank');
  };

  const handleToggleActive = async (link: ShareLink) => {
    const newIsActive = !link.isActive;
    try {
      if (apiAvailable) {
        await axios.put(`${API_BASE}/share-links/${link.id}`, { is_active: newIsActive }, { timeout: 3000 });
      }
      updateShareLink(link.id, { isActive: newIsActive });
    } catch (error) {
      console.error('Failed to update share link:', error);
      updateShareLink(link.id, { isActive: newIsActive });
    }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('确定要删除此分享链接吗？此操作不可撤销。')) return;
    
    try {
      if (apiAvailable) {
        await axios.delete(`${API_BASE}/share-links/${linkId}`, { timeout: 3000 });
      }
      deleteShareLink(linkId);
    } catch (error) {
      console.error('Failed to delete share link:', error);
      deleteShareLink(linkId);
    }
  };

  const getStatusBadge = (link: ShareLink) => {
    const now = new Date();
    const expiresAt = new Date(link.expiresAt);
    const expired = now > expiresAt;
    const maxReached = link.maxAccessCount ? link.accessCount >= link.maxAccessCount : false;

    if (!link.isActive) {
      return { label: '已禁用', color: '#ef6c00', bg: '#fff3e0' };
    }
    if (expired) {
      return { label: '已过期', color: '#c62828', bg: '#ffebee' };
    }
    if (maxReached) {
      return { label: '已达上限', color: '#c62828', bg: '#ffebee' };
    }
    return { label: '有效', color: '#2e7d32', bg: '#e8f5e9' };
  };

  const getVersionLabel = (link: ShareLink) => {
    if (link.versionNumber) {
      const version = versions.find(v => v.version === link.versionNumber);
      if (version) {
        return `v${version.version} (${formatSize(version.size)})`;
      }
      return `v${link.versionNumber}`;
    }
    return '最新版本';
  };

  return (
    <div style={{ padding: '16px', background: '#fafafa', minHeight: '100%' }}>
      <style>{`
        @keyframes highlight {
          0%, 100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
          50% { box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.3); }
        }
      `}</style>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: '0 0 4px' }}>分享链接</h3>
            {!apiAvailable && (
              <span style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '10px',
                background: '#fff3e0',
                color: '#ef6c00',
              }}>
                本地模式
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{file.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={fetchShareLinks}
            disabled={fetchLoading}
            style={{
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#fff',
              cursor: fetchLoading ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              color: '#666',
            }}
          >
            {fetchLoading ? '刷新中...' : '🔄 刷新'}
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={versions.length === 0}
            style={{
              padding: '6px 16px',
              border: 'none',
              borderRadius: '4px',
              background: versions.length > 0 ? '#1976d2' : '#bdbdbd',
              color: '#fff',
              cursor: versions.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '13px',
            }}
          >
            + 生成分享链接
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
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '15px' }}>🔗 生成分享链接</h4>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: 500 }}>
              选择版本
            </label>
            <select
              value={selectedVersionId || ''}
              onChange={(e) => setSelectedVersionId(e.target.value || null)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '13px',
                background: '#fff',
              }}
            >
              <option value="">
                最新版本 (v{latestVersion?.version || 0}, {formatSize(latestVersion?.size)})
              </option>
              {sortedVersions.map(v => (
                <option key={v.id} value={v.id}>
                  v{v.version} - {formatSize(v.size)} - {formatTime(v.createdAt)}
                </option>
              ))}
            </select>
            <div style={{ marginTop: '8px', padding: '8px 12px', background: '#f5f5f5', borderRadius: '4px' }}>
              <span style={{ fontSize: '12px', color: '#666' }}>
                📌 已选：
                <span style={{ color: '#1976d2', fontWeight: 500 }}>
                  {getSelectedVersion() ? `v${getSelectedVersion()!.version}` : '最新版本'}
                </span>
                <span style={{ marginLeft: '8px' }}>
                  ({formatSize(getSelectedVersion()?.size)})
                </span>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: 500 }}>
                有效期
              </label>
              <select
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '13px',
                  background: '#fff',
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
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: 500 }}>
                最大访问次数
              </label>
              <input
                type="number"
                value={maxAccessCount}
                onChange={(e) => setMaxAccessCount(e.target.value)}
                placeholder="不限制"
                min="1"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setSelectedVersionId(null);
                setMaxAccessCount('');
              }}
              style={{
                padding: '8px 20px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              取消
            </button>
            <button
              onClick={handleCreateLink}
              disabled={loading}
              style={{
                padding: '8px 24px',
                border: 'none',
                borderRadius: '6px',
                background: loading ? '#90caf9' : '#1976d2',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {loading ? '生成中...' : '✓ 生成链接'}
            </button>
          </div>
        </div>
      )}

      {fetchLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔄</div>
          <p>加载分享链接中...</p>
        </div>
      ) : sortedLinks.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          background: '#fff', 
          borderRadius: '8px',
          border: '1px dashed #e0e0e0',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔗</div>
          <h4 style={{ margin: '0 0 8px', color: '#333' }}>暂无分享链接</h4>
          <p style={{ margin: '0 0 20px', color: '#999', fontSize: '14px' }}>
            点击上方按钮生成第一个分享链接
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              padding: '10px 24px',
              border: 'none',
              borderRadius: '6px',
              background: '#1976d2',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            立即生成
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sortedLinks.map(link => {
            const status = getStatusBadge(link);
            const shareUrl = getShareUrl(link.token);
            const isLinkValid = link.isActive && 
              new Date(link.expiresAt) > new Date() && 
              (!link.maxAccessCount || link.accessCount < link.maxAccessCount);
            
            return (
              <div
                key={link.id}
                id={`share-link-${link.id}`}
                style={{
                  padding: '18px',
                  borderRadius: '10px',
                  background: '#fff',
                  border: `1px solid ${isLinkValid ? '#e0e0e0' : '#ffcdd2'}`,
                  transition: 'box-shadow 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>
                        {getVersionLabel(link)}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        color: status.color,
                        background: status.bg,
                        fontWeight: 500,
                      }}>
                        {status.label}
                      </span>
                      <span style={{ fontSize: '12px', color: '#888' }}>
                        {formatSize(link.size)}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px', lineHeight: '1.6' }}>
                      <span>👤 {link.createdBy}</span>
                      <span style={{ margin: '0 10px', color: '#ddd' }}>|</span>
                      <span>🕐 {formatTime(link.createdAt)} 创建</span>
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap',
                    }}>
                      <span style={{ 
                        color: isLinkValid ? '#2e7d32' : '#c62828',
                        fontWeight: 500,
                      }}>
                        ⏱️ {formatExpiryTime(link.expiresAt)}
                      </span>
                      <span style={{ color: '#1976d2', fontWeight: 500 }}>
                        👁️ 访问次数：{link.accessCount}
                        {link.maxAccessCount && ` / ${link.maxAccessCount}`}
                      </span>
                    </div>
                    <div style={{
                      padding: '10px 14px',
                      background: '#f8f9fa',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#555',
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      border: '1px solid #e9ecef',
                    }}>
                      🔗 {shareUrl}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleOpenLink(link)}
                    disabled={!isLinkValid}
                    style={{
                      padding: '6px 14px',
                      border: '1px solid #43a047',
                      borderRadius: '6px',
                      background: isLinkValid ? 'transparent' : '#f5f5f5',
                      color: isLinkValid ? '#43a047' : '#999',
                      cursor: isLinkValid ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    🔗 打开链接
                  </button>
                  <button
                    onClick={() => handleCopyLink(link)}
                    disabled={!isLinkValid}
                    style={{
                      padding: '6px 14px',
                      border: '1px solid #1976d2',
                      borderRadius: '6px',
                      background: copiedId === link.id ? '#e3f2fd' : (isLinkValid ? 'transparent' : '#f5f5f5'),
                      color: copiedId === link.id ? '#1976d2' : (isLinkValid ? '#1976d2' : '#999'),
                      cursor: isLinkValid ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    {copiedId === link.id ? '✓ 已复制' : '📋 复制链接'}
                  </button>
                  <button
                    onClick={() => handleToggleActive(link)}
                    style={{
                      padding: '6px 14px',
                      border: `1px solid ${link.isActive ? '#ef6c00' : '#2e7d32'}`,
                      borderRadius: '6px',
                      background: 'transparent',
                      color: link.isActive ? '#ef6c00' : '#2e7d32',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    {link.isActive ? '⏸️ 禁用' : '▶️ 启用'}
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    style={{
                      padding: '6px 14px',
                      border: '1px solid #c62828',
                      borderRadius: '6px',
                      background: 'transparent',
                      color: '#c62828',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
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
    </div>
  );
};
