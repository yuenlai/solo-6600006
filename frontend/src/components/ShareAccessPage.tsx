import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShareLinkAccessResult, ShareLink } from '../types';
import { useSyncStore } from '../store/sync';

interface Props {
  token: string;
  onBack: () => void;
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
  return date.toLocaleString('zh-CN');
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

export const ShareAccessPage: React.FC<Props> = ({ token, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ShareLinkAccessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState(true);
  const { shareLinks, updateShareLink } = useSyncStore();

  useEffect(() => {
    const accessShareLink = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE}/share-links/access/${token}`, { timeout: 3000 });
        const data: ShareLinkAccessResult = response.data;
        setResult(data);
        setApiAvailable(true);
        
        if (data.valid && data.shareLink) {
          const updatedLink: ShareLink = data.shareLink;
          updateShareLink(updatedLink.id, {
            accessCount: updatedLink.accessCount,
            isActive: updatedLink.isActive,
          });
        }
      } catch (err) {
        console.warn('Backend API not available, trying local fallback:', err);
        setApiAvailable(false);
        
        const localLink = shareLinks.find(l => l.token === token);
        if (localLink) {
          const now = new Date();
          const expiresAt = new Date(localLink.expiresAt);
          const expired = now > expiresAt;
          const maxReached = localLink.maxAccessCount ? localLink.accessCount >= localLink.maxAccessCount : false;
          
          if (!localLink.isActive || expired || maxReached) {
            let message = '分享链接已失效';
            if (!localLink.isActive) message = '分享链接已被禁用';
            else if (expired) message = '分享链接已过期';
            else if (maxReached) message = '分享链接已达到最大访问次数';
            
            setResult({
              valid: false,
              message,
              shareLink: undefined,
            });
          } else {
            const newAccessCount = localLink.accessCount + 1;
            const newIsActive = localLink.maxAccessCount ? newAccessCount < localLink.maxAccessCount : true;
            
            updateShareLink(localLink.id, {
              accessCount: newAccessCount,
              isActive: newIsActive,
            });
            
            const updatedLink = { ...localLink, accessCount: newAccessCount, isActive: newIsActive };
            
            setResult({
              valid: true,
              message: '访问成功',
              shareLink: updatedLink,
            });
          }
        } else {
          setError('该分享链接不存在');
        }
      } finally {
        setLoading(false);
      }
    };

    accessShareLink();
  }, [token, shareLinks, updateShareLink]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ fontSize: '16px' }}>加载中...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !result || !result.valid) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        padding: '20px',
      }}>
        <div style={{
          maxWidth: '440px',
          width: '100%',
          padding: '48px 32px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#ffebee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '40px',
          }}>
            🔒
          </div>
          <h2 style={{ margin: '0 0 12px', color: '#c62828', fontSize: '24px' }}>链接已失效</h2>
          <p style={{ color: '#666', margin: '0 0 32px', fontSize: '15px', lineHeight: '1.6' }}>
            {result?.message || error || '该分享链接不存在或已被删除'}
          </p>
          <button
            onClick={onBack}
            style={{
              padding: '12px 32px',
              border: 'none',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const link = result.shareLink!;
  const isLinkValid = link.isActive && 
    new Date(link.expiresAt) > new Date() && 
    (!link.maxAccessCount || link.accessCount < link.maxAccessCount);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        padding: '40px',
        background: '#fff',
        borderRadius: '20px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          width: '88px',
          height: '88px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '44px',
        }}>
          📄
        </div>

        <h2 style={{ 
          margin: '0 0 8px', 
          textAlign: 'center', 
          color: '#1a1a1a',
          fontSize: '22px',
          fontWeight: 600,
          wordBreak: 'break-all',
        }}>
          {link.fileName}
        </h2>
        <p style={{ textAlign: 'center', color: '#666', margin: '0 0 28px', fontSize: '14px' }}>
          分享人：<span style={{ color: '#333', fontWeight: 500 }}>{link.createdBy}</span>
        </p>

        <div style={{
          padding: '24px',
          background: '#f8f9fa',
          borderRadius: '12px',
          marginBottom: '28px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#888', fontSize: '14px' }}>版本</span>
            <span style={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>
              {link.versionNumber ? `v${link.versionNumber}` : '最新版本'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#888', fontSize: '14px' }}>文件大小</span>
            <span style={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>{formatSize(link.size)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#888', fontSize: '14px' }}>创建时间</span>
            <span style={{ fontWeight: 500, fontSize: '14px', color: '#555' }}>{formatTime(link.createdAt)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#888', fontSize: '14px' }}>有效期至</span>
            <span style={{ fontWeight: 500, fontSize: '14px', color: '#2e7d32' }}>
              {formatTime(link.expiresAt)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888', fontSize: '14px' }}>访问次数</span>
            <span style={{ fontWeight: 600, fontSize: '14px', color: '#1976d2' }}>
              {link.accessCount} 次
              {link.maxAccessCount && ` / ${link.maxAccessCount}`}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => alert('下载功能演示 - 实际项目中会下载对应版本 v' + (link.versionNumber || 'latest') + ' 的文件')}
            disabled={!isLinkValid}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              borderRadius: '10px',
              background: isLinkValid 
                ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' 
                : '#bdbdbd',
              color: '#fff',
              cursor: isLinkValid ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 600,
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: isLinkValid ? '0 4px 12px rgba(25,118,210,0.3)' : 'none',
            }}
            onMouseEnter={(e) => { 
              if (isLinkValid) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(25,118,210,0.4)';
              }
            }}
            onMouseLeave={(e) => { 
              if (isLinkValid) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(25,118,210,0.3)';
              }
            }}
          >
            ⬇️ 下载文件
          </button>
          <button
            onClick={() => alert('预览功能演示 - 实际项目中会打开文件预览')}
            disabled={!isLinkValid}
            style={{
              padding: '16px 24px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              background: '#fff',
              color: isLinkValid ? '#555' : '#999',
              cursor: isLinkValid ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { 
              if (isLinkValid) {
                e.currentTarget.style.borderColor = '#1976d2';
                e.currentTarget.style.color = '#1976d2';
              }
            }}
            onMouseLeave={(e) => { 
              if (isLinkValid) {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.color = '#555';
              }
            }}
          >
            👁️ 预览
          </button>
        </div>

        {isLinkValid ? (
          <div style={{
            marginTop: '24px',
            padding: '14px 16px',
            background: '#e8f5e9',
            borderRadius: '10px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#2e7d32',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <span>✓</span>
            <span>链接有效，您可以安全下载 · {formatExpiryTime(link.expiresAt)}</span>
          </div>
        ) : (
          <div style={{
            marginTop: '24px',
            padding: '14px 16px',
            background: '#ffebee',
            borderRadius: '10px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#c62828',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <span>⚠️</span>
            <span>链接已失效，无法下载</span>
          </div>
        )}

        <button
          onClick={onBack}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '12px',
            border: 'none',
            background: 'transparent',
            color: '#888',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          ← 返回首页
        </button>

        {!apiAvailable && (
          <div style={{
            marginTop: '12px',
            textAlign: 'center',
            fontSize: '11px',
            color: '#999',
          }}>
            💡 当前为本地演示模式
          </div>
        )}
      </div>
    </div>
  );
};
