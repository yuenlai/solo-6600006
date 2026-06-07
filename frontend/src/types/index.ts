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

export type ConflictReason = 'content_modified' | 'both_modified' | 'name_conflict' | 'delete_modify_conflict';

export interface SyncConflict {
  id: string;
  fileId: string;
  fileName: string;
  filePath: string;
  localVersion: FileVersion;
  remoteVersion: FileVersion;
  resolved: boolean;
  resolution?: 'local' | 'remote' | 'merge';
  reason: ConflictReason;
  reasonDescription: string;
  resolvedAt?: string;
  resolvedBy?: string;
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

export interface DirectoryStorageItem {
  path: string;
  name: string;
  size: number;
  fileCount: number;
  subdirectories: number;
  lastModified: string;
}

export interface FileTypeStorageItem {
  extension: string;
  category: string;
  size: number;
  fileCount: number;
  color: string;
}

export interface DeviceStorageItem {
  deviceId: string;
  deviceName: string;
  platform: string;
  storageUsed: number;
  storageTotal: number;
  fileCount: number;
  lastSync: string;
  status: 'online' | 'offline';
}

export interface StorageAnalysisData {
  totalStorageUsed: number;
  totalFiles: number;
  byDirectory: DirectoryStorageItem[];
  byFileType: FileTypeStorageItem[];
  byDevice: DeviceStorageItem[];
}

export type StorageViewMode = 'directory' | 'filetype' | 'device';

export type OfflineChangeAction = 'upload' | 'delete' | 'modify';
export type OfflineChangeStatus = 'pending' | 'syncing' | 'success' | 'failed';

export interface OfflineChange {
  id: string;
  fileId: string;
  fileName: string;
  filePath: string;
  action: OfflineChangeAction;
  size?: number;
  content?: string;
  status: OfflineChangeStatus;
  createdAt: string;
  syncedAt?: string;
  errorMessage?: string;
  retryCount: number;
}

export interface NetworkStatus {
  isOnline: boolean;
  lastOnline?: string;
  lastOffline?: string;
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  currentFile?: string;
  isSyncing: boolean;
}

export interface SnapshotFileItem {
  path: string;
  name: string;
  size: number;
  modifiedAt: string;
  hash: string;
}

export interface DirectorySnapshot {
  id: string;
  name: string;
  description?: string;
  directoryPath: string;
  directoryName: string;
  files: SnapshotFileItem[];
  totalSize: number;
  fileCount: number;
  createdAt: string;
  createdBy: string;
  device?: string;
}

export interface RestoreSnapshotResult {
  success: boolean;
  message: string;
  restoredCount?: number;
  errors?: string[];
}

export type IgnoreRuleType = 'extension' | 'name_pattern' | 'directory';

export interface IgnoreRule {
  id: string;
  type: IgnoreRuleType;
  pattern: string;
  description?: string;
  directoryPath: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IgnoreRuleGroup {
  directoryPath: string;
  directoryName: string;
  rules: IgnoreRule[];
}

export interface IgnoreRuleMatchResult {
  filePath: string;
  matched: boolean;
  matchedRule?: IgnoreRule;
}
