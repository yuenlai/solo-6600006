import React, { useState, useEffect } from 'react';
import { ShareLinkAccessResult } from '../types';

interface Props {
  token: string;
  onBack: () => void;
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
  return date.toLocaleString('zh-CN');
};

export const ShareAccessPage: React.FC<Props> = ({ token, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ShareLinkAccessResult | null>(null);

  useEffect(() => {
    const accessShareLink = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8080/api/share-links/access/${token}`);
        const data = await response.json();
        setResult(data);
      } catch (error) {
        console.error('Failed to access share link:', error);
        setResult({
          valid: false,
          message: '无法连接到服务器',
        });
      } finally {
        setLoading(false);
      }
    };

    accessShareLink();
  }, [token]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e0e0e0',
            borderTop: '3px solid #1976d2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#666' }}>加载中...</p>
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

  if (!result || !result.valid) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        padding: '20px',
      }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          padding: '40px',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#ffebee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '32px',
          }}>
            ⚠️
          </div>
          <h2 style={{ margin: '0 0 12px', color: '#c62828' }}>链接无效</h2>
          <p style={{ color: '#666', margin: '0 0 24px' }}>
            {result?.message || '该分享链接不存在'}
          </p>
          <button
            onClick={onBack}
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
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const link = result.shareLink!;

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
        maxWidth: '500px',
        width: '100%',
        padding: '40px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '16px',
          background: '#e3f2fd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '40px',
        }}>
          📄
        </div>

        <h2 style={{ margin: '0 0 8px', textAlign: 'center', color: '#1a1a1a' }}>
          {link.fileName}
        </h2>
        <p style={{ textAlign: 'center', color: '#666', margin: '0 0 24px' }}>
          分享人：{link.createdBy}
        </p>

        <div style={{
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '12px',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#666', fontSize: '14px' }}>版本</span>
            <span style={{ fontWeight: 500, fontSize: '14px' }}>
              {link.versionNumber ? `v${link.versionNumber}` : '最新版本'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#666', fontSize: '14px' }}>文件大小</span>
            <span style={{ fontWeight: 500, fontSize: '14px' }}>{formatSize(link.size)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#666', fontSize: '14px' }}>创建时间</span>
            <span style={{ fontWeight: 500, fontSize: '14px' }}>{formatTime(link.createdAt)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666', fontSize: '14px' }}>有效期至</span>
            <span style={{ fontWeight: 500, fontSize: '14px', color: '#2e7d32' }}>
              {formatTime(link.expiresAt)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => alert('下载功能演示')}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              background: '#1976d2',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
            }}
          >
            ⬇️ 下载文件
          </button>
          <button
            onClick={() => alert('预览功能演示')}
            style={{
              padding: '14px 20px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              background: '#fff',
              color: '#333',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
            }}
          >
            👁️ 预览
          </button>
        </div>

        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: '#e8f5e9',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#2e7d32',
        }}>
          ✓ 链接有效，您可以安全下载
        </div>
      </div>
    </div>
  );
};
