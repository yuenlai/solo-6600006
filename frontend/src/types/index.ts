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

export type WizardStep = 'name' | 'space' | 'directory' | 'permissions';

export interface DeviceWizardData {
  name: string;
  platform: string;
  storageTotal: number;
  storageUsed: number;
  syncDirectories: string[];
  permissions: {
    readFiles: boolean;
    writeFiles: boolean;
    deleteFiles: boolean;
    autoSync: boolean;
  };
}

export interface SpaceValidationResult {
  valid: boolean;
  availableSpace: number;
  requiredSpace: number;
  message: string;
}

export type ScheduleType = 'workday' | 'night' | 'custom';
export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimeRange {
  start: string;
  end: string;
}

export interface SyncSchedule {
  id: string;
  folderId: string;
  folderName: string;
  folderPath: string;
  scheduleType: ScheduleType;
  enabled: boolean;
  weekdays: Weekday[];
  timeRange: TimeRange;
  intervalMinutes?: number;
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleExecution {
  id: string;
  scheduleId: string;
  folderId: string;
  status: 'success' | 'failed' | 'running' | 'skipped';
  startTime: string;
  endTime?: string;
  filesSynced?: number;
  errorMessage?: string;
}

export interface ShareLink {
  id: string;
  token: string;
  fileId: string;
  fileName: string;
  filePath: string;
  versionId?: string;
  versionNumber?: number;
  size: number;
  hash: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  accessCount: number;
  maxAccessCount?: number;
  isActive: boolean;
}

export interface CreateShareLinkRequest {
  fileId: string;
  fileName: string;
  filePath: string;
  versionId?: string;
  versionNumber?: number;
  size: number;
  hash: string;
  createdBy: string;
  expiresInHours: number;
  maxAccessCount?: number;
}

export interface ShareLinkAccessResult {
  valid: boolean;
  message: string;
  shareLink?: ShareLink;
}

export type LargeFileTransferStatus = 'uploading' | 'paused' | 'pending' | 'completed' | 'failed';

export interface LargeFileTransferItem {
  id: string;
  fileId: string;
  fileName: string;
  filePath: string;
  size: number;
  uploaded: number;
  status: LargeFileTransferStatus;
  speed: number;
  startTime: string;
  estimatedEndTime?: string;
  errorMessage?: string;
  device?: string;
  retryCount: number;
  maxRetries: number;
}
