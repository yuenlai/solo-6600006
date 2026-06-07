import { create } from 'zustand';
import { SyncFile, SyncFolder, Device, SyncConflict, SyncActivity, FileVersion, RecycleBinItem, RestoreResult, DeviceWizardData, SpaceValidationResult, SyncSchedule, ScheduleExecution, ShareLink, LargeFileTransferItem, StorageAnalysisData, OfflineChange, SyncProgress } from '../types';
import { offlineStorage } from '../utils/offlineStorage';

const now = new Date();

const mockStorageAnalysis: StorageAnalysisData = {
  totalStorageUsed: 53687091200,
  totalFiles: 1247,
  byDirectory: [
    { path: '/videos', name: 'videos', size: 21474836480, fileCount: 156, subdirectories: 8, lastModified: '2026-06-06T10:30:00Z' },
    { path: '/photos', name: 'photos', size: 16106127360, fileCount: 892, subdirectories: 12, lastModified: '2026-06-05T15:20:00Z' },
    { path: '/backup', name: 'backup', size: 8589934592, fileCount: 23, subdirectories: 3, lastModified: '2026-06-04T08:00:00Z' },
    { path: '/docs', name: 'docs', size: 4294967296, fileCount: 128, subdirectories: 6, lastModified: '2026-06-06T11:00:00Z' },
    { path: '/data', name: 'data', size: 2147483648, fileCount: 35, subdirectories: 2, lastModified: '2026-06-03T14:30:00Z' },
    { path: '/design', name: 'design', size: 1073741824, fileCount: 13, subdirectories: 1, lastModified: '2026-06-02T09:15:00Z' },
  ],
  byFileType: [
    { extension: '.mp4', category: '视频文件', size: 19327352832, fileCount: 128, color: '#e53935' },
    { extension: '.jpg', category: '图片文件', size: 13958643712, fileCount: 756, color: '#1e88e5' },
    { extension: '.zip', category: '压缩文件', size: 8589934592, fileCount: 18, color: '#fdd835' },
    { extension: '.pdf', category: '文档文件', size: 3221225472, fileCount: 89, color: '#43a047' },
    { extension: '.psd', category: '设计文件', size: 4294967296, fileCount: 12, color: '#8e24aa' },
    { extension: '.csv', category: '数据文件', size: 1073741824, fileCount: 28, color: '#fb8c00' },
    { extension: '.docx', category: 'Word文档', size: 1073741824, fileCount: 45, color: '#00897b' },
    { extension: '.其他', category: '其他文件', size: 2147483648, fileCount: 171, color: '#757575' },
  ],
  byDevice: [
    { deviceId: 'd1', deviceName: 'MacBook Pro', platform: 'mac', storageUsed: 5368709120, storageTotal: 107374182400, fileCount: 892, lastSync: '2026-06-06T12:00:00Z', status: 'online' },
    { deviceId: 'd2', deviceName: 'Ubuntu Server', platform: 'linux', storageUsed: 10737418240, storageTotal: 53687091200, fileCount: 456, lastSync: '2026-06-06T11:00:00Z', status: 'online' },
    { deviceId: 'd3', deviceName: 'Windows Desktop', platform: 'windows', storageUsed: 2147483648, storageTotal: 107374182400, fileCount: 234, lastSync: '2026-06-05T20:00:00Z', status: 'offline' },
  ],
};

