import React from 'react';
import { DeviceHealthMetrics } from '../types';

interface Props {
  devices: DeviceHealthMetrics[];
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'mac':
      return '🍎';
    case 'linux':
      return '🐧';
    case 'windows':
      return '💻';
    default:
      return '📱';
  }
};

const getQualityColor = (score: number) => {
  if (score >= 80) return '#2e7d32';
  if (score >= 60) return '#ef6c00';
  return '#c62828';
};

const getQualityLabel = (score: number) => {
  if (score >= 80) return '优秀';
  if (score >= 60) return '一般';
  return '较差';
};

const formatLatency = (ms: number) => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
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

export const DeviceHealthPanel: React.FC<Props> = ({ devices }) => {
  const overallStats = {
    totalDevices: devices.length,
    onlineDevices: devices.filter(d => d.status === 'online').length,
    avgLatency: devices.length > 0
      ? Math.round(devices.reduce((sum, d) => sum + d.recentSyncLatency, 0) / devices.length)
      : 0,
    totalAnomalies: devices.reduce((sum, d) => sum + d.anomalyCount, 0),
  };

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 16px' }}>设备健康诊断</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { key: 'total', label: '设备总数', count: overallStats.totalDevices, color: '#1976d2', icon: '📱' },
          { key: 'online', label: '在线设备', count: overallStats.onlineDevices, color: '#2e7d32', icon: '🟢' },
          { key: 'latency', label: '平均时延', count: formatLatency(overallStats.avgLatency), color: '#7b1fa2', icon: '⏱️' },
          { key: 'anomalies', label: '异常总数', count: overallStats.totalAnomalies, color: '#c62828', icon: '⚠️' },
        ].map(item => (
          <div
            key={item.key}
            style={{
              padding: '16px 12px',
              borderRadius: '8px',
              background: '#fff',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: item.color }}>{item.count}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {devices.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>暂无设备数据</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {devices.map(device => {
            const diskPercent = Math.round((device.diskUsed / device.diskTotal) * 100);
            const qualityColor = getQualityColor(device.connectionQualityScore);

            return (
              <div
                key={device.deviceId}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '32px' }}>{getPlatformIcon(device.platform)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '16px' }}>{device.deviceName}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: device.status === 'online' ? '#e8f5e9' : '#ffebee',
                          color: device.status === 'online' ? '#2e7d32' : '#c62828',
                        }}
                      >
                        {device.status === 'online' ? '在线' : '离线'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                      最后同步: {formatTime(device.lastSyncTime)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>最近同步时延</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1976d2' }}>
                      {formatLatency(device.recentSyncLatency)}
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>异常次数</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: device.anomalyCount > 0 ? '#c62828' : '#2e7d32' }}>
                      {device.anomalyCount}
                      <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#666' }}> 次</span>
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>磁盘占用</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef6c00', marginBottom: '4px' }}>
                      {formatSize(device.diskUsed)}
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${diskPercent}%`,
                          height: '100%',
                          background: diskPercent > 80 ? '#c62828' : diskPercent > 60 ? '#ef6c00' : '#2e7d32',
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                      {diskPercent}% ({formatSize(device.diskUsed)} / {formatSize(device.diskTotal)})
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>连接质量评分</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: qualityColor }}>
                        {device.connectionQualityScore}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${device.connectionQualityScore}%`,
                              height: '100%',
                              background: qualityColor,
                              borderRadius: '4px',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                      <span style={{ color: qualityColor, fontWeight: 500 }}>{getQualityLabel(device.connectionQualityScore)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
