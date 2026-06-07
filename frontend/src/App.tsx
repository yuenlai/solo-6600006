import React, { useState } from 'react';
import { FileList } from './components/FileList';
import { DevicePanel } from './components/DevicePanel';
import { SyncActivityPanel } from './components/SyncActivityPanel';
import { SyncFile, Device, SyncActivity } from './types';

const mockFiles: SyncFile[] = [
  { id: '1', path: '/docs/report.pdf', name: 'report.pdf', size: 245760, modifiedAt: '2026-06-06T10:00:00Z', status: 'synced', versions: [{ id: 'v1', version: 1, size: 245760, hash: 'abc123', createdAt: '2026-06-06T10:00:00Z', author: 'user1', changeType: 'added' }] },
  { id: '2', path: '/docs/notes.md', name: 'notes.md', size: 4096, modifiedAt: '2026-06-06T11:30:00Z', status: 'modified', versions: [] },
  { id: '3', path: '/photos/img001.jpg', name: 'img001.jpg', size: 3145728, modifiedAt: '2026-06-05T15:00:00Z', status: 'conflict', versions: [] },
];

const mockDevices: Device[] = [
  { id: 'd1', name: 'MacBook Pro', platform: 'mac', lastSeen: '2026-06-06T12:00:00Z', status: 'online', storageUsed: 5368709120, storageTotal: 107374182400 },
  { id: 'd2', name: 'Ubuntu Server', platform: 'linux', lastSeen: '2026-06-06T11:00:00Z', status: 'online', storageUsed: 10737418240, storageTotal: 53687091200 },
  { id: 'd3', name: 'Windows Desktop', platform: 'windows', lastSeen: '2026-06-05T20:00:00Z', status: 'offline', storageUsed: 2147483648, storageTotal: 107374182400 },
];

const now = new Date();
const mockActivities: SyncActivity[] = [
  { id: 'a1', fileId: '1', fileName: 'report.pdf', filePath: '/docs/report.pdf', status: 'success', action: 'upload', timestamp: new Date(now.getTime() - 2 * 60000).toISOString(), device: 'MacBook Pro', size: 245760 },
  { id: 'a2', fileId: '4', fileName: 'presentation.pptx', filePath: '/docs/presentation.pptx', status: 'pending', action: 'upload', timestamp: new Date(now.getTime() - 5 * 60000).toISOString(), device: 'MacBook Pro', size: 5242880 },
  { id: 'a3', fileId: '5', fileName: 'backup.zip', filePath: '/backup/backup.zip', status: 'failed', action: 'upload', timestamp: new Date(now.getTime() - 15 * 60000).toISOString(), device: 'MacBook Pro', size: 104857600, errorMessage: '网络连接中断' },
  { id: 'a4', fileId: '3', fileName: 'img001.jpg', filePath: '/photos/img001.jpg', status: 'conflict', action: 'modify', timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), device: 'Ubuntu Server', size: 3145728 },
  { id: 'a5', fileId: '6', fileName: 'readme.txt', filePath: '/readme.txt', status: 'success', action: 'download', timestamp: new Date(now.getTime() - 60 * 60000).toISOString(), device: 'Windows Desktop', size: 2048 },
  { id: 'a6', fileId: '7', fileName: 'data.csv', filePath: '/data/data.csv', status: 'success', action: 'modify', timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(), device: 'Ubuntu Server', size: 102400 },
  { id: 'a7', fileId: '8', fileName: 'old_file.txt', filePath: '/archive/old_file.txt', status: 'success', action: 'delete', timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(), device: 'MacBook Pro' },
  { id: 'a8', fileId: '9', fileName: 'image.png', filePath: '/images/image.png', status: 'failed', action: 'download', timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(), device: 'Windows Desktop', size: 2097152, errorMessage: '文件已被删除' },
];

const App: React.FC = () => {
  const [tab, setTab] = useState<'activity' | 'files' | 'devices' | 'conflicts'>('activity');
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <nav style={{ width: '200px', background: '#263238', color: '#fff', padding: '20px 0' }}>
        <h2 style={{ margin: '0 0 20px', padding: '0 16px', fontSize: '16px' }}>FileSync</h2>
        {[
          { key: 'activity', label: '同步动态' },
          { key: 'files', label: 'Files' },
          { key: 'devices', label: 'Devices' },
          { key: 'conflicts', label: 'Conflicts' }
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{
            display: 'block', width: '100%', padding: '12px 16px', border: 'none', textAlign: 'left',
            cursor: 'pointer', background: tab === t.key ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff', fontSize: '14px'
          }}>{t.label}</button>
        ))}
      </nav>
      <main style={{ flex: 1, overflow: 'auto', background: '#fafafa' }}>
        {tab === 'activity' && <SyncActivityPanel activities={mockActivities} />}
        {tab === 'files' && <FileList files={mockFiles} />}
        {tab === 'devices' && <DevicePanel devices={mockDevices} />}
        {tab === 'conflicts' && <div style={{ padding: '16px' }}><h3>Conflicts</h3><p style={{ color: '#999' }}>No conflicts</p></div>}
      </main>
    </div>
  );
};
export default App;
