import { create } from 'zustand';
import { SyncFile, SyncFolder, Device, SyncConflict } from '../types';

interface SyncState {
  files: SyncFile[]; folders: SyncFolder[]; devices: Device[];
  conflicts: SyncConflict[]; currentFolder: string; syncProgress: number;
  setFiles: (files: SyncFile[]) => void;
  resolveConflict: (id: string, resolution: 'local' | 'remote' | 'merge') => void;
  setCurrentFolder: (path: string) => void;
  startSync: (folderId: string) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  files: [], folders: [], devices: [], conflicts: [],
  currentFolder: '/', syncProgress: 0,
  setFiles: (files) => set({ files }),
  resolveConflict: (id, resolution) => set({
    conflicts: useSyncStore.getState().conflicts.map(c =>
      c.id === id ? { ...c, resolved: true, resolution } : c)
  }),
  setCurrentFolder: (path) => set({ currentFolder: path }),
  startSync: () => set({ syncProgress: 0 }),
}));
