import { create } from 'zustand';
import { SyncFile, SyncFolder, Device, SyncConflict, SyncActivity, FileVersion, RecycleBinItem, RestoreResult } from '../types';

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
}

export const useSyncStore = create<SyncState>((set, get) => ({
  files: [], folders: [], devices: [], conflicts: [], activities: [],
  recycleBin: [],
  currentFolder: '/', syncProgress: 0,
  versionHistory: {
    isOpen: false,
    fileId: null,
    selectedVersionIds: null,
    showCompare: false,
  },
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
}));
