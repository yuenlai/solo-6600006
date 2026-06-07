import React from 'react';
import { FileVersion, VersionDiff } from '../types';
import { computeVersionDiff, formatSize, formatTime, formatSizeChange, getChangeTypeLabel, getChangeTypeColor } from '../utils/versionUtils';

interface Props {
  oldVersion: FileVersion;
  newVersion: FileVersion;
  onRestore: (version: FileVersion) => void;
  onClose: () => void;
}

export const VersionComparePanel: React.FC<Props> = ({ oldVersion, newVersion, onRestore, onClose }) => {
  const diff: VersionDiff = computeVersionDiff(oldVersion, newVersion);
  const sizeChange = formatSizeChange(diff.sizeChange);

  const VersionCard: React.FC<{ version: FileVersion; label: string }> = ({ version, label }) => (
    <div style={{ flex: 1, padding: '16px', borderRadius: '8px', background: '#fff', border: '1px solid #e0e0e0' }}>
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1976d2' }}>v{version.version}</span>
        <span style={{
          fontSize: '10px',
          padding: '2px 8px',
          borderRadius: '10px',
          color: '#fff',
          background: getChangeTypeColor(version.changeType),
        }}>
          {getChangeTypeLabel(version.changeType)}
        </span>
      </div>
      <div style={{ fontSize: '13px', marginBottom: '6px' }}>
        <span style={{ color: '#888' }}>作者：</span>{version.author}
      </div>
      <div style={{ fontSize: '13px', marginBottom: '6px' }}>
        <span style={{ color: '#888' }}>时间：</span>{formatTime(version.createdAt)}
      </div>
      <div style={{ fontSize: '13px', marginBottom: '6px' }}>
        <span style={{ color: '#888' }}>大小：</span>{formatSize(version.size)}
      </div>
      {version.device && (
        <div style={{ fontSize: '13px' }}>
          <span style={{ color: '#888' }}>设备：</span>{version.device}
        </div>
      )}
      <div style={{ marginTop: '12px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>哈希</div>
        <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#666', wordBreak: 'break-all' }}>
          {version.hash.substring(0, 16)}...
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '16px', background: '#fafafa', minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>版本对比</h3>
        <button
          onClick={onClose}
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

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <VersionCard version={oldVersion} label="旧版本" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', flexShrink: 0 }}>
          <span style={{ fontSize: '24px', color: '#999' }}>→</span>
        </div>
        <VersionCard version={newVersion} label="新版本" />
      </div>

      <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 16px', fontSize: '14px' }}>变更摘要</h4>
        <div style={{ padding: '12px 16px', background: '#e3f2fd', borderRadius: '6px', borderLeft: '4px solid #1976d2', marginBottom: '16px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#1565c0' }}>{diff.summary}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>大小变化</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: sizeChange.color }}>{sizeChange.text}</div>
          </div>
          <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>变更字段</div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {diff.changedFields.map(field => (
                <span key={field} style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#fff',
                  border: '1px solid #ddd',
                }}>
                  {field}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onRestore(oldVersion)}
          style={{
            padding: '10px 20px',
            border: '1px solid #1976d2',
            borderRadius: '6px',
            background: '#fff',
            color: '#1976d2',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          恢复到 v{oldVersion.version}
        </button>
        <button
          onClick={() => onRestore(newVersion)}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            background: '#1976d2',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          恢复到 v{newVersion.version}
        </button>
      </div>
    </div>
  );
};