const mockConflicts: SyncConflict[] = [
  {
    id: 'conflict-1',
    fileId: '3',
    fileName: 'img001.jpg',
    filePath: '/photos/img001.jpg',
    localVersion: {
      id: 'v-local-1',
      version: 3,
      size: 3145728,
      hash: 'localhash1234567890abcdef',
      createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
      author: '张三',
      changeType: 'modified',
      device: 'MacBook Pro',
    },
    remoteVersion: {
      id: 'v-remote-1',
      version: 4,
      size: 3670016,
      hash: 'remotehashabcdef1234567890',
      createdAt: new Date(now.getTime() - 1 * 3600000).toISOString(),
      author: '李四',
      changeType: 'modified',
      device: 'Windows Desktop',
    },
    resolved: false,
    reason: 'both_modified',
    reasonDescription: '本地和远程设备在同一时间段内分别修改了该文件，内容存在差异需要手动确认。',
  },
  {
    id: 'conflict-2',
    fileId: '10',
    fileName: '项目方案.docx',
    filePath: '/docs/项目方案.docx',
    localVersion: {
      id: 'v-local-2',
      version: 2,
      size: 512000,
      hash: 'doclocal1234567890abcdef',
      createdAt: new Date(now.getTime() - 5 * 3600000).toISOString(),
      author: '王五',
      changeType: 'modified',
      device: 'MacBook Pro',
    },
    remoteVersion: {
      id: 'v-remote-2',
      version: 2,
      size: 524288,
      hash: 'docremoteabcdef1234567890',
      createdAt: new Date(now.getTime() - 3 * 3600000).toISOString(),
      author: '张三',
      changeType: 'modified',
      device: 'Ubuntu Server',
    },
    resolved: false,
    reason: 'content_modified',
    reasonDescription: '文件内容在本地被修改，但远程已有更新版本。',
  },
  {
    id: 'conflict-3',
    fileId: '11',
    fileName: 'data_backup.sql',
    filePath: '/backup/data_backup.sql',
    localVersion: {
      id: 'v-local-3',
      version: 1,
      size: 10485760,
      hash: 'sqllocal1234567890abcdef',
      createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
      author: '李四',
      changeType: 'deleted',
      device: 'Windows Desktop',
    },
    remoteVersion: {
      id: 'v-remote-3',
      version: 2,
      size: 15728640,
      hash: 'sqlremoteabcdef1234567890',
      createdAt: new Date(now.getTime() - 12 * 3600000).toISOString(),
      author: '王五',
      changeType: 'modified',
      device: 'Ubuntu Server',
    },
    resolved: false,
    reason: 'delete_modify_conflict',
    reasonDescription: '本地已删除该文件，但远程在删除后又进行了修改。',
  },
  {
    id: 'conflict-4',
    fileId: '12',
    fileName: 'config.json',
    filePath: '/config/config.json',
    localVersion: {
      id: 'v-local-4',
      version: 1,
      size: 2048,
      hash: 'configlocal1234567890abcd',
      createdAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
      author: '张三',
      changeType: 'added',
      device: 'MacBook Pro',
    },
    remoteVersion: {
      id: 'v-remote-4',
      version: 1,
      size: 3072,
      hash: 'configremoteabcdef12345678',
      createdAt: new Date(now.getTime() - 36 * 3600000).toISOString(),
      author: '李四',
      changeType: 'added',
      device: 'Windows Desktop',
    },
    resolved: true,
    resolution: 'remote',
    reason: 'name_conflict',
    reasonDescription: '两个不同内容的文件使用了相同的文件名。',
    resolvedAt: new Date(now.getTime() - 6 * 3600000).toISOString(),
    resolvedBy: '用户',
  },
];

interface VersionHistoryViewState {
  isOpen: boolean;
  fileId: string | null;
  selectedVersionIds: [string, string] | null;
  showCompare: boolean;
}

