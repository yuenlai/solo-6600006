import React, { useState } from 'react';
import { BandwidthStrategy, NetworkType, BandwidthLimit, Device } from '../types';

interface Props {
  strategies: BandwidthStrategy[];
  devices: Device[];
  onAddStrategy: (strategy: Omit<BandwidthStrategy, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateStrategy: (id: string, updates: Partial<BandwidthStrategy>) => void;
  onDeleteStrategy: (id: string) => void;
  onToggleStrategy: (id: string) => void;
}

const networkTypeConfig: Record<NetworkType, { label: string; icon: string; color: string }> = {
  wifi: { label: 'Wi-Fi', icon: '📶', color: '#1976d2' },
  ethernet: { label: '有线网络', icon: '🔌', color: '#388e3c' },
  cellular: { label: '蜂窝网络', icon: '📱', color: '#f57c00' },
  unknown: { label: '未知网络', icon: '❓', color: '#757575' },
};

const formatSpeed = (kbps: number): string => {
  if (kbps === 0) return '不限速';
  if (kbps < 1024) return `${kbps} KB/s`;
  return `${(kbps / 1024).toFixed(1)} MB/s`;
};

const speedOptions = [
  { label: '不限速', value: 0 },
  { label: '256 KB/s', value: 256 },
  { label: '512 KB/s', value: 512 },
  { label: '1 MB/s', value: 1024 },
  { label: '2 MB/s', value: 2048 },
  { label: '5 MB/s', value: 5120 },
  { label: '10 MB/s', value: 10240 },
  { label: '20 MB/s', value: 20480 },
  { label: '50 MB/s', value: 51200 },
];

const defaultLimit: BandwidthLimit = { upload: 0, download: 0 };

export const BandwidthStrategyPanel: React.FC<Props> = ({
  strategies,
  devices,
  onAddStrategy,
  onUpdateStrategy,
  onDeleteStrategy,
  onToggleStrategy,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [networkType, setNetworkType] = useState<NetworkType>('wifi');
  const [foregroundUpload, setForegroundUpload] = useState(0);
  const [foregroundDownload, setForegroundDownload] = useState(0);
  const [backgroundUpload, setBackgroundUpload] = useState(5120);
  const [backgroundDownload, setBackgroundDownload] = useState(10240);
  const [bgTimeStart, setBgTimeStart] = useState('22:00');
  const [bgTimeEnd, setBgTimeEnd] = useState('08:00');

  const resetForm = () => {
    setSelectedDeviceId('');
    setNetworkType('wifi');
    setForegroundUpload(0);
    setForegroundDownload(0);
    setBackgroundUpload(5120);
    setBackgroundDownload(10240);
    setBgTimeStart('22:00');
    setBgTimeEnd('08:00');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!selectedDeviceId) return;
    const device = devices.find(d => d.id === selectedDeviceId);
    if (!device) return;

    const existing = editingId
      ? strategies.find(s => s.id === editingId)
      : null;

    const strategyData = {
      deviceId: selectedDeviceId,
      deviceName: device.name,
      networkType,
      foregroundLimit: { upload: foregroundUpload, download: foregroundDownload },
      backgroundLimit: { upload: backgroundUpload, download: backgroundDownload },
      enabled: existing ? existing.enabled : true,
      backgroundTimeRange: { start: bgTimeStart, end: bgTimeEnd },
    };

    if (editingId) {
      onUpdateStrategy(editingId, strategyData);
    } else {
      onAddStrategy(strategyData);
    }
    resetForm();
  };

  const handleEdit = (strategy: BandwidthStrategy) => {
    setEditingId(strategy.id);
    setSelectedDeviceId(strategy.deviceId);
    setNetworkType(strategy.networkType);
    setForegroundUpload(strategy.foregroundLimit.upload);
    setForegroundDownload(strategy.foregroundLimit.download);
    setBackgroundUpload(strategy.backgroundLimit.upload);
    setBackgroundDownload(strategy.backgroundLimit.download);
    setBgTimeStart(strategy.backgroundTimeRange.start);
    setBgTimeEnd(strategy.backgroundTimeRange.end);
    setShowForm(true);
  };

  const getDeviceName = (deviceId: string) => {
    return devices.find(d => d.id === deviceId)?.name || deviceId;
  };

  const isUnlimited = (limit: BandwidthLimit) =>
    limit.upload === 0 && limit.download === 0;

  const groupedByDevice = strategies.reduce<Record<string, BandwidthStrategy[]>>((acc, s) => {
    if (!acc[s.deviceId]) acc[s.deviceId] = [];
    acc[s.deviceId].push(s);
    return acc;
  }, {});

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px' }}>带宽策略</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>
            按设备和网络环境设置上传下载限速，区分前台使用和后台空闲时段
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '8px 16px',
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          + 添加策略
        </button>
      </div>

      {showForm && (
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginBottom: '20px',
        }}>
          <h4 style={{ margin: '0 0 16px' }}>{editingId ? '编辑带宽策略' : '新建带宽策略'}</h4>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
              选择设备
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            >
              <option value="">请选择设备...</option>
              {devices.map(device => (
                <option key={device.id} value={device.id}>
                  {device.name} ({device.platform}) {device.status === 'online' ? '● 在线' : '○ 离线'}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              网络环境
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {(Object.keys(networkTypeConfig) as NetworkType[]).map(type => {
                const config = networkTypeConfig[type];
                return (
                  <button
                    key={type}
                    onClick={() => setNetworkType(type)}
                    style={{
                      padding: '14px 10px',
                      border: `2px solid ${networkType === type ? config.color : '#e0e0e0'}`,
                      borderRadius: '8px',
                      background: networkType === type ? `${config.color}10` : '#fff',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '22px', marginBottom: '2px' }}>{config.icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: networkType === type ? config.color : '#333' }}>{config.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              🖥️ 前台使用限速（活跃时段）
            </label>
            <div style={{ background: '#f5f5f5', padding: '14px', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>上传限速</label>
                  <select
                    value={foregroundUpload}
                    onChange={(e) => setForegroundUpload(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    {speedOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>下载限速</label>
                  <select
                    value={foregroundDownload}
                    onChange={(e) => setForegroundDownload(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    {speedOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {foregroundUpload === 0 && foregroundDownload === 0 && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#388e3c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ✓ 前台使用不限速，充分利用网络带宽
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              🌙 后台空闲限速（闲时时段）
            </label>
            <div style={{ background: '#f5f5f5', padding: '14px', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>上传限速</label>
                  <select
                    value={backgroundUpload}
                    onChange={(e) => setBackgroundUpload(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    {speedOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>下载限速</label>
                  <select
                    value={backgroundDownload}
                    onChange={(e) => setBackgroundDownload(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    {speedOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                  后台空闲时段
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="time"
                    value={bgTimeStart}
                    onChange={(e) => setBgTimeStart(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                  <span style={{ color: '#888' }}>至</span>
                  <input
                    type="time"
                    value={bgTimeEnd}
                    onChange={(e) => setBgTimeEnd(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div style={{ marginTop: '4px', fontSize: '11px', color: '#999' }}>
                  在此时段内使用后台空闲限速，其余时段使用前台限速
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={resetForm}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedDeviceId}
              style={{
                padding: '8px 16px',
                background: selectedDeviceId ? '#1976d2' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: selectedDeviceId ? 'pointer' : 'not-allowed',
                fontSize: '14px',
              }}
            >
              {editingId ? '保存修改' : '创建策略'}
            </button>
          </div>
        </div>
      )}

      {strategies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚀</div>
          <p>暂无带宽策略</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>点击上方按钮创建您的第一个带宽策略，精细控制同步速度</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.entries(groupedByDevice).map(([deviceId, deviceStrategies]) => (
            <div key={deviceId}>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: devices.find(d => d.id === deviceId)?.status === 'online' ? '#4caf50' : '#bdbdbd',
                }} />
                {getDeviceName(deviceId)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {deviceStrategies.map(strategy => {
                  const netConfig = networkTypeConfig[strategy.networkType];
                  return (
                    <div
                      key={strategy.id}
                      style={{
                        background: '#fff',
                        padding: '16px',
                        borderRadius: '8px',
                        border: `1px solid ${strategy.enabled ? '#e0e0e0' : '#f0f0f0'}`,
                        opacity: strategy.enabled ? 1 : 0.6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `${netConfig.color}15`,
                          fontSize: '22px',
                          flexShrink: 0,
                        }}>
                          {netConfig.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 500, fontSize: '15px' }}>{netConfig.label}</span>
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              background: strategy.enabled ? '#e8f5e9' : '#f5f5f5',
                              color: strategy.enabled ? '#2e7d32' : '#999',
                            }}>
                              {strategy.enabled ? '已启用' : '已禁用'}
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{
                              padding: '10px 12px',
                              borderRadius: '6px',
                              background: '#e3f2fd',
                              border: '1px solid #bbdefb',
                            }}>
                              <div style={{ fontSize: '11px', color: '#1565c0', marginBottom: '4px', fontWeight: 500 }}>
                                🖥️ 前台使用
                              </div>
                              <div style={{ fontSize: '13px', color: '#333' }}>
                                ↑ {formatSpeed(strategy.foregroundLimit.upload)}
                              </div>
                              <div style={{ fontSize: '13px', color: '#333' }}>
                                ↓ {formatSpeed(strategy.foregroundLimit.download)}
                              </div>
                            </div>
                            <div style={{
                              padding: '10px 12px',
                              borderRadius: '6px',
                              background: '#f3e5f5',
                              border: '1px solid #e1bee7',
                            }}>
                              <div style={{ fontSize: '11px', color: '#7b1fa2', marginBottom: '4px', fontWeight: 500 }}>
                                🌙 后台空闲 ({strategy.backgroundTimeRange.start}-{strategy.backgroundTimeRange.end})
                              </div>
                              <div style={{ fontSize: '13px', color: '#333' }}>
                                ↑ {formatSpeed(strategy.backgroundLimit.upload)}
                              </div>
                              <div style={{ fontSize: '13px', color: '#333' }}>
                                ↓ {formatSpeed(strategy.backgroundLimit.download)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                          <button
                            onClick={() => onToggleStrategy(strategy.id)}
                            title={strategy.enabled ? '禁用' : '启用'}
                            style={{
                              padding: '6px 10px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              background: '#fff',
                              cursor: 'pointer',
                              fontSize: '13px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {strategy.enabled ? '⏸ 禁用' : '▶ 启用'}
                          </button>
                          <button
                            onClick={() => handleEdit(strategy)}
                            title="编辑"
                            style={{
                              padding: '6px 10px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              background: '#fff',
                              cursor: 'pointer',
                              fontSize: '13px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            ✏️ 编辑
                          </button>
                          <button
                            onClick={() => onDeleteStrategy(strategy.id)}
                            title="删除"
                            style={{
                              padding: '6px 10px',
                              border: '1px solid #ffcdd2',
                              borderRadius: '4px',
                              background: '#ffebee',
                              color: '#c62828',
                              cursor: 'pointer',
                              fontSize: '13px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            🗑 删除
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
