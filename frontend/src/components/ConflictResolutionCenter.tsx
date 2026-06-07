import React, { useState, useEffect } from 'react';
import { SyncConflict, FileVersion } from '../types';
import { formatSize, formatTime, computeVersionDiff } from '../utils/versionUtils';

interface Props {
  conflicts: SyncConflict[];
  onResolve: (id: string, resolution: 'local' | 'remote' | 'merge') => void;
  onBatchResolve: (ids: string[], resolution: 'local' | 'remote' | 'merge') => void;
}

const reasonConfig: Record<string, { label: string; icon: string; color: string }> = {
  content_modified: { label: '内容修改冲突', icon: '📝', color: '#ef6c00' },
  both_modified: { label: '双方同时修改', icon: '⚡', color: '#c62828' },
  name_conflict: { label: '文件名冲突', icon: '📁', color: '#1565c0' },
  delete_modify_conflict: { label: '删除与修改冲突', icon: '🗑️', color: '#6a1b9a' },
};

const resolutionLabels: Record<string, string> = {
  local: '保留本地版本',
  remote: '保留远程版本',
  merge: '合并版本',
};

export const ConflictResolutionCenter: React.FC<Props> = ({ conflicts, onResolve, onBatchResolve }) => {
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingBatchResolution, setPendingBatchResolution] = useState<'local' | 'remote' | 'merge' | null>(null);

  useEffect(() => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      conflicts.forEach(c => {
        if (c.resolved && next.has(c.id)) {
          next.delete(c.id);
        }
      });
      return next;
    });
    setExpandedId(prev => {
      if (prev) {
        const conflict = conflicts.find(c => c.id === prev);
        if (conflict && conflict.resolved) {
          return null;
        }
      }
      return prev;
    });
  }, [conflicts]);

  const filteredConflicts = conflicts.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'unresolved') return !c.resolved;
    return c.resolved;
  });

  const unresolvedCount = conflicts.filter(c => !c.resolved).length;
  const resolvedCount = conflicts.filter(c => c.resolved).length;

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredConflicts.filter(c => !c.resolved).length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredConflicts.filter(c => !c.resolved).map(c => c.id)));
    }
  };

  const handleBatchResolve = (resolution: 'local' | 'remote' | 'merge') => {
    setPendingBatchResolution(resolution);
    setShowConfirmDialog(true);
  };

  const confirmBatchResolve = () => {
    if (pendingBatchResolution) {
      onBatchResolve(Array.from(selectedIds), pendingBatchResolution);
      setSelectedIds(new Set());
      setShowConfirmDialog(false);
      setPendingBatchResolution(null);
    }
  };

  const VersionCard: React.FC<{ version: FileVersion; label: string; isSelected?: boolean; onSelect?: () => void }> = ({
    version, label, isSelected, onSelect
  }) => (
    <div
      onClick={onSelect}
      style={{
        flex: 1,
        padding: '16px',
        borderRadius: '8px',
        background: '#fff',
        border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
        cursor: onSelect ? 'pointer' : 'default',
        position: 'relative',
      }}
    >
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#1976d2',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
        }}>✓</div>
      )}
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1976d2' }}>v{version.version}</span>
      </div>
      <div style={{ fontSize: '13px', marginBottom: '6px' }}>
        <span style={{ color: '#888' }}>作者：</span>{version.author}
      </div>
      <div style={{ fontSize: '13px', marginBottom: '6px' }}>
        <span style={{ color: '#888' }}>时间：</span>{formatTime(version.createdAt)}
      </div>
      <div style={{ fontSize: '13px', marginBottom: '6px' }}>
        <span style={{ color: '#888' }}>大小：</span>{formatSize(version.size)}
      </div>
      {version.device && (
        <div style={{ fontSize: '13px' }}>
          <span style={{ color: '#888' }}>设备：</span>{version.device}
        </div>
      )}
    </div>
  );

  const ConflictDetail: React.FC<{ conflict: SyncConflict }> = ({ conflict }) => {
    const [selectedResolution, setSelectedResolution] = useState<'local' | 'remote' | 'merge' | null>(null);
    const diff = computeVersionDiff(conflict.localVersion, conflict.remoteVersion);

    return (
      <div style={{ padding: '16px', background: '#fafafa', borderTop: '1px solid #e0e0e0' }}>
        <div style={{
          padding: '12px 16px',
          background: '#fff3e0',
          borderRadius: '6px',
          borderLeft: '4px solid #ef6c00',
          marginBottom: '16px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#e65100', marginBottom: '4px' }}>
            冲突原因：{reasonConfig[conflict.reason]?.label || conflict.reason}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>{conflict.reasonDescription}</div>
        </div>

        <h4 style={{ margin: '0 0 12px', fontSize: '14px' }}>版本对比</h4>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <VersionCard
            version={conflict.localVersion}
            label="本地版本"
            isSelected={selectedResolution === 'local'}
            onSelect={!conflict.resolved ? () => setSelectedResolution('local') : undefined}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', flexShrink: 0 }}>
            <span style={{ fontSize: '24px', color: '#999' }}>⇄</span>
          </div>
          <VersionCard
            version={conflict.remoteVersion}
            label="远程版本"
            isSelected={selectedResolution === 'remote'}
            onSelect={!conflict.resolved ? () => setSelectedResolution('remote') : undefined}
          />
        </div>

        <div style={{ padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>变更摘要</div>
          <p style={{ margin: 0, fontSize: '13px', color: '#333' }}>{diff.summary}</p>
        </div>

        {!conflict.resolved ? (
          <>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>选择解决方案</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['local', 'remote', 'merge'] as const).map(res => (
                  <button
                    key={res}
                    onClick={() => setSelectedResolution(res)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: selectedResolution === res ? '2px solid #1976d2' : '1px solid #ddd',
                      background: selectedResolution === res ? '#e3f2fd' : '#fff',
                      color: selectedResolution === res ? '#1976d2' : '#333',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: selectedResolution === res ? 500 : 400,
                    }}
                  >
                    {resolutionLabels[res]}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setExpandedId(null)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (selectedResolution) {
                    onResolve(conflict.id, selectedResolution);
                    setExpandedId(null);
                  }
                }}
                disabled={!selectedResolution}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: selectedResolution ? '#1976d2' : '#ccc',
                  color: '#fff',
                  cursor: selectedResolution ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                确认处理
              </button>
            </div>
          </>
        ) : (
          <div style={{
            padding: '12px 16px',
            background: '#e8f5e9',
            borderRadius: '6px',
            borderLeft: '4px solid #2e7d32',
          }}>
            <div style={{ fontSize: '13px', color: '#2e7d32', fontWeight: 500 }}>
              ✓ 已解决：{resolutionLabels[conflict.resolution || '']}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              处理时间：{conflict.resolvedAt ? formatTime(conflict.resolvedAt) : '-'}
              {conflict.resolvedBy ? ` · 处理人：${conflict.resolvedBy}` : ''}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>冲突处理中心</h3>
        {unresolvedCount > 0 && (
          <span style={{
            padding: '4px 12px',
            background: '#ffebee',
            color: '#c62828',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 500,
          }}>
            {unresolvedCount} 个待处理
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { key: 'all', label: '全部冲突', count: conflicts.length, color: '#1976d2' },
          { key: 'unresolved', label: '待处理', count: unresolvedCount, color: '#ef6c00' },
          { key: 'resolved', label: '已解决', count: resolvedCount, color: '#2e7d32' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key as 'all' | 'unresolved' | 'resolved')}
            style={{
              padding: '16px 12px',
              borderRadius: '8px',
              border: filter === item.key ? `2px solid ${item.color}` : '2px solid transparent',
              background: filter === item.key ? `${item.color}10` : '#fff',
              cursor: 'pointer',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: item.color }}>{item.count}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{item.label}</div>
          </button>
        ))}
      </div>

      {selectedIds.size > 0 && (
        <div style={{
          padding: '12px 16px',
          background: '#e3f2fd',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '13px', color: '#1565c0' }}>
            已选择 {selectedIds.size} 个冲突
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['local', 'remote', 'merge'] as const).map(res => (
              <button
                key={res}
                onClick={() => handleBatchResolve(res)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: '1px solid #1976d2',
                  background: '#fff',
                  color: '#1976d2',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                批量{resolutionLabels[res]}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredConflicts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <p style={{ color: '#999', margin: 0 }}>
            {filter === 'unresolved' ? '暂无待处理的冲突' : '暂无冲突记录'}
          </p>
        </div>
      ) : (
        <>
          {filter !== 'resolved' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              background: '#f5f5f5',
              borderRadius: '6px 6px 0 0',
              border: '1px solid #e0e0e0',
              borderBottom: 'none',
            }}>
              <input
                type="checkbox"
                checked={selectedIds.size === filteredConflicts.filter(c => !c.resolved).length && filteredConflicts.filter(c => !c.resolved).length > 0}
                onChange={selectAll}
                style={{ marginRight: '12px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '12px', color: '#666' }}>全选</span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {filteredConflicts.map((conflict, index) => (
              <div
                key={conflict.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: index === 0 && (filter === 'resolved' || selectedIds.size === 0) ? '6px 6px 0 0' : '0',
                  borderTop: index === 0 && (filter === 'resolved' || selectedIds.size === 0) ? '1px solid #e0e0e0' : 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpandedId(expandedId === conflict.id ? null : conflict.id)}
                >
                  {!conflict.resolved && filter !== 'resolved' && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(conflict.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelect(conflict.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: conflict.resolved ? '#e8f5e9' : '#fff3e0',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}>
                    {conflict.resolved ? '✓' : reasonConfig[conflict.reason]?.icon || '⚠'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conflict.fileName}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: conflict.resolved ? '#e8f5e9' : '#fff3e0',
                          color: conflict.resolved ? '#2e7d32' : '#ef6c00',
                        }}
                      >
                        {conflict.resolved ? '已解决' : '待处理'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                      {reasonConfig[conflict.reason]?.label || conflict.reason}
                      {' · '}
                      本地 v{conflict.localVersion.version} vs 远程 v{conflict.remoteVersion.version}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#aaa', flexShrink: 0 }}>
                    {formatTime(conflict.localVersion.createdAt)}
                  </div>
                  <span style={{
                    color: '#999',
                    fontSize: '18px',
                    transform: expandedId === conflict.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}>▼</span>
                </div>
                {expandedId === conflict.id && <ConflictDetail conflict={conflict} />}
              </div>
            ))}
          </div>
        </>
      )}

      {showConfirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '16px' }}>确认批量处理</h4>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              确定要对 <strong>{selectedIds.size}</strong> 个冲突执行「{resolutionLabels[pendingBatchResolution || '']}」操作吗？
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setPendingBatchResolution(null);
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                取消
              </button>
              <button
                onClick={confirmBatchResolve}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#1976d2',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
