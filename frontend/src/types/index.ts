export interface SyncFile {
  id: string; path: string; name: string; size: number;
  modifiedAt: string; status: 'synced' | 'modified' | 'conflict' | 'pending';
  versions: FileVersion[];
}

export interface FileVersion {
  id: string; version: number; size: number; hash: string;
  createdAt: string; author: string; changeType: 'added' | 'modified' | 'deleted';
}

export interface SyncFolder {
  id: string; name: string; path: string; deviceCount: number;
  lastSynced: string; status: 'syncing' | 'idle' | 'error';
}

export interface Device {
  id: string; name: string; platform: string; lastSeen: string;
  status: 'online' | 'offline'; storageUsed: number; storageTotal: number;
}

export interface SyncConflict {
  id: string; filePath: string; localVersion: FileVersion;
  remoteVersion: FileVersion; resolved: boolean; resolution?: 'local' | 'remote' | 'merge';
}
