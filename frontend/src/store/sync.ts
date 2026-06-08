import { create } from 'zustand';
import { SyncFile, SyncFolder, Device, SyncConflict, SyncActivity, FileVersion, RecycleBinItem, RestoreResult, DeviceWizardData, SpaceValidationResult, SyncSchedule, ScheduleExecution, ShareLink, LargeFileTransferItem, StorageAnalysisData, OfflineChange, SyncProgress, DirectorySnapshot, RestoreSnapshotResult, SelectiveRestoreSnapshotResult, SnapshotFileItem, IgnoreRule, IgnoreRuleMatchResult, Notification, Workspace, WorkspaceMember, WorkspaceFileActivity, WorkspaceRole, BandwidthStrategy, SyncTemplate, SensitiveProtection, ProtectionMode, ProtectionVerifyResult, DailySyncReport, SyncResultSummary, SyncResultDetail } from '../types';
import { offlineStorage } from '../utils/offlineStorage';

const now = new Date();

const mockIgnoreRules: IgnoreRule[] = [
  {
    id: 'rule-1',
    type: 'extension',
    pattern: '.tmp',
    description: '临时文件',
    directoryPath: '/',
    enabled: true,
    createdAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
  },
  {
    id: 'rule-2',
    type: 'extension',
    pattern: '.log',
    description: '日志文件',
    directoryPath: '/',
    enabled: true,
    createdAt: new Date(now.getTime() - 25 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 25 * 86400000).toISOString(),
  },
  {
    id: 'rule-3',
    type: 'name_pattern',
    pattern: 'node_modules',
    description: 'Node.js 依赖目录',
    directoryPath: '/',
    enabled: true,
    createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
  },
  {
    id: 'rule-4',
    type: 'name_pattern',
    pattern: '.DS_Store',
    description: 'macOS 系统文件',
    directoryPath: '/',
    enabled: true,
    createdAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
  },
  {
    id: 'rule-5',
    type: 'extension',
    pattern: '.cache',
    description: '缓存文件',
    directoryPath: '/data',
    enabled: false,
    createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
  },
  {
    id: 'rule-6',
    type: 'directory',
    pattern: 'backup',
    description: '本地备份目录',
    directoryPath: '/docs',
    enabled: true,
    createdAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
  },
];

const mockBandwidthStrategies: BandwidthStrategy[] = [
  {
    id: 'bw-1',
    deviceId: 'd1',
    deviceName: 'MacBook Pro',
    networkType: 'wifi',
    foregroundLimit: { upload: 0, download: 0 },
    backgroundLimit: { upload: 5120, download: 10240 },
    enabled: true,
    backgroundTimeRange: { start: '22:00', end: '08:00' },
    createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
  },
  {
    id: 'bw-2',
    deviceId: 'd1',
    deviceName: 'MacBook Pro',
    networkType: 'cellular',
    foregroundLimit: { upload: 1024, download: 2048 },
    backgroundLimit: { upload: 256, download: 512 },
    enabled: true,
    backgroundTimeRange: { start: '23:00', end: '07:00' },
    createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
  },
  {
    id: 'bw-3',
    deviceId: 'd2',
    deviceName: 'Ubuntu Server',
    networkType: 'ethernet',
    foregroundLimit: { upload: 0, download: 0 },
    backgroundLimit: { upload: 0, download: 0 },
    enabled: true,
    backgroundTimeRange: { start: '20:00', end: '06:00' },
    createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
  },
  {
    id: 'bw-4',
    deviceId: 'd3',
    deviceName: 'Windows Desktop',
    networkType: 'wifi',
    foregroundLimit: { upload: 5120, download: 10240 },
    backgroundLimit: { upload: 1024, download: 2048 },
    enabled: false,
    backgroundTimeRange: { start: '22:00', end: '08:00' },
    createdAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
  },
];

const mockSyncTemplates: SyncTemplate[] = [
  {
    id: 'tpl-1',
    name: '办公电脑标准配置',
    description: '适用于日常办公电脑，同步文档和图片目录，只读+写入权限',
    platform: 'windows',
    syncDirectories: ['/Users/Documents', '/Users/Pictures', '/Users/Desktop'],
    permissions: { readFiles: true, writeFiles: true, deleteFiles: false, autoSync: true },
    createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
  },
  {
    id: 'tpl-2',
    name: '开发工作站配置',
    description: '适用于开发人员工作站，包含项目目录和完整权限',
    platform: 'linux',
    syncDirectories: ['/Users/Documents', '/Users/Desktop', '/Users/Downloads'],
    permissions: { readFiles: true, writeFiles: true, deleteFiles: true, autoSync: true },
    createdAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
  },
  {
    id: 'tpl-3',
    name: '媒体库精简同步',
    description: '仅同步媒体相关目录，适合大容量存储设备',
    platform: 'mac',
    syncDirectories: ['/Users/Pictures', '/Users/Music', '/Users/Videos'],
    permissions: { readFiles: true, writeFiles: false, deleteFiles: false, autoSync: false },
    createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
  },
];

const mockSensitiveProtections: SensitiveProtection[] = [
  {
    id: 'sp-1',
    directoryPath: '/docs',
    directoryName: 'docs',
    mode: 'confirm',
    enabled: true,
    confirmMessage: '您正在访问文档目录，确认继续操作？',
    createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
  },
  {
    id: 'sp-2',
    directoryPath: '/backup',
    directoryName: 'backup',
    mode: 'password',
    enabled: true,
    password: 'admin123',
    createdAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
  },
  {
    id: 'sp-3',
    directoryPath: '/data',
    directoryName: 'data',
    mode: 'recovery',
    enabled: true,
    recoveryQuestion: '您的第一所学校是？',
    recoveryAnswer: '希望小学',
    createdAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
  },
  {
    id: 'sp-4',
    directoryPath: '/design',
    directoryName: 'design',
    mode: 'confirm',
    enabled: false,
    confirmMessage: '设计文件目录受保护，确认继续？',
    createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
  },
];

