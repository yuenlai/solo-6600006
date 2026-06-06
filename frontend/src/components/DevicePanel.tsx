import React from 'react';
import { Device } from '../types';

interface Props { devices: Device[]; }

export const DevicePanel: React.FC<Props> = ({ devices }) => (
  <div style={{ padding: '16px' }}>
    <h3 style={{ margin: '0 0 12px' }}>Devices</h3>
    {devices.map(d => (
      <div key={d.id} style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
        marginBottom: '8px', borderRadius: '8px', border: '1px solid #e0e0e0'
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
