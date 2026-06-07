import React, { useState } from 'react';
import { SyncFile, FileVersion } from '../types';
import { formatSize, formatTime, getChangeTypeLabel, getChangeTypeColor } from '../utils/versionUtils';

interface Props {
  file: SyncFile;
  onSelectVersions: (oldVersionId: string, newVersionId: string) => void;
  onRestore: (version: FileVersion) => void;
  onClose: () => void;
  onShare: () => void;
}

export const VersionHistoryPanel: React.FC<Props> = ({ file, onSelectVersions, onRestore, onClose, onShare }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const sortedVersions = [...file.versions].sort((a, b) => b.version - a.version);

  const handleVersionClick = (versionId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      }
      if (prev.length >= 2) {
        return [prev[1], versionId];
      }
      return [...prev, versionId];
    });
  };

  const handleCompare = () => {
    if (selectedIds.length === 2) {
      const v1 = file.versions.find(v => v.id === selectedIds[0])!;
      const v2 = file.versions.find(v => v.id === selectedIds[1])!;
      if (v1.version < v2.version) {
        onSelectVersions(v1.id, v2.id);
      } else {
        onSelectVersions(v2.id, v1.id);
      }
    }
  };

  const getSelectedVersions = () => {
    return selectedIds.map(id => file.versions.find(v => v.id === id)).filter(Boolean) as FileVersion[];
  };

  return (
    <div style={{ padding: '16px', background: '#fafafa', minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px' }}>版本历史</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{file.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onShare}
            style={{
              padding: '6px 16px',
              border: 'none',
              borderRadius: '4px',
              background: '#43a047',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            分享
          </button>
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
            返回文件列表
          </button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div style={{
          padding: '12px 16px',
          background: '#e3f2fd',
          borderRadius: '6px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: '13px', color: '#1565c0' }}>
            已选择 {selectedIds.length}/2 个版本
            {selectedIds.length === 2 && (
              <span style={{ marginLeft: '8px' }}>
                (v{getSelectedVersions()[0].version} vs v{getSelectedVersions()[1].version})
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setSelectedIds([])}
              style={{
                padding: '6px 12px',
                border: '1px solid #1976d2',
                borderRadius: '4px',
                background: 'transparent',
                color: '#1976d2',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              清除选择
            </button>
            <button
              onClick={handleCompare}
              disabled={selectedIds.length !== 2}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                background: selectedIds.length === 2 ? '#1976d2' : '#bdbdbd',
                color: '#fff',
                cursor: selectedIds.length === 2 ? 'pointer' : 'not-allowed',
                fontSize: '12px',
              }}
            >
              对比版本
            </button>
          </div>
        </div>
      )}

      {sortedVersions.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>暂无历史版本</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sortedVersions.map((version, index) => {
            const isSelected = selectedIds.includes(version.id);
            const isLatest = index === 0;
            return (
              <div
                key={version.id}
                onClick={() => handleVersionClick(version.id)}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: isSelected ? '#e3f2fd' : '#fff',
                  border: `2px solid ${isSelected ? '#1976d2' : '#e0e0e0'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: isSelected ? '#1976d2' : '#f5f5f5',
                    color: isSelected ? '#fff' : '#666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    flexShrink: 0,
                  }}>
                    v{version.version}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 500, fontSize: '14px' }}>
                        {formatSize(version.size)}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        color: '#fff',
                        background: getChangeTypeColor(version.changeType),
                      }}>
                        {getChangeTypeLabel(version.changeType)}
                      </span>
                      {isLatest && (
                        <span style={{
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: '#fff3e0',
                          color: '#ef6c00',
                        }}>
                          最新
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      <span>作者：{version.author}</span>
                      {version.device && <span style={{ marginLeft: '12px' }}>设备：{version.device}</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {formatTime(version.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestore(version);
                    }}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #1976d2',
                      borderRadius: '4px',
                      background: isLatest ? 'transparent' : '#1976d2',
                      color: isLatest ? '#1976d2' : '#fff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      flexShrink: 0,
                    }}
                  >
                    {isLatest ? '当前版本' : '恢复此版本'}
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