const mockDailySyncReports: DailySyncReport[] = [
  {
    id: 'dsr-1',
    date: new Date(now.getTime() - 0 * 86400000).toISOString().split('T')[0],
    deviceId: 'd1',
    deviceName: 'MacBook Pro',
    summary: { added: 12, modified: 34, deleted: 3, conflicted: 2, failed: 1, retried: 2, totalSize: 1073741824 },
    details: {
      addedFiles: ['/docs/项目方案v3.docx', '/docs/会议记录0610.md', '/photos/screenshot_0608.png', '/data/metrics_june.csv'],
      modifiedFiles: ['/docs/report.pdf', '/docs/notes.md', '/config/settings.json'],
      deletedFiles: ['/tmp/cache_old.dat', '/backup/draft_v1.docx'],
      conflictedFiles: ['/photos/img001.jpg', '/docs/项目方案.docx'],
      failedFiles: [{ path: '/backup/backup.zip', error: '网络连接中断' }],
      retriedFiles: [{ path: '/docs/report.pdf', attempt: 2 }],
    },
    generatedAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
    read: false,
  },
  {
    id: 'dsr-2',
    date: new Date(now.getTime() - 1 * 86400000).toISOString().split('T')[0],
    deviceId: 'd1',
    deviceName: 'MacBook Pro',
    summary: { added: 8, modified: 21, deleted: 5, conflicted: 1, failed: 0, retried: 1, totalSize: 536870912 },
    details: {
      addedFiles: ['/docs/周报0610.docx', '/photos/team_photo.jpg'],
      modifiedFiles: ['/docs/notes.md', '/data/report_q2.xlsx'],
      deletedFiles: ['/temp/log_2026-06-06.txt'],
      conflictedFiles: ['/config/app.conf'],
      failedFiles: [],
      retriedFiles: [{ path: '/docs/周报0610.docx', attempt: 1 }],
    },
    generatedAt: new Date(now.getTime() - 26 * 3600000).toISOString(),
    read: true,
  },
  {
    id: 'dsr-3',
    date: new Date(now.getTime() - 0 * 86400000).toISOString().split('T')[0],
    deviceId: 'd2',
    deviceName: 'Ubuntu Server',
    summary: { added: 5, modified: 18, deleted: 2, conflicted: 0, failed: 3, retried: 1, totalSize: 3221225472 },
    details: {
      addedFiles: ['/data/batch_output.csv', '/scripts/deploy.sh'],
      modifiedFiles: ['/config/nginx.conf', '/data/access.log'],
      deletedFiles: ['/tmp/session_old.dat'],
      conflictedFiles: [],
      failedFiles: [{ path: '/videos/render_output.mp4', error: '磁盘空间不足' }, { path: '/backup/db_dump.sql', error: '权限被拒绝' }, { path: '/logs/error.log', error: '文件被占用' }],
      retriedFiles: [{ path: '/data/batch_output.csv', attempt: 2 }],
    },
    generatedAt: new Date(now.getTime() - 1 * 3600000).toISOString(),
    read: false,
  },
  {
    id: 'dsr-4',
    date: new Date(now.getTime() - 2 * 86400000).toISOString().split('T')[0],
    deviceId: 'd1',
    deviceName: 'MacBook Pro',
    summary: { added: 15, modified: 42, deleted: 7, conflicted: 3, failed: 2, retried: 4, totalSize: 2147483648 },
    details: {
      addedFiles: ['/docs/PRD_v2.pdf', '/design/mockup_v3.psd', '/data/user_study.csv'],
      modifiedFiles: ['/docs/report.pdf', '/config/settings.json'],
      deletedFiles: ['/archive/old_backup.zip', '/temp/debug.log'],
      conflictedFiles: ['/docs/项目方案.docx', '/photos/img001.jpg', '/config/app.conf'],
      failedFiles: [{ path: '/backup/db_dump.sql', error: '网络超时' }, { path: '/videos/demo.mp4', error: '文件过大被拒绝' }],
      retriedFiles: [{ path: '/docs/PRD_v2.pdf', attempt: 2 }, { path: '/config/settings.json', attempt: 3 }],
    },
    generatedAt: new Date(now.getTime() - 50 * 3600000).toISOString(),
    read: true,
  },
  {
    id: 'dsr-5',
    date: new Date(now.getTime() - 1 * 86400000).toISOString().split('T')[0],
    deviceId: 'd2',
    deviceName: 'Ubuntu Server',
    summary: { added: 3, modified: 12, deleted: 1, conflicted: 0, failed: 0, retried: 0, totalSize: 268435456 },
    details: {
      addedFiles: ['/scripts/monitor.py'],
      modifiedFiles: ['/config/nginx.conf', '/data/metrics.json'],
      deletedFiles: ['/tmp/cleanup.dat'],
      conflictedFiles: [],
      failedFiles: [],
      retriedFiles: [],
    },
    generatedAt: new Date(now.getTime() - 25 * 3600000).toISOString(),
    read: true,
  },
  {
    id: 'dsr-6',
    date: new Date(now.getTime() - 3 * 86400000).toISOString().split('T')[0],
    deviceId: 'd3',
    deviceName: 'Windows Desktop',
    summary: { added: 2, modified: 8, deleted: 1, conflicted: 1, failed: 1, retried: 1, totalSize: 134217728 },
    details: {
      addedFiles: ['/docs/设计评审记录.docx'],
      modifiedFiles: ['/docs/report.pdf'],
      deletedFiles: ['/temp/scratch.txt'],
      conflictedFiles: ['/docs/会议纪要.md'],
      failedFiles: [{ path: '/backup/weekly.zip', error: '目标目录不存在' }],
      retriedFiles: [{ path: '/docs/设计评审记录.docx', attempt: 1 }],
    },
    generatedAt: new Date(now.getTime() - 72 * 3600000).toISOString(),
    read: true,
  },
];

const mockSnapshots: DirectorySnapshot[] = [
  {
    id: 'snap-1',
    name: '项目发布前备份',
    description: 'v2.0 发布前的完整目录快照',
    directoryPath: '/docs',
    directoryName: 'docs',
    files: [
      { path: '/docs/report.pdf', name: 'report.pdf', size: 245760, modifiedAt: '2026-06-01T10:00:00Z', hash: 'a1b2c3d4' },
      { path: '/docs/notes.md', name: 'notes.md', size: 4096, modifiedAt: '2026-06-01T11:00:00Z', hash: 'e5f6g7h8' },
    ],
    totalSize: 249856,
    fileCount: 2,
    createdAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
    createdBy: '张三',
    device: 'MacBook Pro',
  },
  {
    id: 'snap-2',
    name: '设计稿定稿',
    description: 'UI 设计稿最终版本',
    directoryPath: '/design',
    directoryName: 'design',
    files: [
      { path: '/design/mockup.psd', name: 'mockup.psd', size: 104857600, modifiedAt: '2026-06-03T14:00:00Z', hash: 'i9j0k1l2' },
    ],
    totalSize: 104857600,
    fileCount: 1,
    createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
    createdBy: '李四',
    device: 'Windows Desktop',
  },
];

