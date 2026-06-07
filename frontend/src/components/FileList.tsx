import React from 'react';
import { SyncFile } from '../types';

interface Props {
  files: SyncFile[];
  onViewHistory: (fileId: string) => void;
  onShare: (fileId: string) => void;
}

export const FileList: React.FC<Props> = ({ files, onViewHistory, onShare }) => (
  <div style={{ padding: '16px' }}>
    <h3 style={{ margin: '0 0 12px' }}>Files</h3>
    {files.length === 0 ? <p style={{ color: '#999' }}>No files</p> :
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
            <th style={{ padding: '8px' }}>Name</th><th style={{ padding: '8px' }}>Size</th>
            <th style={{ padding: '8px' }}>Modified</th><th style={{ padding: '8px' }}>Status</th>
            <th style={{ padding: '8px' }}>Versions</th>
            <th style={{ padding: '8px' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {files.map(f => (
            <tr key={f.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '8px' }}>{f.name}</td>
              <td style={{ padding: '8px', fontSize: '12px' }}>{(f.size / 1024).toFixed(1)} KB</td>
              <td style={{ padding: '8px', fontSize: '12px' }}>{new Date(f.modifiedAt).toLocaleString()}</td>
              <td style={{ padding: '8px' }}>
                <span style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '10px', color: '#fff',
                  background: f.status === 'synced' ? '#4caf50' : f.status === 'modified' ? '#ff9800' : f.status === 'conflict' ? '#e53935' : '#9e9e9e'
                }}>{f.status}</span>
              </td>
              <td style={{ padding: '8px', fontSize: '12px' }}>v{f.versions.length}</td>
              <td style={{ padding: '8px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => onViewHistory(f.id)}
                    disabled={f.versions.length === 0}
                    style={{
                      padding: '4px 12px',
                      fontSize: '11px',
                      border: '1px solid #1976d2',
                      borderRadius: '4px',
                      background: f.versions.length > 0 ? 'transparent' : '#f5f5f5',
                      color: f.versions.length > 0 ? '#1976d2' : '#999',
                      cursor: f.versions.length > 0 ? 'pointer' : 'not-allowed',
                    }}
                  >
                    历史版本
                  </button>
                  <button
                    onClick={() => onShare(f.id)}
                    disabled={f.versions.length === 0}
                    style={{
                      padding: '4px 12px',
                      fontSize: '11px',
                      border: '1px solid #43a047',
                      borderRadius: '4px',
                      background: f.versions.length > 0 ? 'transparent' : '#f5f5f5',
                      color: f.versions.length > 0 ? '#43a047' : '#999',
                      cursor: f.versions.length > 0 ? 'pointer' : 'not-allowed',
                    }}
                  >
                    分享
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    }
  </div>
);
