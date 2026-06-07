export interface SyncFile {
  id: string; path: string; name: string; size: number;
  modifiedAt: string; status: 'synced' | 'modified' | 'conflict' | 'pending';
  versions: FileVersion[];
}

export interface FileVersion {
  id: string; version: number; size: number; hash: string;
  createdAt: string; author: string; changeType: 'added' | 'modified' | 'deleted';
  device?: string;
}

export interface VersionDiff {
  oldVersion: FileVersion;
  newVersion: FileVersion;
  sizeChange: number;
  summary: string;
  changedFields: string[];
}

export interface VersionHistoryState {
  selectedFileId: string | null;
  selectedVersions: [string, string] | null;
  showCompare: boolean;
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

export type SyncActivityStatus = 'success' | 'failed' | 'conflict' | 'pending';
export type SyncActivityAction = 'upload' | 'download' | 'delete' | 'modify';

export interface SyncActivity {
  id: string;
  fileId: string;
  fileName: string;
  filePath: string;
  status: SyncActivityStatus;
  action: SyncActivityAction;
  timestamp: string;
  errorMessage?: string;
  device?: string;
  size?: number;
}

export interface RecycleBinItem {
  id: string;
  fileId: string;
  fileName: string;
  filePath: string;
  size: number;
  hash: string;
  deletedAt: string;
  deletedBy: string;
  deletedFrom: string;
  expiresAt: string;
  restored: boolean;
  restoredAt?: string;
  restoredTo?: string;
}

export interface RestoreResult {
  success: boolean;
  message: string;
  item?: RecycleBinItem;
}