const mockStorageAnalysis: StorageAnalysisData = {
  totalStorageUsed: 53687091200,
  totalFiles: 1247,
  byDirectory: [
    { path: '/videos', name: 'videos', size: 21474836480, fileCount: 156, subdirectories: 8, lastModified: '2026-06-06T10:30:00Z' },
    { path: '/photos', name: 'photos', size: 16106127360, fileCount: 892, subdirectories: 12, lastModified: '2026-06-05T15:20:00Z' },
    { path: '/backup', name: 'backup', size: 8589934592, fileCount: 23, subdirectories: 3, lastModified: '2026-06-04T08:00:00Z' },
    { path: '/docs', name: 'docs', size: 4294967296, fileCount: 128, subdirectories: 6, lastModified: '2026-06-06T11:00:00Z' },
    { path: '/data', name: 'data', size: 2147483648, fileCount: 35, subdirectories: 2, lastModified: '2026-06-03T14:30:00Z' },
    { path: '/design', name: 'design', size: 1073741824, fileCount: 13, subdirectories: 1, lastModified: '2026-06-02T09:15:00Z' },
  ],
  byFileType: [
    { extension: '.mp4', category: '视频文件', size: 19327352832, fileCount: 128, color: '#e53935' },
    { extension: '.jpg', category: '图片文件', size: 13958643712, fileCount: 756, color: '#1e88e5' },
    { extension: '.zip', category: '压缩文件', size: 8589934592, fileCount: 18, color: '#fdd835' },
    { extension: '.pdf', category: '文档文件', size: 3221225472, fileCount: 89, color: '#43a047' },
    { extension: '.psd', category: '设计文件', size: 4294967296, fileCount: 12, color: '#8e24aa' },
    { extension: '.csv', category: '数据文件', size: 1073741824, fileCount: 28, color: '#fb8c00' },
    { extension: '.docx', category: 'Word文档', size: 1073741824, fileCount: 45, color: '#00897b' },
    { extension: '.其他', category: '其他文件', size: 2147483648, fileCount: 171, color: '#757575' },
  ],
  byDevice: [
    { deviceId: 'd1', deviceName: 'MacBook Pro', platform: 'mac', storageUsed: 5368709120, storageTotal: 107374182400, fileCount: 892, lastSync: '2026-06-06T12:00:00Z', status: 'online' },
    { deviceId: 'd2', deviceName: 'Ubuntu Server', platform: 'linux', storageUsed: 10737418240, storageTotal: 53687091200, fileCount: 456, lastSync: '2026-06-06T11:00:00Z', status: 'online' },
    { deviceId: 'd3', deviceName: 'Windows Desktop', platform: 'windows', storageUsed: 2147483648, storageTotal: 107374182400, fileCount: 234, lastSync: '2026-06-05T20:00:00Z', status: 'offline' },
  ],
};

const mockMembers: WorkspaceMember[] = [
  { id: 'm1', name: '张三', email: 'zhangsan@example.com', role: 'owner', joinedAt: new Date(now.getTime() - 30 * 86400000).toISOString(), lastActive: new Date(now.getTime() - 5 * 60000).toISOString(), status: 'online' },
  { id: 'm2', name: '李四', email: 'lisi@example.com', role: 'admin', joinedAt: new Date(now.getTime() - 25 * 86400000).toISOString(), lastActive: new Date(now.getTime() - 15 * 60000).toISOString(), status: 'online' },
  { id: 'm3', name: '王五', email: 'wangwu@example.com', role: 'editor', joinedAt: new Date(now.getTime() - 20 * 86400000).toISOString(), lastActive: new Date(now.getTime() - 2 * 3600000).toISOString(), status: 'away' },
  { id: 'm4', name: '赵六', email: 'zhaoliu@example.com', role: 'viewer', joinedAt: new Date(now.getTime() - 10 * 86400000).toISOString(), lastActive: new Date(now.getTime() - 24 * 3600000).toISOString(), status: 'offline' },
];

const mockWorkspaceActivities: WorkspaceFileActivity[] = [
  { id: 'wa1', workspaceId: 'ws1', fileId: 'f1', fileName: '项目方案v2.docx', filePath: '/docs/项目方案v2.docx', action: 'modify', memberId: 'm2', memberName: '李四', timestamp: new Date(now.getTime() - 5 * 60000).toISOString(), size: 512000, device: 'Windows Desktop' },
  { id: 'wa2', workspaceId: 'ws1', fileId: 'f2', fileName: '设计稿首页.psd', filePath: '/design/设计稿首页.psd', action: 'upload', memberId: 'm1', memberName: '张三', timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), size: 104857600, device: 'MacBook Pro' },
  { id: 'wa3', workspaceId: 'ws1', fileId: 'f3', fileName: '数据报表.xlsx', filePath: '/data/数据报表.xlsx', action: 'download', memberId: 'm3', memberName: '王五', timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(), size: 2048000, device: 'Ubuntu Server' },
  { id: 'wa4', workspaceId: 'ws1', fileId: 'f4', fileName: '旧版本方案.docx', filePath: '/archive/旧版本方案.docx', action: 'delete', memberId: 'm1', memberName: '张三', timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(), device: 'MacBook Pro' },
  { id: 'wa5', workspaceId: 'ws1', fileId: 'f5', fileName: '会议纪要.md', filePath: '/docs/会议纪要.md', action: 'share', memberId: 'm2', memberName: '李四', timestamp: new Date(now.getTime() - 8 * 3600000).toISOString(), size: 10240, device: 'Windows Desktop' },
  { id: 'wa6', workspaceId: 'ws2', fileId: 'f6', fileName: '产品需求文档.pdf', filePath: '/product/PRD.pdf', action: 'upload', memberId: 'm1', memberName: '张三', timestamp: new Date(now.getTime() - 1 * 3600000).toISOString(), size: 3145728, device: 'MacBook Pro' },
  { id: 'wa7', workspaceId: 'ws2', fileId: 'f7', fileName: '用户调研数据.csv', filePath: '/data/用户调研数据.csv', action: 'modify', memberId: 'm3', memberName: '王五', timestamp: new Date(now.getTime() - 4 * 3600000).toISOString(), size: 5242880, device: 'Ubuntu Server' },
];

const mockWorkspaces: Workspace[] = [
  {
    id: 'ws1',
    name: '产品研发团队',
    description: '产品设计与研发协作空间',
    ownerId: 'm1',
    ownerName: '张三',
    members: mockMembers,
    fileCount: 156,
    storageUsed: 10737418240,
    createdAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 5 * 60000).toISOString(),
    recentActivities: mockWorkspaceActivities.filter(a => a.workspaceId === 'ws1'),
    color: '#1976d2',
  },
  {
    id: 'ws2',
    name: '市场营销组',
    description: '市场推广和营销活动策划',
    ownerId: 'm2',
    ownerName: '李四',
    members: [mockMembers[0], mockMembers[1], mockMembers[3]],
    fileCount: 89,
    storageUsed: 5368709120,
    createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * 3600000).toISOString(),
    recentActivities: mockWorkspaceActivities.filter(a => a.workspaceId === 'ws2'),
    color: '#388e3c',
  },
  {
    id: 'ws3',
    name: '个人工作区',
    description: '我的私人工作空间',
    ownerId: 'm1',
    ownerName: '张三',
    members: [mockMembers[0]],
    fileCount: 42,
    storageUsed: 2147483648,
    createdAt: new Date(now.getTime() - 60 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 12 * 3600000).toISOString(),
    recentActivities: [],
    color: '#f57c00',
  },
];

