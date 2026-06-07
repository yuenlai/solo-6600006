import { create } from 'zustand';
import { SyncFile, SyncFolder, Device, SyncConflict, SyncActivity, FileVersion } from '../types';

interface VersionHistoryViewState {
  isOpen: boolean;
  fileId: string | null;
  selectedVersionIds: [string, string] | null;
  showCompare: boolean;
}

interface SyncState {
  files: SyncFile[]; folders: SyncFolder[]; devices: Device[];
  conflicts: SyncConflict[]; activities: SyncActivity[];
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
}

export const useSyncStore = create<SyncState>((set) => ({
  files: [], folders: [], devices: [], conflicts: [], activities: [],
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
    const state = useSyncStore.getState();
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
      useSyncStore.getState().addActivity(activity);
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
}));
