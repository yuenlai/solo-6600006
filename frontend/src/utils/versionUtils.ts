import { FileVersion, VersionDiff } from '../types';

export const formatSize = (size?: number): string => {
  if (!size) return '0 B';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

export const formatSizeChange = (change: number): { text: string; color: string } => {
  if (change === 0) return { text: '无变化', color: '#666' };
  if (change > 0) return { text: `+${formatSize(change)}`, color: '#2e7d32' };
  return { text: `-${formatSize(Math.abs(change))}`, color: '#c62828' };
};

export const computeVersionDiff = (oldVersion: FileVersion, newVersion: FileVersion): VersionDiff => {
  const changedFields: string[] = [];
  const sizeChange = newVersion.size - oldVersion.size;

  if (oldVersion.size !== newVersion.size) changedFields.push('size');
  if (oldVersion.hash !== newVersion.hash) changedFields.push('content');
  if (oldVersion.changeType !== newVersion.changeType) changedFields.push('changeType');
  if (oldVersion.author !== newVersion.author) changedFields.push('author');
  if (oldVersion.device !== newVersion.device) changedFields.push('device');

  let summary = '';
  if (newVersion.changeType === 'added') {
    summary = `文件由 ${newVersion.author} 创建于 ${formatTime(newVersion.createdAt)}`;
  } else if (newVersion.changeType === 'deleted') {
    summary = `文件由 ${newVersion.author} 删除于 ${formatTime(newVersion.createdAt)}`;
  } else if (changedFields.includes('content')) {
    summary = `文件内容被 ${newVersion.author} 修改`;
  } else if (changedFields.includes('size')) {
    summary = `文件大小发生变化`;
  } else {
    summary = '文件元数据发生变化';
  }

  if (newVersion.device) {
    summary += ` · 来自 ${newVersion.device}`;
  }

  return {
    oldVersion,
    newVersion,
    sizeChange,
    summary,
    changedFields,
  };
};

export const getChangeTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    added: '新增',
    modified: '修改',
    deleted: '删除',
  };
  return labels[type] || type;
};

export const getChangeTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    added: '#2e7d32',
    modified: '#1565c0',
    deleted: '#c62828',
  };
  return colors[type] || '#666';
};