const mockConflicts: SyncConflict[] = [
  {
    id: 'conflict-1',
    fileId: '3',
    fileName: 'img001.jpg',
    filePath: '/photos/img001.jpg',
    localVersion: {
      id: 'v-local-1',
      version: 3,
      size: 3145728,
      hash: 'localhash1234567890abcdef',
      createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
      author: '张三',
      changeType: 'modified',
      device: 'MacBook Pro',
    },
    remoteVersion: {
      id: 'v-remote-1',
      version: 4,
      size: 3670016,
      hash: 'remotehashabcdef1234567890',
      createdAt: new Date(now.getTime() - 1 * 3600000).toISOString(),
      author: '李四',
      changeType: 'modified',
      device: 'Windows Desktop',
    },
    resolved: false,
    reason: 'both_modified',
    reasonDescription: '本地和远程设备在同一时间段内分别修改了该文件，内容存在差异需要手动确认。',
  },
  {
    id: 'conflict-2',
    fileId: '10',
    fileName: '项目方案.docx',
    filePath: '/docs/项目方案.docx',
    localVersion: {
      id: 'v-local-2',
      version: 2,
      size: 512000,
      hash: 'doclocal1234567890abcdef',
      createdAt: new Date(now.getTime() - 5 * 3600000).toISOString(),
      author: '王五',
      changeType: 'modified',
      device: 'MacBook Pro',
    },
    remoteVersion: {
      id: 'v-remote-2',
      version: 2,
      size: 524288,
      hash: 'docremoteabcdef1234567890',
      createdAt: new Date(now.getTime() - 3 * 3600000).toISOString(),
      author: '张三',
      changeType: 'modified',
      device: 'Ubuntu Server',
    },
    resolved: false,
    reason: 'content_modified',
    reasonDescription: '文件内容在本地被修改，但远程已有更新版本。',
  },
  {
    id: 'conflict-3',
    fileId: '11',
    fileName: 'data_backup.sql',
    filePath: '/backup/data_backup.sql',
    localVersion: {
      id: 'v-local-3',
      version: 1,
      size: 10485760,
      hash: 'sqllocal1234567890abcdef',
      createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
      author: '李四',
      changeType: 'deleted',
      device: 'Windows Desktop',
    },
    remoteVersion: {
      id: 'v-remote-3',
      version: 2,
      size: 15728640,
      hash: 'sqlremoteabcdef1234567890',
      createdAt: new Date(now.getTime() - 12 * 3600000).toISOString(),
      author: '王五',
      changeType: 'modified',
      device: 'Ubuntu Server',
    },
    resolved: false,
    reason: 'delete_modify_conflict',
    reasonDescription: '本地已删除该文件，但远程在删除后又进行了修改。',
  },
  {
    id: 'conflict-4',
    fileId: '12',
    fileName: 'config.json',
    filePath: '/config/config.json',
    localVersion: {
      id: 'v-local-4',
      version: 1,
      size: 2048,
      hash: 'configlocal1234567890abcd',
      createdAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
      author: '张三',
      changeType: 'added',
      device: 'MacBook Pro',
    },
    remoteVersion: {
      id: 'v-remote-4',
      version: 1,
      size: 3072,
      hash: 'configremoteabcdef12345678',
      createdAt: new Date(now.getTime() - 36 * 3600000).toISOString(),
      author: '李四',
      changeType: 'added',
      device: 'Windows Desktop',
    },
    resolved: true,
    resolution: 'remote',
    reason: 'name_conflict',
    reasonDescription: '两个不同内容的文件使用了相同的文件名。',
    resolvedAt: new Date(now.getTime() - 6 * 3600000).toISOString(),
    resolvedBy: '用户',
  },
];

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
  storageAnalysis: StorageAnalysisData;
  offlineChanges: OfflineChange[];
  offlineSyncProgress: SyncProgress;
  isOfflinePanelOpen: boolean;
  isOnline: boolean;
  isManualOfflineMode: boolean;
  notifications: Notification[];
  isNotificationCenterOpen: boolean;
  workspaces: Workspace[];
  selectedWorkspaceId: string | null;
  isCreateWorkspaceModalOpen: boolean;
  workspaceActivities: WorkspaceFileActivity[];
  setFiles: (files: SyncFile[]) => void;
  setConflicts: (conflicts: SyncConflict[]) => void;
  resolveConflict: (id: string, resolution: 'local' | 'remote' | 'merge') => void;
  batchResolveConflicts: (ids: string[], resolution: 'local' | 'remote' | 'merge') => void;
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
  setStorageAnalysis: (data: StorageAnalysisData) => void;
  setIsOnline: (online: boolean) => void;
  addOfflineChange: (change: Omit<OfflineChange, 'id' | 'createdAt' | 'status' | 'retryCount'>) => void;
  updateOfflineChange: (id: string, updates: Partial<OfflineChange>) => void;
  removeOfflineChange: (id: string) => void;
  loadOfflineChanges: () => void;
  startOfflineSync: () => void;
  retryOfflineChange: (id: string) => void;
  retryAllFailedOfflineChanges: () => void;
  clearSyncedOfflineChanges: () => void;
  toggleOfflinePanel: () => void;
  toggleManualOfflineMode: () => void;
  setManualOfflineMode: (enabled: boolean) => void;
  snapshots: DirectorySnapshot[];
  setSnapshots: (snapshots: DirectorySnapshot[]) => void;
  createSnapshot: (directoryPath: string, directoryName: string, name: string, description?: string) => DirectorySnapshot;
  restoreSnapshot: (snapshotId: string) => RestoreSnapshotResult;
  restoreSnapshotFiles: (snapshotId: string, filePaths: string[]) => SelectiveRestoreSnapshotResult;
  deleteSnapshot: (snapshotId: string) => void;
  updateSnapshot: (snapshotId: string, updates: Partial<DirectorySnapshot>) => void;
  ignoreRules: IgnoreRule[];
  setIgnoreRules: (rules: IgnoreRule[]) => void;
  addIgnoreRule: (rule: Omit<IgnoreRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIgnoreRule: (id: string, updates: Partial<IgnoreRule>) => void;
  deleteIgnoreRule: (id: string) => void;
  toggleIgnoreRule: (id: string) => void;
  testIgnoreRule: (filePath: string, rulePattern: string, ruleType: IgnoreRule['type']) => boolean;
  checkFileIgnored: (filePath: string) => IgnoreRuleMatchResult;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  toggleNotificationCenter: () => void;
  openNotificationCenter: () => void;
  closeNotificationCenter: () => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  createWorkspace: (name: string, description?: string, color?: string) => Workspace;
  deleteWorkspace: (workspaceId: string) => void;
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => void;
  selectWorkspace: (workspaceId: string | null) => void;
  addWorkspaceMember: (workspaceId: string, member: Omit<WorkspaceMember, 'id' | 'joinedAt' | 'lastActive' | 'status'>) => void;
  removeWorkspaceMember: (workspaceId: string, memberId: string) => void;
  updateMemberRole: (workspaceId: string, memberId: string, role: WorkspaceRole) => void;
  addWorkspaceActivity: (workspaceId: string, activity: Omit<WorkspaceFileActivity, 'id' | 'timestamp'>) => void;
  openCreateWorkspaceModal: () => void;
  closeCreateWorkspaceModal: () => void;
  bandwidthStrategies: BandwidthStrategy[];
  setBandwidthStrategies: (strategies: BandwidthStrategy[]) => void;
  addBandwidthStrategy: (strategy: Omit<BandwidthStrategy, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBandwidthStrategy: (id: string, updates: Partial<BandwidthStrategy>) => void;
  deleteBandwidthStrategy: (id: string) => void;
  toggleBandwidthStrategy: (id: string) => void;
  syncTemplates: SyncTemplate[];
  setSyncTemplates: (templates: SyncTemplate[]) => void;
  addSyncTemplate: (template: Omit<SyncTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSyncTemplate: (id: string, updates: Partial<SyncTemplate>) => void;
  deleteSyncTemplate: (id: string) => void;
  applySyncTemplate: (templateId: string) => void;
  sensitiveProtections: SensitiveProtection[];
  setSensitiveProtections: (protections: SensitiveProtection[]) => void;
  addSensitiveProtection: (protection: Omit<SensitiveProtection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSensitiveProtection: (id: string, updates: Partial<SensitiveProtection>) => void;
  deleteSensitiveProtection: (id: string) => void;
  toggleSensitiveProtection: (id: string) => void;
  verifyProtection: (id: string, input: string) => ProtectionVerifyResult;
  checkDirectoryProtection: (directoryPath: string) => SensitiveProtection | null;
  dailySyncReports: DailySyncReport[];
  setDailySyncReports: (reports: DailySyncReport[]) => void;
  markDailySyncReportAsRead: (id: string) => void;
  markAllDailySyncReportsAsRead: () => void;
  getDailySyncReport: (date: string, deviceId?: string) => DailySyncReport | undefined;
  generateDailySyncReport: (deviceId: string) => DailySyncReport;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  files: [], folders: [], devices: [], conflicts: [...mockConflicts], activities: [],
  recycleBin: [],
  currentFolder: '/', syncProgress: 0,
  largeFileTransfers: [],
  storageAnalysis: mockStorageAnalysis,
  snapshots: [...mockSnapshots],
  ignoreRules: [...mockIgnoreRules],
  offlineChanges: [],
  offlineSyncProgress: {
    total: 0,
    completed: 0,
    failed: 0,
    isSyncing: false,
  },
  isOfflinePanelOpen: false,
  isOnline: true,
  isManualOfflineMode: false,
  notifications: [],
  isNotificationCenterOpen: false,
  workspaces: [...mockWorkspaces],
  selectedWorkspaceId: null,
  isCreateWorkspaceModalOpen: false,
  workspaceActivities: [...mockWorkspaceActivities],
  bandwidthStrategies: [...mockBandwidthStrategies],
  syncTemplates: [...mockSyncTemplates],
  sensitiveProtections: [...mockSensitiveProtections],
  dailySyncReports: [...mockDailySyncReports],
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
  setConflicts: (conflicts) => {
    const state = get();
    const newUnresolvedConflicts = conflicts.filter(
      c => !c.resolved && !state.conflicts.find(sc => sc.id === c.id)
    );
    
    if (newUnresolvedConflicts.length > 0) {
      const conflictNames = newUnresolvedConflicts.map(c => c.fileName).join('、');
      get().addNotification({
        type: 'sync_conflict',
        title: `发现 ${newUnresolvedConflicts.length} 个新冲突`,
        message: `文件 ${conflictNames} 存在同步冲突，需要手动处理`,
        priority: newUnresolvedConflicts.length > 2 ? 'urgent' : 'high',
        actions: [
          { label: '立即处理', type: 'navigate', target: 'conflicts' },
        ],
        metadata: { conflictIds: newUnresolvedConflicts.map(c => c.id) },
      });
    }
    
    set({ conflicts });
  },
  resolveConflict: (id, resolution) => set((state) => ({
    conflicts: state.conflicts.map(c =>
      c.id === id ? { ...c, resolved: true, resolution, resolvedAt: new Date().toISOString(), resolvedBy: '用户' } : c)
  })),
  batchResolveConflicts: (ids, resolution) => set((state) => ({
    conflicts: state.conflicts.map(c =>
      ids.includes(c.id) ? { ...c, resolved: true, resolution, resolvedAt: new Date().toISOString(), resolvedBy: '用户' } : c)
  })),
  setCurrentFolder: (path) => set({ currentFolder: path }),
  startSync: () => set({ syncProgress: 0 }),
  addActivity: (activity) => {
    set((state) => ({
      activities: [activity, ...state.activities].slice(0, 100)
    }));

    const getNotificationForActivity = () => {
      switch (activity.status) {
        case 'success':
          return {
            type: 'sync_success' as const,
            title: '同步成功',
            message: `文件 "${activity.fileName}" 已成功${activity.action === 'upload' ? '上传' : activity.action === 'download' ? '下载' : activity.action === 'delete' ? '删除' : '同步'}`,
            priority: 'low' as const,
            actions: [
              { label: '查看详情', type: 'navigate' as const, target: 'activity' },
            ],
            metadata: { activityId: activity.id, fileId: activity.fileId },
          };
        case 'failed':
          return {
            type: 'sync_failed' as const,
            title: '同步失败',
            message: `文件 "${activity.fileName}" 同步失败${activity.errorMessage ? `: ${activity.errorMessage}` : ''}`,
            priority: 'high' as const,
            actions: [
              { label: '查看详情', type: 'navigate' as const, target: 'activity' },
              { label: '查看传输', type: 'navigate' as const, target: 'largetransfers' },
            ],
            metadata: { activityId: activity.id, fileId: activity.fileId },
          };
        case 'conflict':
          return {
            type: 'sync_conflict' as const,
            title: '同步冲突',
            message: `文件 "${activity.fileName}" 存在同步冲突，需要手动处理`,
            priority: 'urgent' as const,
            actions: [
              { label: '立即处理', type: 'navigate' as const, target: 'conflicts' },
              { label: '稍后处理', type: 'callback' as const },
            ],
            metadata: { activityId: activity.id, fileId: activity.fileId },
          };
        default:
          return null;
      }
    };

    const notification = getNotificationForActivity();
    if (notification) {
      get().addNotification(notification);
    }
  },
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
    
    if (!valid) {
      get().addNotification({
        type: 'storage_insufficient',
        title: '存储空间不足',
        message: `需要 ${(requiredSpace / 1024 / 1024 / 1024).toFixed(1)} GB 空间，当前仅可用 ${(availableSpace / 1024 / 1024 / 1024).toFixed(1)} GB`,
        priority: 'urgent',
        actions: [
          { label: '查看空间分析', type: 'navigate', target: 'storage' },
          { label: '清理存储空间', type: 'navigate', target: 'recyclebin' },
        ],
        metadata: { requiredSpace, availableSpace },
      });
    }
    
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
  setStorageAnalysis: (data) => set({ storageAnalysis: data }),

  setIsOnline: (online) => set({ isOnline: online }),

  addOfflineChange: (change) => {
    const state = get();
    if (state.isOnline) {
      console.warn('设备当前在线，操作将直接同步，不进入离线暂存队列');
      return;
    }
    const newChange: OfflineChange = {
      ...change,
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    };
    offlineStorage.add(newChange);
    set((s) => ({
      offlineChanges: [...s.offlineChanges, newChange],
    }));
  },

  updateOfflineChange: (id, updates) => {
    offlineStorage.update(id, updates);
    set((state) => ({
      offlineChanges: state.offlineChanges.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },

  removeOfflineChange: (id) => {
    offlineStorage.remove(id);
    set((state) => ({
      offlineChanges: state.offlineChanges.filter((c) => c.id !== id),
    }));
  },

  loadOfflineChanges: () => {
    const changes = offlineStorage.getAll();
    set({ offlineChanges: changes });
  },

  startOfflineSync: () => {
    const state = get();
    const pendingChanges = state.offlineChanges.filter(
      (c) => c.status === 'pending' || c.status === 'failed'
    );

    if (pendingChanges.length === 0 || !state.isOnline) return;

    set({
      offlineSyncProgress: {
        total: pendingChanges.length,
        completed: 0,
        failed: 0,
        isSyncing: true,
        currentFile: pendingChanges[0].fileName,
      },
    });

    let completed = 0;
    let failed = 0;

    pendingChanges.forEach((change, index) => {
      setTimeout(() => {
        set((s) => ({
          offlineChanges: s.offlineChanges.map((c) =>
            c.id === change.id ? { ...c, status: 'syncing' as const } : c
          ),
        }));
      }, 800 + index * 600 - 200);

      setTimeout(() => {
        const success = Math.random() > 0.15;

        if (success) {
          completed++;
          offlineStorage.update(change.id, {
            status: 'success',
            syncedAt: new Date().toISOString(),
          });
          const activity: SyncActivity = {
            id: `act-${Date.now()}-${index}`,
            fileId: change.fileId,
            fileName: change.fileName,
            filePath: change.filePath,
            status: 'success',
            action: change.action,
            timestamp: new Date().toISOString(),
            size: change.size,
            device: '本地设备',
          };
          get().addActivity(activity);
        } else {
          failed++;
          offlineStorage.update(change.id, {
            status: 'failed',
            errorMessage: '同步失败，请稍后重试',
            retryCount: change.retryCount + 1,
          });
        }

        const nextChange = pendingChanges[index + 1];
        set((s) => ({
          offlineChanges: s.offlineChanges.map((c) => {
            if (c.id === change.id) {
              return success
                ? { ...c, status: 'success' as const, syncedAt: new Date().toISOString() }
                : { ...c, status: 'failed' as const, errorMessage: '同步失败，请稍后重试', retryCount: c.retryCount + 1 };
            }
            return c;
          }),
          offlineSyncProgress: {
            total: pendingChanges.length,
            completed,
            failed,
            isSyncing: index < pendingChanges.length - 1,
            currentFile: nextChange?.fileName,
          },
        }));
      }, 800 + index * 600);
    });
  },

  retryOfflineChange: (id) => {
    const state = get();
    const change = state.offlineChanges.find((c) => c.id === id);
    if (!change || !state.isOnline) return;

    set((s) => ({
      offlineChanges: s.offlineChanges.map((c) =>
        c.id === id ? { ...c, status: 'syncing' as const, errorMessage: undefined } : c
      ),
    }));

    setTimeout(() => {
      const success = Math.random() > 0.2;
      if (success) {
        get().updateOfflineChange(id, {
          status: 'success',
          syncedAt: new Date().toISOString(),
        });
        const activity: SyncActivity = {
          id: `act-${Date.now()}`,
          fileId: change.fileId,
          fileName: change.fileName,
          filePath: change.filePath,
          status: 'success',
          action: change.action,
          timestamp: new Date().toISOString(),
          size: change.size,
          device: '本地设备',
        };
        get().addActivity(activity);
      } else {
        get().updateOfflineChange(id, {
          status: 'failed',
          errorMessage: '同步失败，请稍后重试',
          retryCount: change.retryCount + 1,
        });
      }
    }, 800);
  },

  retryAllFailedOfflineChanges: () => {
    const state = get();
    const failedChanges = state.offlineChanges.filter((c) => c.status === 'failed');
    failedChanges.forEach((c) => get().retryOfflineChange(c.id));
  },

  clearSyncedOfflineChanges: () => {
    offlineStorage.clearSynced();
    set((state) => ({
      offlineChanges: state.offlineChanges.filter((c) => c.status !== 'success'),
    }));
  },

  toggleOfflinePanel: () => {
    set((state) => ({ isOfflinePanelOpen: !state.isOfflinePanelOpen }));
  },

  toggleManualOfflineMode: () => {
    set((state) => {
      const newMode = !state.isManualOfflineMode;
      return {
        isManualOfflineMode: newMode,
        isOnline: newMode ? false : navigator.onLine,
      };
    });
  },

  setManualOfflineMode: (enabled) => {
    set({
      isManualOfflineMode: enabled,
      isOnline: enabled ? false : navigator.onLine,
    });
  },

  setSnapshots: (snapshots) => set({ snapshots }),

  createSnapshot: (directoryPath, directoryName, name, description) => {
    const state = get();
    const directoryFiles = state.files.filter(f => f.path.startsWith(directoryPath));
    const snapshotFiles: SnapshotFileItem[] = directoryFiles.map(f => ({
      path: f.path,
      name: f.name,
      size: f.size,
      modifiedAt: f.modifiedAt,
      hash: f.versions.length > 0 ? f.versions[f.versions.length - 1].hash : `hash-${Date.now()}`,
    }));
    const totalSize = snapshotFiles.reduce((sum, f) => sum + f.size, 0);
    const newSnapshot: DirectorySnapshot = {
      id: `snap-${Date.now()}`,
      name,
      description,
      directoryPath,
      directoryName,
      files: snapshotFiles,
      totalSize,
      fileCount: snapshotFiles.length,
      createdAt: new Date().toISOString(),
      createdBy: '当前用户',
      device: '当前设备',
    };
    set((state) => ({
      snapshots: [newSnapshot, ...state.snapshots],
    }));
    return newSnapshot;
  },

  restoreSnapshot: (snapshotId) => {
    const state = get();
    const snapshot = state.snapshots.find(s => s.id === snapshotId);
    if (!snapshot) {
      return { success: false, message: '快照不存在' };
    }
    const errors: string[] = [];
    let restoredCount = 0;
    snapshot.files.forEach(snapshotFile => {
      try {
        const activity: SyncActivity = {
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fileId: `restored-${snapshotFile.path}`,
          fileName: snapshotFile.name,
          filePath: snapshotFile.path,
          status: 'success',
          action: 'modify',
          timestamp: new Date().toISOString(),
          device: snapshot.device,
          size: snapshotFile.size,
        };
        get().addActivity(activity);
        restoredCount++;
      } catch (e) {
        errors.push(`恢复文件 ${snapshotFile.name} 失败`);
      }
    });
    return {
      success: errors.length === 0,
      message: errors.length === 0
        ? `成功恢复 ${restoredCount} 个文件到快照状态`
        : `部分文件恢复失败，成功 ${restoredCount} 个，失败 ${errors.length} 个`,
      restoredCount,
      errors,
    };
  },

  restoreSnapshotFiles: (snapshotId, filePaths) => {
    const state = get();
    const snapshot = state.snapshots.find(s => s.id === snapshotId);
    if (!snapshot) {
      return {
        success: false,
        message: '快照不存在',
        restoredCount: 0,
        failedCount: 0,
        restoredFiles: [],
        errors: ['快照不存在'],
      };
    }

    if (filePaths.length === 0) {
      return {
        success: false,
        message: '请选择要恢复的文件',
        restoredCount: 0,
        failedCount: 0,
        restoredFiles: [],
        errors: ['未选择任何文件'],
      };
    }

    const filesToRestore = snapshot.files.filter(f => filePaths.includes(f.path));
    const errors: string[] = [];
    const restoredFiles: string[] = [];

    filesToRestore.forEach(snapshotFile => {
      try {
        const activity: SyncActivity = {
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fileId: `restored-${snapshotFile.path}`,
          fileName: snapshotFile.name,
          filePath: snapshotFile.path,
          status: 'success',
          action: 'modify',
          timestamp: new Date().toISOString(),
          device: snapshot.device,
          size: snapshotFile.size,
        };
        get().addActivity(activity);
        restoredFiles.push(snapshotFile.path);
      } catch (e) {
        errors.push(`恢复文件 ${snapshotFile.name} 失败`);
      }
    });

    const restoredCount = restoredFiles.length;
    const failedCount = errors.length;

    return {
      success: failedCount === 0,
      message: failedCount === 0
        ? `成功恢复 ${restoredCount} 个文件`
        : `部分文件恢复失败，成功 ${restoredCount} 个，失败 ${failedCount} 个`,
      restoredCount,
      failedCount,
      restoredFiles,
      errors,
    };
  },

  deleteSnapshot: (snapshotId) => set((state) => ({
    snapshots: state.snapshots.filter(s => s.id !== snapshotId),
  })),

  updateSnapshot: (snapshotId, updates) => set((state) => ({
    snapshots: state.snapshots.map(s =>
      s.id === snapshotId ? { ...s, ...updates } : s
    ),
  })),

  setIgnoreRules: (rules) => set({ ignoreRules: rules }),

  addIgnoreRule: (rule) => {
    const now = new Date().toISOString();
    const newRule: IgnoreRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      ignoreRules: [...state.ignoreRules, newRule],
    }));
  },

  updateIgnoreRule: (id, updates) => set((state) => ({
    ignoreRules: state.ignoreRules.map(r =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    ),
  })),

  deleteIgnoreRule: (id) => set((state) => ({
    ignoreRules: state.ignoreRules.filter(r => r.id !== id),
  })),

  toggleIgnoreRule: (id) => set((state) => ({
    ignoreRules: state.ignoreRules.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled, updatedAt: new Date().toISOString() } : r
    ),
  })),

  testIgnoreRule: (filePath, rulePattern, ruleType) => {
    const fileName = filePath.split('/').pop() || filePath;
    switch (ruleType) {
      case 'extension':
        const ext = rulePattern.startsWith('.') ? rulePattern : `.${rulePattern}`;
        return fileName.toLowerCase().endsWith(ext.toLowerCase());
      case 'name_pattern':
        try {
          const regex = new RegExp(rulePattern, 'i');
          return regex.test(fileName);
        } catch {
          return fileName.toLowerCase().includes(rulePattern.toLowerCase());
        }
      case 'directory':
        const pathParts = filePath.split('/').filter(Boolean);
        return pathParts.some(part => part.toLowerCase() === rulePattern.toLowerCase());
      default:
        return false;
    }
  },

  checkFileIgnored: (filePath) => {
    const state = get();
    const enabledRules = state.ignoreRules.filter(r => r.enabled);
    for (const rule of enabledRules) {
      const isInDirectory = filePath.startsWith(rule.directoryPath) || rule.directoryPath === '/';
      if (isInDirectory && get().testIgnoreRule(filePath, rule.pattern, rule.type)) {
        return { filePath, matched: true, matchedRule: rule };
      }
    }
    return { filePath, matched: false };
  },

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 100),
    }));
  },

  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ),
  })),

  markAllNotificationsAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id),
  })),

  clearAllNotifications: () => set({ notifications: [] }),

  toggleNotificationCenter: () => set((state) => ({
    isNotificationCenterOpen: !state.isNotificationCenterOpen,
  })),

  openNotificationCenter: () => set({ isNotificationCenterOpen: true }),

  closeNotificationCenter: () => set({ isNotificationCenterOpen: false }),

  setWorkspaces: (workspaces) => set({ workspaces }),

  createWorkspace: (name, description, color) => {
    const colors = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#c2185b', '#00838f'];
    const newWorkspace: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      description,
      ownerId: 'm1',
      ownerName: '张三',
      members: [
        {
          id: 'm1',
          name: '张三',
          email: 'zhangsan@example.com',
          role: 'owner',
          joinedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          status: 'online',
        },
      ],
      fileCount: 0,
      storageUsed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recentActivities: [],
      color: color || colors[Math.floor(Math.random() * colors.length)],
    };
    set((state) => ({
      workspaces: [newWorkspace, ...state.workspaces],
      isCreateWorkspaceModalOpen: false,
    }));
    get().addNotification({
      type: 'system',
      title: '工作区创建成功',
      message: `工作区 "${name}" 已成功创建`,
      priority: 'low',
    });
    return newWorkspace;
  },

  deleteWorkspace: (workspaceId) => set((state) => ({
    workspaces: state.workspaces.filter((w) => w.id !== workspaceId),
    selectedWorkspaceId: state.selectedWorkspaceId === workspaceId ? null : state.selectedWorkspaceId,
  })),

  updateWorkspace: (workspaceId, updates) => set((state) => ({
    workspaces: state.workspaces.map((w) =>
      w.id === workspaceId ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
    ),
  })),

  selectWorkspace: (workspaceId) => set({ selectedWorkspaceId: workspaceId }),

  addWorkspaceMember: (workspaceId, member) => {
    const newMember: WorkspaceMember = {
      ...member,
      id: `m-${Date.now()}`,
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'offline',
    };
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === workspaceId
          ? { ...w, members: [...w.members, newMember], updatedAt: new Date().toISOString() }
          : w
      ),
    }));
    get().addNotification({
      type: 'system',
      title: '成员添加成功',
      message: `${member.name} 已被添加到工作区`,
      priority: 'low',
    });
  },

  removeWorkspaceMember: (workspaceId, memberId) => set((state) => ({
    workspaces: state.workspaces.map((w) =>
      w.id === workspaceId
        ? { ...w, members: w.members.filter((m) => m.id !== memberId), updatedAt: new Date().toISOString() }
        : w
    ),
  })),

  updateMemberRole: (workspaceId, memberId, role) => set((state) => ({
    workspaces: state.workspaces.map((w) =>
      w.id === workspaceId
        ? {
            ...w,
            members: w.members.map((m) => (m.id === memberId ? { ...m, role } : m)),
            updatedAt: new Date().toISOString(),
          }
        : w
    ),
  })),

  addWorkspaceActivity: (workspaceId, activity) => {
    const newActivity: WorkspaceFileActivity = {
      ...activity,
      id: `wa-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      workspaceActivities: [newActivity, ...state.workspaceActivities],
      workspaces: state.workspaces.map((w) =>
        w.id === workspaceId
          ? {
              ...w,
              recentActivities: [newActivity, ...w.recentActivities].slice(0, 20),
              updatedAt: new Date().toISOString(),
            }
          : w
      ),
    }));
  },

  openCreateWorkspaceModal: () => set({ isCreateWorkspaceModalOpen: true }),

  closeCreateWorkspaceModal: () => set({ isCreateWorkspaceModalOpen: false }),

  setBandwidthStrategies: (strategies) => set({ bandwidthStrategies: strategies }),

  addBandwidthStrategy: (strategy) => {
    const nowStr = new Date().toISOString();
    const newStrategy: BandwidthStrategy = {
      ...strategy,
      id: `bw-${Date.now()}`,
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    set((state) => ({
      bandwidthStrategies: [...state.bandwidthStrategies, newStrategy],
    }));
  },

  updateBandwidthStrategy: (id, updates) => set((state) => ({
    bandwidthStrategies: state.bandwidthStrategies.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    ),
  })),

  deleteBandwidthStrategy: (id) => set((state) => ({
    bandwidthStrategies: state.bandwidthStrategies.filter(s => s.id !== id),
  })),

  toggleBandwidthStrategy: (id) => set((state) => ({
    bandwidthStrategies: state.bandwidthStrategies.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled, updatedAt: new Date().toISOString() } : s
    ),
  })),

  setSyncTemplates: (templates) => set({ syncTemplates: templates }),

  addSyncTemplate: (template) => {
    const nowStr = new Date().toISOString();
    const newTemplate: SyncTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    set((state) => ({
      syncTemplates: [...state.syncTemplates, newTemplate],
    }));
  },

  updateSyncTemplate: (id, updates) => set((state) => ({
    syncTemplates: state.syncTemplates.map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    ),
  })),

  deleteSyncTemplate: (id) => set((state) => ({
    syncTemplates: state.syncTemplates.filter(t => t.id !== id),
  })),

  applySyncTemplate: (templateId) => {
    const template = get().syncTemplates.find(t => t.id === templateId);
    if (!template) return;
    set((state) => ({
      onboardingWizardData: {
        ...state.onboardingWizardData,
        platform: template.platform,
        syncDirectories: [...template.syncDirectories],
        permissions: { ...template.permissions },
      },
    }));
  },

  setSensitiveProtections: (protections) => set({ sensitiveProtections: protections }),

  addSensitiveProtection: (protection) => {
    const nowStr = new Date().toISOString();
    const newProtection: SensitiveProtection = {
      ...protection,
      id: `sp-${Date.now()}`,
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    set((state) => ({
      sensitiveProtections: [...state.sensitiveProtections, newProtection],
    }));
  },

  updateSensitiveProtection: (id, updates) => set((state) => ({
    sensitiveProtections: state.sensitiveProtections.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ),
  })),

  deleteSensitiveProtection: (id) => set((state) => ({
    sensitiveProtections: state.sensitiveProtections.filter(p => p.id !== id),
  })),

  toggleSensitiveProtection: (id) => set((state) => ({
    sensitiveProtections: state.sensitiveProtections.map(p =>
      p.id === id ? { ...p, enabled: !p.enabled, updatedAt: new Date().toISOString() } : p
    ),
  })),

  verifyProtection: (id, input) => {
    const protection = get().sensitiveProtections.find(p => p.id === id);
    if (!protection) {
      return { verified: false, message: '保护规则不存在' };
    }
    if (!protection.enabled) {
      return { verified: true, message: '保护已禁用，无需验证' };
    }
    switch (protection.mode) {
      case 'confirm':
        return { verified: true, message: '已确认操作' };
      case 'password':
        if (input === protection.password) {
          return { verified: true, message: '口令验证通过' };
        }
        return { verified: false, message: '访问口令错误' };
      case 'recovery':
        if (input === protection.recoveryAnswer) {
          return { verified: true, message: '恢复校验通过' };
        }
        return { verified: false, message: '恢复答案错误' };
      default:
        return { verified: false, message: '未知的保护模式' };
    }
  },

  checkDirectoryProtection: (directoryPath) => {
    const protections = get().sensitiveProtections;
    return protections.find(p => p.directoryPath === directoryPath && p.enabled) || null;
  },

  setDailySyncReports: (reports) => set({ dailySyncReports: reports }),

  markDailySyncReportAsRead: (id) => set((state) => ({
    dailySyncReports: state.dailySyncReports.map(r =>
      r.id === id ? { ...r, read: true } : r
    ),
  })),

  markAllDailySyncReportsAsRead: () => set((state) => ({
    dailySyncReports: state.dailySyncReports.map(r => ({ ...r, read: true })),
  })),

  getDailySyncReport: (date, deviceId) => {
    const reports = get().dailySyncReports;
    if (deviceId) {
      return reports.find(r => r.date === date && r.deviceId === deviceId);
    }
    return reports.find(r => r.date === date);
  },

  generateDailySyncReport: (deviceId) => {
    const state = get();
    const device = state.devices.find(d => d.id === deviceId);
    const today = new Date().toISOString().split('T')[0];
    const todayActivities = state.activities.filter(a => a.timestamp.startsWith(today));

    const added = todayActivities.filter(a => a.action === 'upload' && a.status === 'success').length;
    const modified = todayActivities.filter(a => a.action === 'modify' && a.status === 'success').length;
    const deleted = todayActivities.filter(a => a.action === 'delete' && a.status === 'success').length;
    const conflicted = todayActivities.filter(a => a.status === 'conflict').length;
    const failed = todayActivities.filter(a => a.status === 'failed').length;
    const retried = state.largeFileTransfers.filter(t => t.retryCount > 0).length;
    const totalSize = todayActivities.reduce((sum, a) => sum + (a.size || 0), 0);

    const summary: SyncResultSummary = { added, modified, deleted, conflicted, failed, retried, totalSize };
    const details: SyncResultDetail = {
      addedFiles: todayActivities.filter(a => a.action === 'upload' && a.status === 'success').map(a => a.filePath),
      modifiedFiles: todayActivities.filter(a => a.action === 'modify' && a.status === 'success').map(a => a.filePath),
      deletedFiles: todayActivities.filter(a => a.action === 'delete' && a.status === 'success').map(a => a.filePath),
      conflictedFiles: todayActivities.filter(a => a.status === 'conflict').map(a => a.filePath),
      failedFiles: todayActivities.filter(a => a.status === 'failed').map(a => ({ path: a.filePath, error: a.errorMessage || '未知错误' })),
      retriedFiles: state.largeFileTransfers.filter(t => t.retryCount > 0).map(t => ({ path: t.filePath, attempt: t.retryCount })),
    };

    const report: DailySyncReport = {
      id: `dsr-${Date.now()}`,
      date: today,
      deviceId,
      deviceName: device?.name || '未知设备',
      summary,
      details,
      generatedAt: new Date().toISOString(),
      read: false,
    };

    set((state) => ({
      dailySyncReports: [report, ...state.dailySyncReports],
    }));

    return report;
  },
}));