interface SyncState {
  files: SyncFile[]; folders: SyncFolder[]; devices: Device[];
  conflicts: SyncConflict[]; activities: SyncActivity[];
  recycleBin: RecycleBinItem[];
  currentFolder: string; syncProgress: number;
  versionHistory: VersionHistoryViewState;
  isOnboardingWizardOpen: boolean;
  onboardingWizardData: DeviceWizardData;
  schedules: SyncSchedule[];
  scheduleExecutions: ScheduleExecution[];
  shareLinks: ShareLink[];
  shareLinksPanelOpen: boolean;
  shareLinksPanelFileId: string | null;
  largeFileTransfers: LargeFileTransferItem[];
  storageAnalysis: StorageAnalysisData;
  offlineChanges: OfflineChange[];
  offlineSyncProgress: SyncProgress;
  isOfflinePanelOpen: boolean;
  isOnline: boolean;
  setFiles: (files: SyncFile[]) => void;
  setConflicts: (conflicts: SyncConflict[]) => void;
  resolveConflict: (id: string, resolution: 'local' | 'remote' | 'merge') => void;
  batchResolveConflicts: (ids: string[], resolution: 'local' | 'remote' | 'merge') => void;
  setCurrentFolder: (path: string) => void;
  startSync: (folderId: string) => void;
  addActivity: (activity: SyncActivity) => void;
  setActivities: (activities: SyncActivity[]) => void;
  openVersionHistory: (fileId: string) => void;
  closeVersionHistory: () => void;
  selectVersionsForCompare: (oldVersionId: string, newVersionId: string) => void;
  closeCompare: () => void;
  restoreVersion: (fileId: string, version: FileVersion) => void;
  setRecycleBin: (items: RecycleBinItem[]) => void;
  addToRecycleBin: (item: RecycleBinItem) => void;
  restoreFromRecycleBin: (itemId: string) => RestoreResult;
  deleteFromRecycleBin: (itemId: string) => void;
  clearExpiredRecycleBin: () => void;
  setDevices: (devices: Device[]) => void;
  addDevice: (device: Device) => void;
  openOnboardingWizard: () => void;
  closeOnboardingWizard: () => void;
  updateOnboardingData: (data: Partial<DeviceWizardData>) => void;
  validateSpace: (requiredSpace: number) => SpaceValidationResult;
  completeOnboarding: () => Device;
  setSchedules: (schedules: SyncSchedule[]) => void;
  addSchedule: (schedule: Omit<SyncSchedule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSchedule: (id: string, updates: Partial<SyncSchedule>) => void;
  deleteSchedule: (id: string) => void;
  toggleSchedule: (id: string) => void;
  runScheduleNow: (id: string) => void;
  setScheduleExecutions: (executions: ScheduleExecution[]) => void;
  setShareLinks: (links: ShareLink[]) => void;
  addShareLink: (link: ShareLink) => void;
  updateShareLink: (id: string, updates: Partial<ShareLink>) => void;
  deleteShareLink: (id: string) => void;
  openShareLinksPanel: (fileId: string) => void;
  closeShareLinksPanel: () => void;
  setLargeFileTransfers: (transfers: LargeFileTransferItem[]) => void;
  addLargeFileTransfer: (transfer: Omit<LargeFileTransferItem, 'id' | 'startTime' | 'retryCount'>) => void;
  updateLargeFileTransfer: (id: string, updates: Partial<LargeFileTransferItem>) => void;
  removeLargeFileTransfer: (id: string) => void;
  pauseLargeFileTransfer: (id: string) => void;
  resumeLargeFileTransfer: (id: string) => void;
  retryLargeFileTransfer: (id: string) => void;
  cancelLargeFileTransfer: (id: string) => void;
  setStorageAnalysis: (data: StorageAnalysisData) => void;
  setIsOnline: (online: boolean) => void;
  addOfflineChange: (change: Omit<OfflineChange, 'id' | 'createdAt' | 'status' | 'retryCount'>) => void;
  updateOfflineChange: (id: string, updates: Partial<OfflineChange>) => void;
  removeOfflineChange: (id: string) => void;
  loadOfflineChanges: () => void;
  startOfflineSync: () => void;
  retryOfflineChange: (id: string) => void;
  retryAllFailedOfflineChanges: () => void;
  clearSyncedOfflineChanges: () => void;
  toggleOfflinePanel: () => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  files: [], folders: [], devices: [], conflicts: [...mockConflicts], activities: [],
  recycleBin: [],
  currentFolder: '/', syncProgress: 0,
  largeFileTransfers: [],
  storageAnalysis: mockStorageAnalysis,
  offlineChanges: [],
  offlineSyncProgress: {
    total: 0,
    completed: 0,
    failed: 0,
    isSyncing: false,
  },
  isOfflinePanelOpen: false,
  isOnline: true,
  versionHistory: {
    isOpen: false,
    fileId: null,
    selectedVersionIds: null,
    showCompare: false,
  },
  isOnboardingWizardOpen: false,
  onboardingWizardData: {
    name: '',
    platform: 'windows',
    storageTotal: 107374182400,
    storageUsed: 0,
    syncDirectories: [],
    permissions: {
      readFiles: true,
      writeFiles: true,
      deleteFiles: false,
      autoSync: true,
    },
  },
  schedules: [],
  scheduleExecutions: [],
  shareLinks: [],
  shareLinksPanelOpen: false,
  shareLinksPanelFileId: null,
  setFiles: (files) => set({ files }),
  setConflicts: (conflicts) => set({ conflicts }),
  resolveConflict: (id, resolution) => set((state) => ({
    conflicts: state.conflicts.map(c =>
      c.id === id ? { ...c, resolved: true, resolution, resolvedAt: new Date().toISOString(), resolvedBy: '用户' } : c)
  })),
  batchResolveConflicts: (ids, resolution) => set((state) => ({
    conflicts: state.conflicts.map(c =>
      ids.includes(c.id) ? { ...c, resolved: true, resolution, resolvedAt: new Date().toISOString(), resolvedBy: '用户' } : c)
  })),
  setCurrentFolder: (path) => set({ currentFolder: path }),
  startSync: () => set({ syncProgress: 0 }),
  addActivity: (activity) => set((state) => ({
    activities: [activity, ...state.activities].slice(0, 100)
  })),
  setActivities: (activities) => set({ activities }),
  openVersionHistory: (fileId) => set({
    versionHistory: {
      isOpen: true,
      fileId,
      selectedVersionIds: null,
      showCompare: false,
    }
  }),
  closeVersionHistory: () => set({
    versionHistory: {
      isOpen: false,
      fileId: null,
      selectedVersionIds: null,
      showCompare: false,
    }
  }),
  selectVersionsForCompare: (oldVersionId, newVersionId) => set((state) => ({
    versionHistory: {
      ...state.versionHistory,
      selectedVersionIds: [oldVersionId, newVersionId],
      showCompare: true,
    }
  })),
  closeCompare: () => set((state) => ({
    versionHistory: {
      ...state.versionHistory,
      selectedVersionIds: null,
      showCompare: false,
    }
  })),
  restoreVersion: (fileId, version) => {
    const state = get();
    const file = state.files.find(f => f.id === fileId);
    if (file) {
      const activity: SyncActivity = {
        id: `act-${Date.now()}`,
        fileId: file.id,
        fileName: file.name,
        filePath: file.path,
        status: 'success',
        action: 'modify',
        timestamp: new Date().toISOString(),
        device: version.device,
        size: version.size,
      };
      get().addActivity(activity);
    }
    set((state) => ({
      versionHistory: {
        ...state.versionHistory,
        isOpen: false,
        fileId: null,
        selectedVersionIds: null,
        showCompare: false,
      }
    }));
  },
  setRecycleBin: (items) => set({ recycleBin: items }),
  addToRecycleBin: (item) => set((state) => ({
    recycleBin: [item, ...state.recycleBin]
  })),
  restoreFromRecycleBin: (itemId) => {
    const state = get();
    const item = state.recycleBin.find(i => i.id === itemId);
    if (!item) {
      return { success: false, message: '文件不存在于回收站中' };
    }
    if (item.restored) {
      return { success: false, message: '该文件已被恢复' };
    }
    const now = new Date();
    const expiresAt = new Date(item.expiresAt);
    if (now > expiresAt) {
      return { success: false, message: '文件已超过保留期限，无法恢复' };
    }
    const updatedItem: RecycleBinItem = {
      ...item,
      restored: true,
      restoredAt: now.toISOString(),
      restoredTo: item.filePath,
    };
    set((state) => ({
      recycleBin: state.recycleBin.map(i => 
        i.id === itemId ? updatedItem : i
      ),
    }));
    const activity: SyncActivity = {
      id: `act-${Date.now()}`,
      fileId: item.fileId,
      fileName: item.fileName,
      filePath: item.filePath,
      status: 'success',
      action: 'upload',
      timestamp: now.toISOString(),
      device: item.deletedFrom,
      size: item.size,
    };
    get().addActivity(activity);
    return { success: true, message: `文件已恢复到: ${item.filePath}`, item: updatedItem };
  },
  deleteFromRecycleBin: (itemId) => set((state) => ({
    recycleBin: state.recycleBin.filter(i => i.id !== itemId)
  })),
  clearExpiredRecycleBin: () => {
    const now = new Date();
    set((state) => ({
      recycleBin: state.recycleBin.filter(item => {
        const expiresAt = new Date(item.expiresAt);
        return now <= expiresAt && !item.restored;
      })
    }));
  },
  setDevices: (devices) => set({ devices }),
  addDevice: (device) => set((state) => ({
    devices: [...state.devices, device],
  })),
  openOnboardingWizard: () => set({
    isOnboardingWizardOpen: true,
    onboardingWizardData: {
      name: '',
      platform: 'windows',
      storageTotal: 107374182400,
      storageUsed: 0,
      syncDirectories: [],
      permissions: {
        readFiles: true,
        writeFiles: true,
        deleteFiles: false,
        autoSync: true,
      },
    },
  }),
  closeOnboardingWizard: () => set({
    isOnboardingWizardOpen: false,
  }),
  updateOnboardingData: (data) => set((state) => ({
    onboardingWizardData: { ...state.onboardingWizardData, ...data },
  })),
  validateSpace: (requiredSpace) => {
    const data = get().onboardingWizardData;
    const availableSpace = data.storageTotal - data.storageUsed;
    const valid = availableSpace >= requiredSpace;
    return {
      valid,
      availableSpace,
      requiredSpace,
      message: valid
        ? `空间充足，可用 ${(availableSpace / 1024 / 1024 / 1024).toFixed(1)} GB`
        : `空间不足，需要 ${(requiredSpace / 1024 / 1024 / 1024).toFixed(1)} GB，可用 ${(availableSpace / 1024 / 1024 / 1024).toFixed(1)} GB`,
    };
  },
  completeOnboarding: () => {
    const data = get().onboardingWizardData;
    const newDevice: Device = {
      id: `device-${Date.now()}`,
      name: data.name,
      platform: data.platform,
      lastSeen: new Date().toISOString(),
      status: 'online',
      storageUsed: data.storageUsed,
      storageTotal: data.storageTotal,
    };
    get().addDevice(newDevice);
    set({ isOnboardingWizardOpen: false });
    return newDevice;
  },
  setSchedules: (schedules) => set({ schedules }),
  addSchedule: (schedule) => {
    const now = new Date().toISOString();
    const newSchedule: SyncSchedule = {
      ...schedule,
      id: `sch-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      schedules: [...state.schedules, newSchedule],
    }));
  },
  updateSchedule: (id, updates) => set((state) => ({
    schedules: state.schedules.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    ),
  })),
  deleteSchedule: (id) => set((state) => ({
    schedules: state.schedules.filter(s => s.id !== id),
  })),
  toggleSchedule: (id) => set((state) => ({
    schedules: state.schedules.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled, updatedAt: new Date().toISOString() } : s
    ),
  })),
  runScheduleNow: (id) => {
    const schedule = get().schedules.find(s => s.id === id);
    if (schedule) {
      const execution: ScheduleExecution = {
        id: `exe-${Date.now()}`,
        scheduleId: id,
        folderId: schedule.folderId,
        status: 'running',
        startTime: new Date().toISOString(),
      };
      set((state) => ({
        scheduleExecutions: [execution, ...state.scheduleExecutions],
      }));
      get().startSync(schedule.folderId);
      setTimeout(() => {
        set((state) => ({
          scheduleExecutions: state.scheduleExecutions.map(e =>
            e.id === execution.id
              ? { ...e, status: 'success', endTime: new Date().toISOString(), filesSynced: Math.floor(Math.random() * 10) + 1 }
              : e
          ),
          schedules: state.schedules.map(s =>
            s.id === id ? { ...s, lastRun: new Date().toISOString() } : s
          ),
        }));
      }, 2000);
    }
  },
  setScheduleExecutions: (executions) => set({ scheduleExecutions: executions }),
  setShareLinks: (links) => set({ shareLinks: links }),
  addShareLink: (link) => set((state) => ({
    shareLinks: [link, ...state.shareLinks],
  })),
  updateShareLink: (id, updates) => set((state) => ({
    shareLinks: state.shareLinks.map(l =>
      l.id === id ? { ...l, ...updates } : l
    ),
  })),
  deleteShareLink: (id) => set((state) => ({
    shareLinks: state.shareLinks.filter(l => l.id !== id),
  })),
  openShareLinksPanel: (fileId) => set({
    shareLinksPanelOpen: true,
    shareLinksPanelFileId: fileId,
  }),
  closeShareLinksPanel: () => set({
    shareLinksPanelOpen: false,
    shareLinksPanelFileId: null,
  }),
  setLargeFileTransfers: (transfers) => set({ largeFileTransfers: transfers }),
  addLargeFileTransfer: (transfer) => {
    const newTransfer: LargeFileTransferItem = {
      ...transfer,
      id: `lft-${Date.now()}`,
      startTime: new Date().toISOString(),
      retryCount: 0,
    };
    set((state) => ({
      largeFileTransfers: [newTransfer, ...state.largeFileTransfers],
    }));
  },
  updateLargeFileTransfer: (id, updates) => set((state) => ({
    largeFileTransfers: state.largeFileTransfers.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ),
  })),
  removeLargeFileTransfer: (id) => set((state) => ({
    largeFileTransfers: state.largeFileTransfers.filter(t => t.id !== id),
  })),
  pauseLargeFileTransfer: (id) => set((state) => ({
    largeFileTransfers: state.largeFileTransfers.map(t =>
      t.id === id ? { ...t, status: 'paused', speed: 0 } : t
    ),
  })),
  resumeLargeFileTransfer: (id) => set((state) => ({
    largeFileTransfers: state.largeFileTransfers.map(t =>
      t.id === id ? { ...t, status: 'uploading', speed: 1048576 } : t
    ),
  })),
  retryLargeFileTransfer: (id) => set((state) => ({
    largeFileTransfers: state.largeFileTransfers.map(t =>
      t.id === id ? {
        ...t,
        status: 'uploading',
        uploaded: 0,
        errorMessage: undefined,
        retryCount: t.retryCount + 1,
        startTime: new Date().toISOString(),
        speed: 1048576,
      } : t
    ),
  })),
  cancelLargeFileTransfer: (id) => set((state) => ({
    largeFileTransfers: state.largeFileTransfers.filter(t => t.id !== id),
  })),
  setStorageAnalysis: (data) => set({ storageAnalysis: data }),

  setIsOnline: (online) => set({ isOnline: online }),

  addOfflineChange: (change) => {
    const state = get();
    if (state.isOnline) {
      console.warn('设备当前在线，操作将直接同步，不进入离线暂存队列');
      return;
    }
    const newChange: OfflineChange = {
      ...change,
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    };
    offlineStorage.add(newChange);
    set((s) => ({
      offlineChanges: [...s.offlineChanges, newChange],
    }));
  },

  updateOfflineChange: (id, updates) => {
    offlineStorage.update(id, updates);
    set((state) => ({
      offlineChanges: state.offlineChanges.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },

  removeOfflineChange: (id) => {
    offlineStorage.remove(id);
    set((state) => ({
      offlineChanges: state.offlineChanges.filter((c) => c.id !== id),
    }));
  },

  loadOfflineChanges: () => {
    const changes = offlineStorage.getAll();
    set({ offlineChanges: changes });
  },

  startOfflineSync: () => {
    const state = get();
    const pendingChanges = state.offlineChanges.filter(
      (c) => c.status === 'pending' || c.status === 'failed'
    );

    if (pendingChanges.length === 0 || !state.isOnline) return;

    set({
      offlineSyncProgress: {
        total: pendingChanges.length,
        completed: 0,
        failed: 0,
        isSyncing: true,
        currentFile: pendingChanges[0].fileName,
      },
    });

    let completed = 0;
    let failed = 0;

    pendingChanges.forEach((change, index) => {
      setTimeout(() => {
        set((s) => ({
          offlineChanges: s.offlineChanges.map((c) =>
            c.id === change.id ? { ...c, status: 'syncing' as const } : c
          ),
        }));
      }, 800 + index * 600 - 200);

      setTimeout(() => {
        const success = Math.random() > 0.15;

        if (success) {
          completed++;
          offlineStorage.update(change.id, {
            status: 'success',
            syncedAt: new Date().toISOString(),
          });
          const activity: SyncActivity = {
            id: `act-${Date.now()}-${index}`,
            fileId: change.fileId,
            fileName: change.fileName,
            filePath: change.filePath,
            status: 'success',
            action: change.action,
            timestamp: new Date().toISOString(),
            size: change.size,
            device: '本地设备',
          };
          get().addActivity(activity);
        } else {
          failed++;
          offlineStorage.update(change.id, {
            status: 'failed',
            errorMessage: '同步失败，请稍后重试',
            retryCount: change.retryCount + 1,
          });
        }

        const nextChange = pendingChanges[index + 1];
        set((s) => ({
          offlineChanges: s.offlineChanges.map((c) => {
            if (c.id === change.id) {
              return success
                ? { ...c, status: 'success' as const, syncedAt: new Date().toISOString() }
                : { ...c, status: 'failed' as const, errorMessage: '同步失败，请稍后重试', retryCount: c.retryCount + 1 };
            }
            return c;
          }),
          offlineSyncProgress: {
            total: pendingChanges.length,
            completed,
            failed,
            isSyncing: index < pendingChanges.length - 1,
            currentFile: nextChange?.fileName,
          },
        }));
      }, 800 + index * 600);
    });
  },

  retryOfflineChange: (id) => {
    const state = get();
    const change = state.offlineChanges.find((c) => c.id === id);
    if (!change || !state.isOnline) return;

    set((s) => ({
      offlineChanges: s.offlineChanges.map((c) =>
        c.id === id ? { ...c, status: 'syncing' as const, errorMessage: undefined } : c
      ),
    }));

    setTimeout(() => {
      const success = Math.random() > 0.2;
      if (success) {
        get().updateOfflineChange(id, {
          status: 'success',
          syncedAt: new Date().toISOString(),
        });
        const activity: SyncActivity = {
          id: `act-${Date.now()}`,
          fileId: change.fileId,
          fileName: change.fileName,
          filePath: change.filePath,
          status: 'success',
          action: change.action,
          timestamp: new Date().toISOString(),
          size: change.size,
          device: '本地设备',
        };
        get().addActivity(activity);
      } else {
        get().updateOfflineChange(id, {
          status: 'failed',
          errorMessage: '同步失败，请稍后重试',
          retryCount: change.retryCount + 1,
        });
      }
    }, 800);
  },

  retryAllFailedOfflineChanges: () => {
    const state = get();
    const failedChanges = state.offlineChanges.filter((c) => c.status === 'failed');
    failedChanges.forEach((c) => get().retryOfflineChange(c.id));
  },

  clearSyncedOfflineChanges: () => {
    offlineStorage.clearSynced();
    set((state) => ({
      offlineChanges: state.offlineChanges.filter((c) => c.status !== 'success'),
    }));
  },

  toggleOfflinePanel: () => {
    set((state) => ({ isOfflinePanelOpen: !state.isOfflinePanelOpen }));
  },
}));
