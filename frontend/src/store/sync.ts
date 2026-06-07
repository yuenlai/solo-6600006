import { create } from 'zustand';
import { SyncFile, SyncFolder, Device, SyncConflict, SyncActivity, FileVersion, RecycleBinItem, RestoreResult, DeviceWizardData, SpaceValidationResult, SyncSchedule, ScheduleExecution, ShareLink, LargeFileTransferItem } from '../types';

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
  setFiles: (files: SyncFile[]) => void;
  resolveConflict: (id: string, resolution: 'local' | 'remote' | 'merge') => void;
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
}

export const useSyncStore = create<SyncState>((set, get) => ({
  files: [], folders: [], devices: [], conflicts: [], activities: [],
  recycleBin: [],
  currentFolder: '/', syncProgress: 0,
  largeFileTransfers: [],
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
  resolveConflict: (id, resolution) => set({
    conflicts: useSyncStore.getState().conflicts.map(c =>
      c.id === id ? { ...c, resolved: true, resolution } : c)
  }),
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
}));
