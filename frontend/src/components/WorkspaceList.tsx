import React from 'react';
import { Workspace } from '../types';

interface Props {
  workspaces: Workspace[];
  selectedWorkspaceId: string | null;
  onSelectWorkspace: (id: string) => void;
  onCreateNew: () => void;
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'online': return '#4caf50';
    case 'away': return '#ff9800';
    default: return '#9e9e9e';
  }
};

export const WorkspaceList: React.FC<Props> = ({
  workspaces,
  selectedWorkspaceId,
  onSelectWorkspace,
  onCreateNew,
}) => {
  return (
    <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>协作空间</h3>
        <button
          onClick={onCreateNew}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: '#1976d2',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          + 创建工作区
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {workspaces.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
            <p style={{ fontSize: '48px', margin: '0 0 12px' }}>📁</p>
            <p>暂无协作空间</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>点击上方按钮创建第一个工作区</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                onClick={() => onSelectWorkspace(workspace.id)}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: selectedWorkspaceId === workspace.id
                    ? `2px solid ${workspace.color}`
                    : '1px solid #e0e0e0',
                  background: selectedWorkspaceId === workspace.id
                    ? `${workspace.color}08`
                    : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: workspace.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      flexShrink: 0,
                    }}
                  >
                    {workspace.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{workspace.name}</h4>
                      {workspace.members.find(m => m.role === 'owner')?.name === '张三' && (
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#fff3e0',
                            color: '#f57c00',
                          }}
                        >
                          我创建的
                        </span>
                      )}
                    </div>
                    {workspace.description && (
                      <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {workspace.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#888' }}>
                      <span>📄 {workspace.fileCount} 个文件</span>
                      <span>💾 {formatSize(workspace.storageUsed)}</span>
                      <span>👥 {workspace.members.length} 人</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px' }}>
                      {workspace.members.slice(0, 4).map((member) => (
                        <div
                          key={member.id}
                          title={`${member.name} (${member.role})`}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#e0e0e0',
                            border: '2px solid #fff',
                            marginLeft: member.id !== workspace.members[0].id ? '-8px' : '0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 500,
                            color: '#666',
                            position: 'relative',
                          }}
                        >
                          {member.name.charAt(0)}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '-2px',
                              right: '-2px',
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: getStatusColor(member.status),
                              border: '2px solid #fff',
                            }}
                          />
                        </div>
                      ))}
                      {workspace.members.length > 4 && (
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#f5f5f5',
                            border: '2px solid #fff',
                            marginLeft: '-8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: '#666',
                          }}
                        >
                          +{workspace.members.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
