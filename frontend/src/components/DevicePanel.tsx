import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Device } from '../types';
import { useSyncStore } from '../store/sync';

interface Props { devices: Device[]; }

export const DevicePanel: React.FC<Props> = ({ devices }) => {
  const { openOnboardingWizard } = useSyncStore();

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0 }}>Devices</h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openOnboardingWizard}
        >
          添加设备
        </Button>
      </div>
      {devices.map(d => (
        <div key={d.id} style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
          marginBottom: '8px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff'
        }}>
          <span style={{ fontSize: '24px' }}>{d.platform === 'mac' ? '🍎' : d.platform === 'linux' ? '🐧' : '💻'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{d.name}</div>
            <div style={{ fontSize: '11px', color: '#888' }}>
              {d.status === 'online' ? 'Online' : 'Offline'} | {(d.storageUsed / 1024 / 1024 / 1024).toFixed(1)}GB / {(d.storageTotal / 1024 / 1024 / 1024).toFixed(0)}GB
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
