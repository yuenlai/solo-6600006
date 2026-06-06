import React from 'react';
import { SyncFile } from '../types';

interface Props { files: SyncFile[]; }

export const FileList: React.FC<Props> = ({ files }) => (
  <div style={{ padding: '16px' }}>
    <h3 style={{ margin: '0 0 12px' }}>Files</h3>
    {files.length === 0 ? <p style={{ color: '#999' }}>No files</p> :
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
            <th style={{ padding: '8px' }}>Name</th><th style={{ padding: '8px' }}>Size</th>
            <th style={{ padding: '8px' }}>Modified</th><th style={{ padding: '8px' }}>Status</th>
            <th style={{ padding: '8px' }}>Versions</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    }
  </div>
);
