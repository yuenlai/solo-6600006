import { create } from 'zustand';
import { SyncFile, SyncFolder, Device, SyncConflict, SyncActivity } from '../types';

interface SyncState {
  files: SyncFile[]; folders: SyncFolder[]; devices: Device[];
  conflicts: SyncConflict[]; activities: SyncActivity[];
  currentFolder: string; syncProgress: number;
  setFiles: (files: SyncFile[]) => void;
  resolveConflict: (id: string, resolution: 'local' | 'remote' | 'merge') => void;
  setCurrentFolder: (path: string) => void;
  startSync: (folderId: string) => void;
  addActivity: (activity: SyncActivity) => void;
  setActivities: (activities: SyncActivity[]) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  files: [], folders: [], devices: [], conflicts: [], activities: [],
  currentFolder: '/', syncProgress: 0,
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
}));
