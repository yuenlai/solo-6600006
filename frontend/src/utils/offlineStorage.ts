import { OfflineChange } from '../types';

const STORAGE_KEY = 'file_sync_offline_changes';

export const offlineStorage = {
  getAll: (): OfflineChange[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveAll: (changes: OfflineChange[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(changes));
    } catch (e) {
      console.error('Failed to save offline changes:', e);
    }
  },

  add: (change: OfflineChange): void => {
    const changes = offlineStorage.getAll();
    changes.push(change);
    offlineStorage.saveAll(changes);
  },

  update: (id: string, updates: Partial<OfflineChange>): void => {
    const changes = offlineStorage.getAll();
    const index = changes.findIndex(c => c.id === id);
    if (index !== -1) {
      changes[index] = { ...changes[index], ...updates };
      offlineStorage.saveAll(changes);
    }
  },

  remove: (id: string): void => {
    const changes = offlineStorage.getAll();
    offlineStorage.saveAll(changes.filter(c => c.id !== id));
  },

  clearSynced: (): void => {
    const changes = offlineStorage.getAll();
    offlineStorage.saveAll(changes.filter(c => c.status !== 'success'));
  },

  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  getPendingCount: (): number => {
    const changes = offlineStorage.getAll();
    return changes.filter(c => c.status === 'pending' || c.status === 'failed').length;
  },
};
