import React, { useState } from 'react';
import { StorageAnalysisData, StorageViewMode } from '../types';

interface Props {
  data: StorageAnalysisData;
}

const formatSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

const formatPercent = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

const getPlatformIcon = (platform: string): string => {
  const icons: Record<string, string> = {
    mac: '🍎',
    windows: '🪟',
    linux: '🐧',
  };
  return icons[platform] || '💻';
};

export const StorageAnalysisPanel: React.FC<Props> = ({ data }) => {
  const [viewMode, setViewMode] = useState<StorageViewMode>('directory');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const maxSize = Math.max(
    ...data.byDirectory.map(d => d.size),
    ...data.byFileType.map(f => f.size),
    ...data.byDevice.map(d => d.storageUsed)
  );

  const viewModes: { key: StorageViewMode; label: string; icon: string }[] = [
    { key: 'directory', label: '按目录', icon: '📁' },
    { key: 'filetype', label: '按文件类型', icon: '📊' },
    { key: 'device', label: '按设备', icon: '💻' },
  ];

  const renderDirectoryList = () => {
    const sorted = [...data.byDirectory].sort((a, b) => b.size - a.size);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sorted.map((item, index) => (
          <div
            key={item.path}
            onClick={() => setSelectedItem(selectedItem === item.path ? null : item.path)}
            style={{
              padding: '16px',
              borderRadius: '8px',
              background: '#fff',
              border: selectedItem === item.path ? '2px solid #1976d2' : '1px solid #e0e0e0',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}>
                📁
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>{item.name}</span>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#f5f5f5',
                    color: '#666',
                  }}>
                    #{index + 1}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{item.path}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>{formatSize(item.size)}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{formatPercent(item.size, data.totalStorageUsed)}</div>
              </div>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#f0f0f0',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${(item.size / maxSize) * 100}%`,
                background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                borderRadius: '4px',
                transition: 'width 0.5s ease',
              }} />
            </div>
            {selectedItem === item.path && (
              <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #eee',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
              }}>
                <div style={{ textAlign: 'center', padding: '8px', background: '#fafafa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{item.fileCount}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>文件数</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px', background: '#fafafa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{item.subdirectories}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>子目录</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px', background: '#fafafa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}>
                    {new Date(item.lastModified).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888' }}>最后修改</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderFileTypeList = () => {
    const sorted = [...data.byFileType].sort((a, b) => b.size - a.size);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sorted.map((item, index) => (
          <div
            key={item.extension}
            onClick={() => setSelectedItem(selectedItem === item.extension ? null : item.extension)}
            style={{
              padding: '16px',
              borderRadius: '8px',
              background: '#fff',
              border: selectedItem === item.extension ? `2px solid ${item.color}` : '1px solid #e0e0e0',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: `${item.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: item.color,
              }}>
                {item.extension.toUpperCase().replace('.', '')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>{item.category}</span>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#f5f5f5',
                    color: '#666',
                  }}>
                    #{index + 1}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{item.extension} 文件</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: item.color }}>{formatSize(item.size)}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{formatPercent(item.size, data.totalStorageUsed)}</div>
              </div>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#f0f0f0',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${(item.size / maxSize) * 100}%`,
                background: item.color,
                borderRadius: '4px',
                transition: 'width 0.5s ease',
              }} />
            </div>
            {selectedItem === item.extension && (
              <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #eee',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}>
                <div style={{ textAlign: 'center', padding: '8px', background: '#fafafa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{item.fileCount}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>文件数量</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px', background: '#fafafa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                    {item.fileCount > 0 ? formatSize(item.size / item.fileCount) : '-'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888' }}>平均大小</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderDeviceList = () => {
    const sorted = [...data.byDevice].sort((a, b) => b.storageUsed - a.storageUsed);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sorted.map((item, index) => {
          const usagePercent = (item.storageUsed / item.storageTotal) * 100;
          const usageColor = usagePercent > 90 ? '#c62828' : usagePercent > 70 ? '#ef6c00' : '#2e7d32';
          return (
            <div
              key={item.deviceId}
              onClick={() => setSelectedItem(selectedItem === item.deviceId ? null : item.deviceId)}
              style={{
                padding: '16px',
                borderRadius: '8px',
                background: '#fff',
                border: selectedItem === item.deviceId ? '2px solid #1976d2' : '1px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: '#e8f5e9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  position: 'relative',
                }}>
                  {getPlatformIcon(item.platform)}
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: item.status === 'online' ? '#4caf50' : '#9e9e9e',
                    border: '2px solid #fff',
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 500, fontSize: '14px' }}>{item.deviceName}</span>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#f5f5f5',
                      color: '#666',
                    }}>
                      #{index + 1}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: item.status === 'online' ? '#e8f5e9' : '#f5f5f5',
                      color: item.status === 'online' ? '#2e7d32' : '#666',
                    }}>
                      {item.status === 'online' ? '在线' : '离线'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                    {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>{formatSize(item.storageUsed)}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    / {formatSize(item.storageTotal)} ({usagePercent.toFixed(1)}%)
                  </div>
                </div>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#f0f0f0',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${usagePercent}%`,
                  background: usageColor,
                  borderRadius: '4px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
              {selectedItem === item.deviceId && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #eee',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                }}>
                  <div style={{ textAlign: 'center', padding: '8px', background: '#fafafa', borderRadius: '6px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{item.fileCount}</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>同步文件</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', background: '#fafafa', borderRadius: '6px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: usageColor }}>
                      {formatSize(item.storageTotal - item.storageUsed)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888' }}>可用空间</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', background: '#fafafa', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}>
                      {new Date(item.lastSync).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888' }}>最后同步</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 16px' }}>存储空间分析</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
          color: '#fff',
        }}>
          <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>总存储空间</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatSize(data.totalStorageUsed)}</div>
        </div>
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #2e7d32, #66bb6a)',
          color: '#fff',
        }}>
          <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>文件总数</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.totalFiles}</div>
        </div>
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #ef6c00, #ffa726)',
          color: '#fff',
        }}>
          <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>设备数量</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.byDevice.length}</div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        padding: '4px',
        background: '#f0f0f0',
        borderRadius: '8px',
      }}>
        {viewModes.map(mode => (
          <button
            key={mode.key}
            onClick={() => {
              setViewMode(mode.key);
              setSelectedItem(null);
            }}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: viewMode === mode.key ? 600 : 400,
              background: viewMode === mode.key ? '#fff' : 'transparent',
              color: viewMode === mode.key ? '#1976d2' : '#666',
              boxShadow: viewMode === mode.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ marginRight: '6px' }}>{mode.icon}</span>
            {mode.label}
          </button>
        ))}
      </div>

      {viewMode === 'directory' && renderDirectoryList()}
      {viewMode === 'filetype' && renderFileTypeList()}
      {viewMode === 'device' && renderDeviceList()}
    </div>
  );
};
