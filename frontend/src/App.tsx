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
import { ConflictResolutionCenter } from './components/ConflictResolutionCenter';
import { StorageAnalysisPanel } from './components/StorageAnalysisPanel';
import { OfflineSyncPanel } from './components/OfflineSyncPanel';
import { DirectorySnapshotPanel } from './components/DirectorySnapshotPanel';
import { IgnoreRulesPanel } from './components/IgnoreRulesPanel';
import { DeviceHealthPanel } from './components/DeviceHealthPanel';
import { NotificationCenter } from './components/NotificationCenter';
import { BandwidthStrategyPanel } from './components/BandwidthStrategyPanel';
import { WorkspacePanel } from './components/WorkspacePanel';
import { SyncTemplatePanel } from './components/SyncTemplatePanel';
import { SensitiveProtectionPanel } from './components/SensitiveProtectionPanel';
import { DailySyncReportPanel } from './components/DailySyncReportPanel';
import { useSyncStore } from './store/sync';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { SyncFile, Device, SyncActivity, FileVersion, RecycleBinItem, SyncSchedule, LargeFileTransferItem, OfflineChangeAction, DeviceHealthMetrics, Notification, NotificationAction } from './types';

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

const mockDeviceHealth: DeviceHealthMetrics[] = [
  {
    deviceId: 'd1',
    deviceName: 'MacBook Pro',
    platform: 'mac',
    status: 'online',
    recentSyncLatency: 145,
    anomalyCount: 2,
    diskUsed: 5368709120,
    diskTotal: 107374182400,
    connectionQualityScore: 92,
    lastSyncTime: new Date(now.getTime() - 5 * 60000).toISOString(),
  },
  {
    deviceId: 'd2',
    deviceName: 'Ubuntu Server',
    platform: 'linux',
    status: 'online',
    recentSyncLatency: 520,
    anomalyCount: 5,
    diskUsed: 10737418240,
    diskTotal: 53687091200,
    connectionQualityScore: 68,
    lastSyncTime: new Date(now.getTime() - 30 * 60000).toISOString(),
  },
  {
    deviceId: 'd3',
    deviceName: 'Windows Desktop',
    platform: 'windows',
    status: 'offline',
    recentSyncLatency: 0,
    anomalyCount: 8,
    diskUsed: 2147483648,
    diskTotal: 107374182400,
    connectionQualityScore: 35,
    lastSyncTime: new Date(now.getTime() - 24 * 3600000).toISOString(),
  },
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
  const [tab, setTab] = useState<'activity' | 'files' | 'devices' | 'health' | 'conflicts' | 'recyclebin' | 'schedule' | 'largetransfers' | 'storage' | 'snapshots' | 'ignorerules' | 'bandwidth' | 'workspaces' | 'templates' | 'sensitive' | 'dailyreport'>('workspaces');
  const [shareToken, setShareToken] = useState<string | null>(getShareTokenFromPath());
  
  const networkStatus = useNetworkStatus();
  
  const conflicts = useSyncStore(state => state.conflicts);
  const resolveConflict = useSyncStore(state => state.resolveConflict);
  const batchResolveConflicts = useSyncStore(state => state.batchResolveConflicts);
  
  const files = useSyncStore(state => state.files);
  const activities = useSyncStore(state => state.activities);
  const recycleBin = useSyncStore(state => state.recycleBin);
  const versionHistory = useSyncStore(state => state.versionHistory);
  const devices = useSyncStore(state => state.devices);
  const schedules = useSyncStore(state => state.schedules);
  const scheduleExecutions = useSyncStore(state => state.scheduleExecutions);
  const shareLinksPanelOpen = useSyncStore(state => state.shareLinksPanelOpen);
  const shareLinksPanelFileId = useSyncStore(state => state.shareLinksPanelFileId);
  const largeFileTransfers = useSyncStore(state => state.largeFileTransfers);
  const storageAnalysis = useSyncStore(state => state.storageAnalysis);
  const snapshots = useSyncStore(state => state.snapshots);
  const ignoreRules = useSyncStore(state => state.ignoreRules);
  const offlineChanges = useSyncStore(state => state.offlineChanges);
  const offlineSyncProgress = useSyncStore(state => state.offlineSyncProgress);
  const isOfflinePanelOpen = useSyncStore(state => state.isOfflinePanelOpen);
  const isOnlineStore = useSyncStore(state => state.isOnline);
  const isManualOfflineMode = useSyncStore(state => state.isManualOfflineMode);
  const toggleManualOfflineMode = useSyncStore(state => state.toggleManualOfflineMode);
  const notifications = useSyncStore(state => state.notifications);
  const isNotificationCenterOpen = useSyncStore(state => state.isNotificationCenterOpen);
  const addNotification = useSyncStore(state => state.addNotification);
  const markNotificationAsRead = useSyncStore(state => state.markNotificationAsRead);
  const markAllNotificationsAsRead = useSyncStore(state => state.markAllNotificationsAsRead);
  const removeNotification = useSyncStore(state => state.removeNotification);
  const clearAllNotifications = useSyncStore(state => state.clearAllNotifications);
  const toggleNotificationCenter = useSyncStore(state => state.toggleNotificationCenter);
  const closeNotificationCenter = useSyncStore(state => state.closeNotificationCenter);
  
  const workspaces = useSyncStore(state => state.workspaces);
  const selectedWorkspaceId = useSyncStore(state => state.selectedWorkspaceId);
  const isCreateWorkspaceModalOpen = useSyncStore(state => state.isCreateWorkspaceModalOpen);
  const selectWorkspace = useSyncStore(state => state.selectWorkspace);
  const createWorkspace = useSyncStore(state => state.createWorkspace);
  const deleteWorkspace = useSyncStore(state => state.deleteWorkspace);
  const openCreateWorkspaceModal = useSyncStore(state => state.openCreateWorkspaceModal);
  const closeCreateWorkspaceModal = useSyncStore(state => state.closeCreateWorkspaceModal);
  const addWorkspaceMember = useSyncStore(state => state.addWorkspaceMember);
  const removeWorkspaceMember = useSyncStore(state => state.removeWorkspaceMember);
  const updateMemberRole = useSyncStore(state => state.updateMemberRole);
  
  const setFiles = useSyncStore(state => state.setFiles);
  const setActivities = useSyncStore(state => state.setActivities);
  const setRecycleBin = useSyncStore(state => state.setRecycleBin);
  const setDevices = useSyncStore(state => state.setDevices);
  const setSchedules = useSyncStore(state => state.setSchedules);
  const addSchedule = useSyncStore(state => state.addSchedule);
  const updateSchedule = useSyncStore(state => state.updateSchedule);
  const deleteSchedule = useSyncStore(state => state.deleteSchedule);
  const toggleSchedule = useSyncStore(state => state.toggleSchedule);
  const runScheduleNow = useSyncStore(state => state.runScheduleNow);
  const restoreFromRecycleBin = useSyncStore(state => state.restoreFromRecycleBin);
  const deleteFromRecycleBin = useSyncStore(state => state.deleteFromRecycleBin);
  const clearExpiredRecycleBin = useSyncStore(state => state.clearExpiredRecycleBin);
  const openVersionHistory = useSyncStore(state => state.openVersionHistory);
  const closeVersionHistory = useSyncStore(state => state.closeVersionHistory);
  const selectVersionsForCompare = useSyncStore(state => state.selectVersionsForCompare);
  const closeCompare = useSyncStore(state => state.closeCompare);
  const restoreVersion = useSyncStore(state => state.restoreVersion);
  const openShareLinksPanel = useSyncStore(state => state.openShareLinksPanel);
  const closeShareLinksPanel = useSyncStore(state => state.closeShareLinksPanel);
  const setLargeFileTransfers = useSyncStore(state => state.setLargeFileTransfers);
  const pauseLargeFileTransfer = useSyncStore(state => state.pauseLargeFileTransfer);
  const resumeLargeFileTransfer = useSyncStore(state => state.resumeLargeFileTransfer);
  const retryLargeFileTransfer = useSyncStore(state => state.retryLargeFileTransfer);
  const cancelLargeFileTransfer = useSyncStore(state => state.cancelLargeFileTransfer);
  const setIsOnline = useSyncStore(state => state.setIsOnline);
  const addOfflineChange = useSyncStore(state => state.addOfflineChange);
  const removeOfflineChange = useSyncStore(state => state.removeOfflineChange);
  const loadOfflineChanges = useSyncStore(state => state.loadOfflineChanges);
  const startOfflineSync = useSyncStore(state => state.startOfflineSync);
  const retryOfflineChange = useSyncStore(state => state.retryOfflineChange);
  const retryAllFailedOfflineChanges = useSyncStore(state => state.retryAllFailedOfflineChanges);
  const clearSyncedOfflineChanges = useSyncStore(state => state.clearSyncedOfflineChanges);
  const toggleOfflinePanel = useSyncStore(state => state.toggleOfflinePanel);
  const createSnapshot = useSyncStore(state => state.createSnapshot);
  const restoreSnapshot = useSyncStore(state => state.restoreSnapshot);
  const restoreSnapshotFiles = useSyncStore(state => state.restoreSnapshotFiles);
  const deleteSnapshot = useSyncStore(state => state.deleteSnapshot);
  const updateSnapshot = useSyncStore(state => state.updateSnapshot);
  const addIgnoreRule = useSyncStore(state => state.addIgnoreRule);
  const updateIgnoreRule = useSyncStore(state => state.updateIgnoreRule);
  const deleteIgnoreRule = useSyncStore(state => state.deleteIgnoreRule);
  const toggleIgnoreRule = useSyncStore(state => state.toggleIgnoreRule);
  const checkFileIgnored = useSyncStore(state => state.checkFileIgnored);

  const bandwidthStrategies = useSyncStore(state => state.bandwidthStrategies);
  const addBandwidthStrategy = useSyncStore(state => state.addBandwidthStrategy);
  const updateBandwidthStrategy = useSyncStore(state => state.updateBandwidthStrategy);
  const deleteBandwidthStrategy = useSyncStore(state => state.deleteBandwidthStrategy);
  const toggleBandwidthStrategy = useSyncStore(state => state.toggleBandwidthStrategy);

  const syncTemplates = useSyncStore(state => state.syncTemplates);
  const addSyncTemplate = useSyncStore(state => state.addSyncTemplate);
  const updateSyncTemplate = useSyncStore(state => state.updateSyncTemplate);
  const deleteSyncTemplate = useSyncStore(state => state.deleteSyncTemplate);

  const sensitiveProtections = useSyncStore(state => state.sensitiveProtections);
  const addSensitiveProtection = useSyncStore(state => state.addSensitiveProtection);
  const updateSensitiveProtection = useSyncStore(state => state.updateSensitiveProtection);
  const deleteSensitiveProtection = useSyncStore(state => state.deleteSensitiveProtection);
  const toggleSensitiveProtection = useSyncStore(state => state.toggleSensitiveProtection);
  const verifyProtection = useSyncStore(state => state.verifyProtection);

  const dailySyncReports = useSyncStore(state => state.dailySyncReports);
  const markDailySyncReportAsRead = useSyncStore(state => state.markDailySyncReportAsRead);
  const markAllDailySyncReportsAsRead = useSyncStore(state => state.markAllDailySyncReportsAsRead);
  const generateDailySyncReport = useSyncStore(state => state.generateDailySyncReport);

  useEffect(() => {
    const handlePopState = () => {
      setShareToken(getShareTokenFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const state = useSyncStore.getState();
    if (state.files.length === 0) setFiles(mockFiles);
    if (state.activities.length === 0) setActivities(mockActivities);
    if (state.recycleBin.length === 0) setRecycleBin(mockRecycleBin);
    if (state.devices.length === 0) setDevices(mockDevices);
    if (state.schedules.length === 0) setSchedules(mockSchedules);
    if (state.largeFileTransfers.length === 0) setLargeFileTransfers(mockLargeFileTransfers);
    loadOfflineChanges();

    if (state.notifications.length === 0) {
      addNotification({
        type: 'sync_success',
        title: '同步完成',
        message: '工作文档目录已成功同步，共同步 12 个文件',
        priority: 'low',
        actions: [
          { label: '查看详情', type: 'navigate', target: 'activity' },
        ],
      });
      addNotification({
        type: 'sync_conflict',
        title: '发现 2 个同步冲突',
        message: '文件 "img001.jpg" 和 "项目方案.docx" 存在冲突，需要手动处理',
        priority: 'urgent',
        actions: [
          { label: '立即处理', type: 'navigate', target: 'conflicts' },
        ],
      });
      addNotification({
        type: 'sync_failed',
        title: '同步失败',
        message: '文件 "backup.zip" 上传失败：网络连接中断',
        priority: 'high',
        actions: [
          { label: '查看详情', type: 'navigate', target: 'activity' },
          { label: '重试', type: 'navigate', target: 'largetransfers' },
        ],
      });
      addNotification({
        type: 'storage_insufficient',
        title: '存储空间预警',
        message: '您的存储空间已使用 85%，建议及时清理或扩容',
        priority: 'high',
        actions: [
          { label: '查看空间分析', type: 'navigate', target: 'storage' },
          { label: '清理回收站', type: 'navigate', target: 'recyclebin' },
        ],
      });
    }
  }, [setFiles, setActivities, setRecycleBin, setDevices, setSchedules, setLargeFileTransfers, loadOfflineChanges, addNotification]);

  useEffect(() => {
    if (!isManualOfflineMode) {
      setIsOnline(networkStatus.isOnline);
    }
  }, [networkStatus.isOnline, setIsOnline, isManualOfflineMode]);

  useEffect(() => {
    if (isOnlineStore) {
      const pendingCount = offlineChanges.filter(c => c.status === 'pending' || c.status === 'failed').length;
      if (pendingCount > 0 && !offlineSyncProgress.isSyncing) {
        setTimeout(() => {
          startOfflineSync();
        }, 1000);
      }
    }
  }, [isOnlineStore]);

  const displayFiles = files.length > 0 ? files : mockFiles;
  const displayActivities = activities.length > 0 ? activities : mockActivities;
  const displayConflicts = conflicts;
  const displayRecycleBin = recycleBin.length > 0 ? recycleBin : mockRecycleBin;
  const displayDevices = devices.length > 0 ? devices : mockDevices;
  const displaySchedules = schedules.length > 0 ? schedules : mockSchedules;
  const displayExecutions = scheduleExecutions;
  const displayLargeFileTransfers = largeFileTransfers;

  useEffect(() => {
    const interval = setInterval(() => {
      useSyncStore.setState((state) => {
        let hasChanges = false;
        const updatedTransfers = state.largeFileTransfers.map(transfer => {
          if (transfer.status === 'uploading' && transfer.uploaded < transfer.size) {
            hasChanges = true;
            const increment = Math.floor(transfer.size * 0.02);
            const newUploaded = Math.min(transfer.uploaded + increment, transfer.size);
            const isCompleted = newUploaded >= transfer.size;
            return {
              ...transfer,
              uploaded: newUploaded,
              status: isCompleted ? 'completed' as const : 'uploading' as const,
              speed: isCompleted ? 0 : Math.max(524288, transfer.speed + Math.floor(Math.random() * 500000 - 250000)),
            };
          }
          return transfer;
        });
        return hasChanges ? { largeFileTransfers: updatedTransfers } : {};
      });
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

  const pendingOfflineCount = offlineChanges.filter(
    c => c.status === 'pending' || c.status === 'failed'
  ).length;

  const simulateFileEdit = (action: OfflineChangeAction, file?: SyncFile) => {
    const targetFile = file || displayFiles[Math.floor(Math.random() * displayFiles.length)];
    if (!targetFile) return;

    addOfflineChange({
      fileId: targetFile.id,
      fileName: targetFile.name,
      filePath: targetFile.path,
      action,
      size: targetFile.size,
    });
  };

  const simulateBatchEdits = () => {
    const actions: OfflineChangeAction[] = ['modify', 'upload', 'delete', 'modify', 'modify'];
    actions.forEach((action, index) => {
      setTimeout(() => {
        const file = displayFiles[index % displayFiles.length];
        if (file) {
          addOfflineChange({
            fileId: file.id + `-${index}`,
            fileName: index % 2 === 0 ? file.name : `new_file_${index}.txt`,
            filePath: file.path,
            action,
            size: file.size + index * 1024,
          });
        }
      }, index * 300);
    });
  };

  const handleNotificationAction = (action: NotificationAction, notification: Notification) => {
    if (action.type === 'navigate' && action.target) {
      switch (action.target) {
        case 'conflicts':
          setTab('conflicts');
          break;
        case 'activity':
          setTab('activity');
          break;
        case 'storage':
          setTab('storage');
          break;
        case 'largetransfers':
          setTab('largetransfers');
          break;
        default:
          if (action.target && action.target.startsWith('tab:')) {
            const tabName = action.target.replace('tab:', '') as any;
            setTab(tabName);
          }
      }
      closeNotificationCenter();
    } else if (action.type === 'callback' && action.callback) {
      action.callback();
    }
    markNotificationAsRead(notification.id);
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
        {tab === 'workspaces' && (
          <WorkspacePanel
            workspaces={workspaces}
            selectedWorkspaceId={selectedWorkspaceId}
            isCreateModalOpen={isCreateWorkspaceModalOpen}
            onSelectWorkspace={selectWorkspace}
            onCreateWorkspace={createWorkspace}
            onOpenCreateModal={openCreateWorkspaceModal}
            onCloseCreateModal={closeCreateWorkspaceModal}
            onDeleteWorkspace={deleteWorkspace}
            onAddMember={addWorkspaceMember}
            onRemoveMember={removeWorkspaceMember}
            onUpdateRole={updateMemberRole}
          />
        )}
        {tab === 'activity' && <SyncActivityPanel activities={displayActivities} />}
        {tab === 'files' && (
          <FileList
            files={displayFiles}
            onViewHistory={(fileId) => openVersionHistory(fileId)}
            onShare={(fileId) => openShareLinksPanel(fileId)}
          />
        )}
        {tab === 'devices' && <DevicePanel devices={displayDevices} />}
        {tab === 'health' && <DeviceHealthPanel devices={mockDeviceHealth} />}
        {tab === 'conflicts' && (
          <ConflictResolutionCenter
            conflicts={displayConflicts}
            onResolve={resolveConflict}
            onBatchResolve={batchResolveConflicts}
          />
        )}
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
        {tab === 'storage' && <StorageAnalysisPanel data={storageAnalysis} />}
        {tab === 'snapshots' && (
          <DirectorySnapshotPanel
            snapshots={snapshots}
            directories={storageAnalysis.byDirectory}
            onCreateSnapshot={createSnapshot}
            onRestoreSnapshot={restoreSnapshot}
            onRestoreSnapshotFiles={restoreSnapshotFiles}
            onDeleteSnapshot={deleteSnapshot}
            onUpdateSnapshot={updateSnapshot}
          />
        )}
        {tab === 'ignorerules' && (
          <IgnoreRulesPanel
            rules={ignoreRules}
            directories={storageAnalysis.byDirectory.map(d => ({ path: d.path, name: d.name }))}
            onAddRule={addIgnoreRule}
            onUpdateRule={updateIgnoreRule}
            onDeleteRule={deleteIgnoreRule}
            onToggleRule={toggleIgnoreRule}
            onCheckFile={checkFileIgnored}
          />
        )}
        {tab === 'bandwidth' && (
          <BandwidthStrategyPanel
            strategies={bandwidthStrategies}
            devices={displayDevices}
            onAddStrategy={addBandwidthStrategy}
            onUpdateStrategy={updateBandwidthStrategy}
            onDeleteStrategy={deleteBandwidthStrategy}
            onToggleStrategy={toggleBandwidthStrategy}
          />
        )}
        {tab === 'templates' && (
          <SyncTemplatePanel
            templates={syncTemplates}
            onAdd={addSyncTemplate}
            onUpdate={updateSyncTemplate}
            onDelete={deleteSyncTemplate}
          />
        )}
        {tab === 'sensitive' && (
          <SensitiveProtectionPanel
            protections={sensitiveProtections}
            directories={storageAnalysis.byDirectory.map(d => ({ path: d.path, name: d.name }))}
            onAddProtection={addSensitiveProtection}
            onUpdateProtection={updateSensitiveProtection}
            onDeleteProtection={deleteSensitiveProtection}
            onToggleProtection={toggleSensitiveProtection}
            onVerifyProtection={verifyProtection}
          />
        )}
        {tab === 'dailyreport' && (
          <DailySyncReportPanel
            reports={dailySyncReports}
            onMarkAsRead={markDailySyncReportAsRead}
            onMarkAllAsRead={markAllDailySyncReportsAsRead}
            onGenerateReport={generateDailySyncReport}
            devices={displayDevices}
          />
        )}
      </>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <nav style={{ width: '200px', background: '#263238', color: '#fff', padding: '20px 0', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ margin: '0 0 16px', padding: '0 16px', fontSize: '16px' }}>FileSync</h2>
        <div style={{ padding: '0 12px', marginBottom: '16px' }}>
          <button
            onClick={toggleNotificationCenter}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              background: isNotificationCenterOpen ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isNotificationCenterOpen ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)';
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔔</span>
              通知中心
            </span>
            {notifications.filter(n => !n.read).length > 0 && (
              <span style={{
                background: '#f44336',
                color: '#fff',
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '10px',
                fontWeight: 'bold',
                minWidth: '18px',
                textAlign: 'center',
              }}>
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </div>
        {[
          { key: 'workspaces', label: '协作空间' },
          { key: 'activity', label: '同步动态' },
          { key: 'largetransfers', label: '大文件传输' },
          { key: 'schedule', label: '定时同步' },
          { key: 'storage', label: '空间分析' },
          { key: 'snapshots', label: '目录快照' },
          { key: 'ignorerules', label: '忽略规则' },
          { key: 'sensitive', label: '敏感保护' },
          { key: 'dailyreport', label: '同步日报' },
          { key: 'bandwidth', label: '带宽策略' },
          { key: 'templates', label: '同步模板' },
          { key: 'files', label: '文件列表' },
          { key: 'devices', label: '设备管理' },
          { key: 'health', label: '健康诊断' },
          { key: 'conflicts', label: '冲突处理' },
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
        <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            background: isManualOfflineMode || !isOnlineStore ? 'rgba(244, 67, 54, 0.15)' : 'rgba(76, 175, 80, 0.15)',
            marginBottom: '12px',
            border: `1px solid ${isManualOfflineMode || !isOnlineStore ? 'rgba(244, 67, 54, 0.3)' : 'rgba(76, 175, 80, 0.3)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '13px', fontWeight: 500 }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: isManualOfflineMode || !isOnlineStore ? '#f44336' : '#4caf50',
                  boxShadow: isManualOfflineMode || !isOnlineStore ? '0 0 10px #f44336' : '0 0 10px #4caf50',
                  animation: isManualOfflineMode || !isOnlineStore ? 'none' : 'pulse 2s infinite',
                }} />
                {isManualOfflineMode ? '🔌 离线模式 (手动)' : isOnlineStore ? '🌐 在线' : '📴 离线'}
              </span>
              <button
                onClick={toggleOfflinePanel}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                📋 待同步
                {pendingOfflineCount > 0 && (
                  <span style={{
                    background: '#ff9800',
                    color: '#fff',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                  }}>
                    {pendingOfflineCount}
                  </span>
                )}
              </button>
            </div>
            <button
              onClick={toggleManualOfflineMode}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: 'none',
                background: isManualOfflineMode ? '#4caf50' : '#f44336',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
            >
              {isManualOfflineMode ? '▶️ 恢复联网' : '🔌 切换到离线模式'}
            </button>
            {isManualOfflineMode && (
              <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#ffccbc', textAlign: 'center' }}>
                所有操作将暂存本地，恢复联网后自动同步
              </p>
            )}
          </div>

          <div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#90a4ae' }}>
              {!isOnlineStore ? '📡 离线编辑操作:' : '💡 请先切换到离线模式'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                onClick={() => simulateFileEdit('modify')}
                disabled={isOnlineStore}
                title={isOnlineStore ? '请先切换到离线模式' : ''}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: !isOnlineStore ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                  color: !isOnlineStore ? '#fff' : '#546e7a',
                  cursor: !isOnlineStore ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  textAlign: 'left',
                  opacity: isOnlineStore ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isOnlineStore) e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                }}
                onMouseLeave={(e) => {
                  if (!isOnlineStore) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                📝 修改文件
              </button>
              <button
                onClick={() => simulateFileEdit('upload')}
                disabled={isOnlineStore}
                title={isOnlineStore ? '请先切换到离线模式' : ''}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: !isOnlineStore ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                  color: !isOnlineStore ? '#fff' : '#546e7a',
                  cursor: !isOnlineStore ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  textAlign: 'left',
                  opacity: isOnlineStore ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isOnlineStore) e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                }}
                onMouseLeave={(e) => {
                  if (!isOnlineStore) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                ⬆️ 上传新文件
              </button>
              <button
                onClick={() => simulateFileEdit('delete')}
                disabled={isOnlineStore}
                title={isOnlineStore ? '请先切换到离线模式' : ''}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: !isOnlineStore ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                  color: !isOnlineStore ? '#fff' : '#546e7a',
                  cursor: !isOnlineStore ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  textAlign: 'left',
                  opacity: isOnlineStore ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isOnlineStore) e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                }}
                onMouseLeave={(e) => {
                  if (!isOnlineStore) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                🗑️ 删除文件
              </button>
              <button
                onClick={simulateBatchEdits}
                disabled={isOnlineStore}
                title={isOnlineStore ? '请先切换到离线模式' : ''}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: !isOnlineStore ? '#1976d2' : 'rgba(255,255,255,0.05)',
                  color: !isOnlineStore ? '#fff' : '#546e7a',
                  cursor: !isOnlineStore ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  textAlign: 'left',
                  fontWeight: 600,
                  opacity: isOnlineStore ? 0.5 : 1,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isOnlineStore) e.currentTarget.style.background = '#1565c0';
                }}
                onMouseLeave={(e) => {
                  if (!isOnlineStore) e.currentTarget.style.background = '#1976d2';
                }}
              >
                📦 批量操作 (5个)
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main style={{ flex: 1, overflow: 'auto', background: '#fafafa' }}>
        {renderContent()}
      </main>
      <DeviceOnboardingWizard />
      {isOfflinePanelOpen && (
        <OfflineSyncPanel
          changes={offlineChanges}
          progress={offlineSyncProgress}
          isOnline={isOnlineStore}
          isManualOfflineMode={isManualOfflineMode}
          onStartSync={startOfflineSync}
          onRetry={retryOfflineChange}
          onRetryAll={retryAllFailedOfflineChanges}
          onClearSynced={clearSyncedOfflineChanges}
          onRemove={removeOfflineChange}
          onClose={toggleOfflinePanel}
          onToggleOfflineMode={toggleManualOfflineMode}
        />
      )}
      {isNotificationCenterOpen && (
        <NotificationCenter
          notifications={notifications}
          onClose={closeNotificationCenter}
          onMarkAsRead={markNotificationAsRead}
          onMarkAllAsRead={markAllNotificationsAsRead}
          onRemove={removeNotification}
          onClearAll={clearAllNotifications}
          onAction={handleNotificationAction}
        />
      )}
    </div>
  );
};
export default App;
