import React, { useState, useEffect } from 'react';
import { FileList } from './components/FileList';
import { DevicePanel } from './components/DevicePanel';
import { SyncActivityPanel } from './components/SyncActivityPanel';
import { VersionHistoryPanel } from './components/VersionHistoryPanel';
import { VersionComparePanel } from './components/VersionComparePanel';
import { RecycleBinPanel } from './components/RecycleBinPanel';
import { DeviceOnboardingWizard } from './components/DeviceOnboardingWizard';
import { SyncSchedulePanel } from './components/SyncSchedulePanel';
import { ShareLinksPanel } from './components/ShareLinksPanel';
import { ShareAccessPage } from './components/ShareAccessPage';
import { LargeFileTransferPanel } from './components/LargeFileTransferPanel';
import { useSyncStore } from './store/sync';
import { SyncFile, Device, SyncActivity, FileVersion, RecycleBinItem, SyncSchedule, LargeFileTransferItem } from './types';

const now = new Date();

const mockVersions: FileVersion[] = [
  { id: 'v1', version: 1, size: 204800, hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', createdAt: new Date(now.getTime() - 7 * 86400000).toISOString(), author: '张三', changeType: 'added', device: 'MacBook Pro' },
  { id: 'v2', version: 2, size: 225280, hash: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7', createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(), author: '李四', changeType: 'modified', device: 'Windows Desktop' },
  { id: 'v3', version: 3, size: 245760, hash: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8', createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(), author: '张三', changeType: 'modified', device: 'MacBook Pro' },
  { id: 'v4', version: 4, size: 262144, hash: 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9', createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(), author: '王五', changeType: 'modified', device: 'Ubuntu Server' },
  { id: 'v5', version: 5, size: 245760, hash: 'e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0', createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(), author: '张三', changeType: 'modified', device: 'MacBook Pro' },
];

const mockFiles: SyncFile[] = [
  { id: '1', path: '/docs/report.pdf', name: 'report.pdf', size: 245760, modifiedAt: '2026-06-06T10:00:00Z', status: 'synced', versions: mockVersions },
  { id: '2', path: '/docs/notes.md', name: 'notes.md', size: 4096, modifiedAt: '2026-06-06T11:30:00Z', status: 'modified', versions: [
    { id: 'v1', version: 1, size: 2048, hash: 'abc123', createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(), author: 'user1', changeType: 'added', device: 'MacBook Pro' },
    { id: 'v2', version: 2, size: 4096, hash: 'def456', createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(), author: 'user1', changeType: 'modified', device: 'MacBook Pro' },
  ] },
  { id: '3', path: '/photos/img001.jpg', name: 'img001.jpg', size: 3145728, modifiedAt: '2026-06-05T15:00:00Z', status: 'conflict', versions: [] },
];

const mockDevices: Device[] = [
  { id: 'd1', name: 'MacBook Pro', platform: 'mac', lastSeen: '2026-06-06T12:00:00Z', status: 'online', storageUsed: 5368709120, storageTotal: 107374182400 },
  { id: 'd2', name: 'Ubuntu Server', platform: 'linux', lastSeen: '2026-06-06T11:00:00Z', status: 'online', storageUsed: 10737418240, storageTotal: 53687091200 },
  { id: 'd3', name: 'Windows Desktop', platform: 'windows', lastSeen: '2026-06-05T20:00:00Z', status: 'offline', storageUsed: 2147483648, storageTotal: 107374182400 },
];

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

const mockFoldersForSchedule = [
  { id: 'f1', name: '工作文档', path: '/Users/username/Documents/Work' },
  { id: 'f2', name: '个人照片', path: '/Users/username/Photos' },
  { id: 'f3', name: '项目代码', path: '/Users/username/Projects' },
  { id: 'f4', name: '备份数据', path: '/Users/username/Backup' },
];

const mockSchedules: SyncSchedule[] = [
  {
    id: 'sch-1',
    folderId: 'f1',
    folderName: '工作文档',
    folderPath: '/Users/username/Documents/Work',
    scheduleType: 'workday',
    enabled: true,
    weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    timeRange: { start: '09:00', end: '18:00' },
    createdAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
    lastRun: new Date(now.getTime() - 2 * 3600000).toISOString(),
  },
  {
    id: 'sch-2',
    folderId: 'f2',
    folderName: '个人照片',
    folderPath: '/Users/username/Photos',
    scheduleType: 'night',
    enabled: true,
    weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    timeRange: { start: '22:00', end: '06:00' },
    createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
    lastRun: new Date(now.getTime() - 8 * 3600000).toISOString(),
  },
];

const mockLargeFileTransfers: LargeFileTransferItem[] = [
  {
    id: 'lft-1',
    fileId: 'lf1',
    fileName: '项目资料备份.zip',
    filePath: '/backup/项目资料备份.zip',
    size: 2147483648,
    uploaded: 1610612736,
    status: 'uploading',
    speed: 1048576,
    startTime: new Date(now.getTime() - 10 * 60000).toISOString(),
    device: 'MacBook Pro',
    retryCount: 0,
    maxRetries: 3,
  },
  {
    id: 'lft-2',
    fileId: 'lf2',
    fileName: '视频素材合集.mp4',
    filePath: '/videos/视频素材合集.mp4',
    size: 5368709120,
    uploaded: 2147483648,
    status: 'paused',
    speed: 0,
    startTime: new Date(now.getTime() - 30 * 60000).toISOString(),
    device: 'MacBook Pro',
    retryCount: 0,
    maxRetries: 3,
  },
  {
    id: 'lft-3',
    fileId: 'lf3',
    fileName: '大型数据集.csv',
    filePath: '/data/大型数据集.csv',
    size: 1073741824,
    uploaded: 0,
    status: 'pending',
    speed: 0,
    startTime: new Date(now.getTime() - 5 * 60000).toISOString(),
    device: 'MacBook Pro',
    retryCount: 0,
    maxRetries: 3,
  },
  {
    id: 'lft-4',
    fileId: 'lf4',
    fileName: '设计资源包.psd',
    filePath: '/design/设计资源包.psd',
    size: 3221225472,
    uploaded: 3221225472,
    status: 'completed',
    speed: 0,
    startTime: new Date(now.getTime() - 2 * 3600000).toISOString(),
    device: 'MacBook Pro',
    retryCount: 0,
    maxRetries: 3,
  },
  {
    id: 'lft-5',
    fileId: 'lf5',
    fileName: '虚拟机镜像.iso',
    filePath: '/vm/虚拟机镜像.iso',
    size: 8589934592,
    uploaded: 4294967296,
    status: 'failed',
    speed: 0,
    startTime: new Date(now.getTime() - 1 * 3600000).toISOString(),
    errorMessage: '网络连接超时，请检查网络后重试',
    device: 'MacBook Pro',
    retryCount: 1,
    maxRetries: 3,
  },
];

const mockRecycleBin: RecycleBinItem[] = [
  {
    id: 'rb1',
    fileId: 'f1',
    fileName: 'project_draft.docx',
    filePath: '/docs/project_draft.docx',
    size: 102400,
    hash: 'abc123def456',
    deletedAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
    deletedBy: '张三',
    deletedFrom: 'MacBook Pro',
    expiresAt: new Date(now.getTime() + 28 * 86400000).toISOString(),
    restored: false,
  },
  {
    id: 'rb2',
    fileId: 'f2',
    fileName: 'old_photo.jpg',
    filePath: '/photos/old_photo.jpg',
    size: 2097152,
    hash: 'def456ghi789',
    deletedAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
    deletedBy: '李四',
    deletedFrom: 'Windows Desktop',
    expiresAt: new Date(now.getTime() + 29 * 86400000).toISOString(),
    restored: false,
  },
  {
    id: 'rb3',
    fileId: 'f3',
    fileName: 'backup_2026.zip',
    filePath: '/backup/backup_2026.zip',
    size: 104857600,
    hash: 'ghi789jkl012',
    deletedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
    deletedBy: '王五',
    deletedFrom: 'Ubuntu Server',
    expiresAt: new Date(now.getTime() + 27 * 86400000).toISOString(),
    restored: true,
    restoredAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
    restoredTo: '/backup/backup_2026_restored.zip',
  },
  {
    id: 'rb4',
    fileId: 'f4',
    fileName: 'temp_notes.txt',
    filePath: '/temp/temp_notes.txt',
    size: 4096,
    hash: 'jkl012mno345',
    deletedAt: new Date(now.getTime() - 31 * 86400000).toISOString(),
    deletedBy: '张三',
    deletedFrom: 'MacBook Pro',
    expiresAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
    restored: false,
  },
];

const getShareTokenFromPath = (): string | null => {
  const path = window.location.pathname;
  const match = path.match(/^\/share\/([^/]+)/);
  return match ? match[1] : null;
};

const App: React.FC = () => {
  const [tab, setTab] = useState<'activity' | 'files' | 'devices' | 'conflicts' | 'recyclebin' | 'schedule' | 'largetransfers'>('activity');
  const [shareToken, setShareToken] = useState<string | null>(getShareTokenFromPath());
  const {
    files,
    activities,
    recycleBin,
    versionHistory,
    devices,
    schedules,
    scheduleExecutions,
    shareLinksPanelOpen,
    shareLinksPanelFileId,
    largeFileTransfers,
    setFiles,
    setActivities,
    setRecycleBin,
    setDevices,
    setSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
    runScheduleNow,
    restoreFromRecycleBin,
    deleteFromRecycleBin,
    clearExpiredRecycleBin,
    openVersionHistory,
    closeVersionHistory,
    selectVersionsForCompare,
    closeCompare,
    restoreVersion,
    openShareLinksPanel,
    closeShareLinksPanel,
    setLargeFileTransfers,
    pauseLargeFileTransfer,
    resumeLargeFileTransfer,
    retryLargeFileTransfer,
    cancelLargeFileTransfer,
  } = useSyncStore();

  useEffect(() => {
    const handlePopState = () => {
      setShareToken(getShareTokenFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (files.length === 0) setFiles(mockFiles);
    if (activities.length === 0) setActivities(mockActivities);
    if (recycleBin.length === 0) setRecycleBin(mockRecycleBin);
    if (devices.length === 0) setDevices(mockDevices);
    if (schedules.length === 0) setSchedules(mockSchedules);
    if (largeFileTransfers.length === 0) setLargeFileTransfers(mockLargeFileTransfers);
  }, [files.length, activities.length, recycleBin.length, devices.length, schedules.length, largeFileTransfers.length, setFiles, setActivities, setRecycleBin, setDevices, setSchedules, setLargeFileTransfers]);

  const displayFiles = files.length > 0 ? files : mockFiles;
  const displayActivities = activities.length > 0 ? activities : mockActivities;
  const displayRecycleBin = recycleBin.length > 0 ? recycleBin : mockRecycleBin;
  const displayDevices = devices.length > 0 ? devices : mockDevices;
  const displaySchedules = schedules.length > 0 ? schedules : mockSchedules;
  const displayExecutions = scheduleExecutions;
  const displayLargeFileTransfers = largeFileTransfers;

  useEffect(() => {
    const interval = setInterval(() => {
      const state = useSyncStore.getState();
      const updatedTransfers = state.largeFileTransfers.map(transfer => {
        if (transfer.status === 'uploading' && transfer.uploaded < transfer.size) {
          const increment = Math.floor(transfer.size * 0.02);
          const newUploaded = Math.min(transfer.uploaded + increment, transfer.size);
          const newStatus = newUploaded >= transfer.size ? 'completed' : 'uploading';
          return {
            ...transfer,
            uploaded: newUploaded,
            status: newStatus as any,
            speed: newStatus === 'completed' ? 0 : transfer.speed + Math.floor(Math.random() * 50000),
          };
        }
        return transfer;
      });
      const hasChanges = updatedTransfers.some((t, i) => t.uploaded !== state.largeFileTransfers[i].uploaded);
      if (hasChanges) {
        state.setLargeFileTransfers(updatedTransfers);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedFile = versionHistory.fileId ? displayFiles.find(f => f.id === versionHistory.fileId) : null;
  const selectedVersions = versionHistory.selectedVersionIds && selectedFile
    ? [
        selectedFile.versions.find(v => v.id === versionHistory.selectedVersionIds![0]),
        selectedFile.versions.find(v => v.id === versionHistory.selectedVersionIds![1]),
      ].filter(Boolean) as FileVersion[]
    : [];

  const shareLinksFile = shareLinksPanelFileId ? displayFiles.find(f => f.id === shareLinksPanelFileId) : null;

  const handleBackToHome = () => {
    window.history.pushState({}, '', '/');
    setShareToken(null);
  };

  if (shareToken) {
    return <ShareAccessPage token={shareToken} onBack={handleBackToHome} />;
  }

  const renderContent = () => {
    if (shareLinksPanelOpen && shareLinksFile) {
      return (
        <ShareLinksPanel
          file={shareLinksFile}
          versions={shareLinksFile.versions}
        />
      );
    }

    if (versionHistory.isOpen && selectedFile) {
      if (versionHistory.showCompare && selectedVersions.length === 2) {
        return (
          <VersionComparePanel
            oldVersion={selectedVersions[0]}
            newVersion={selectedVersions[1]}
            onRestore={(version) => {
              restoreVersion(selectedFile.id, version);
            }}
            onClose={closeCompare}
          />
        );
      }
      return (
        <VersionHistoryPanel
          file={selectedFile}
          onSelectVersions={(oldId, newId) => selectVersionsForCompare(oldId, newId)}
          onRestore={(version) => restoreVersion(selectedFile.id, version)}
          onClose={closeVersionHistory}
          onShare={() => {
            closeVersionHistory();
            openShareLinksPanel(selectedFile.id);
          }}
        />
      );
    }

    return (
      <>
        {tab === 'activity' && <SyncActivityPanel activities={displayActivities} />}
        {tab === 'files' && (
          <FileList
            files={displayFiles}
            onViewHistory={(fileId) => openVersionHistory(fileId)}
            onShare={(fileId) => openShareLinksPanel(fileId)}
          />
        )}
        {tab === 'devices' && <DevicePanel devices={displayDevices} />}
        {tab === 'conflicts' && <div style={{ padding: '16px' }}><h3>Conflicts</h3><p style={{ color: '#999' }}>No conflicts</p></div>}
        {tab === 'recyclebin' && (
          <RecycleBinPanel
            items={displayRecycleBin}
            onRestore={restoreFromRecycleBin}
            onDeletePermanently={deleteFromRecycleBin}
            onClearExpired={clearExpiredRecycleBin}
          />
        )}
        {tab === 'schedule' && (
          <SyncSchedulePanel
            schedules={displaySchedules}
            executions={displayExecutions}
            folders={mockFoldersForSchedule}
            onAddSchedule={addSchedule}
            onUpdateSchedule={updateSchedule}
            onDeleteSchedule={deleteSchedule}
            onToggleSchedule={toggleSchedule}
            onRunNow={runScheduleNow}
          />
        )}
        {tab === 'largetransfers' && (
          <LargeFileTransferPanel
            transfers={displayLargeFileTransfers}
            onPause={pauseLargeFileTransfer}
            onResume={resumeLargeFileTransfer}
            onRetry={retryLargeFileTransfer}
            onCancel={cancelLargeFileTransfer}
          />
        )}
      </>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <nav style={{ width: '200px', background: '#263238', color: '#fff', padding: '20px 0' }}>
        <h2 style={{ margin: '0 0 20px', padding: '0 16px', fontSize: '16px' }}>FileSync</h2>
        {[
          { key: 'activity', label: '同步动态' },
          { key: 'largetransfers', label: '大文件传输' },
          { key: 'schedule', label: '定时同步' },
          { key: 'files', label: 'Files' },
          { key: 'devices', label: 'Devices' },
          { key: 'conflicts', label: 'Conflicts' },
          { key: 'recyclebin', label: '回收站' }
        ].map(t => (
          <button key={t.key} onClick={() => {
            setTab(t.key as any);
            if (versionHistory.isOpen) {
              closeVersionHistory();
            }
            if (shareLinksPanelOpen) {
              closeShareLinksPanel();
            }
          }} style={{
            display: 'block', width: '100%', padding: '12px 16px', border: 'none', textAlign: 'left',
            cursor: 'pointer', background: tab === t.key ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff', fontSize: '14px'
          }}>{t.label}</button>
        ))}
      </nav>
      <main style={{ flex: 1, overflow: 'auto', background: '#fafafa' }}>
        {renderContent()}
      </main>
      <DeviceOnboardingWizard />
    </div>
  );
};
export default App;
