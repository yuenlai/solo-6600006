import React, { useState } from 'react';
import { Workspace, WorkspaceMember, WorkspaceRole } from '../types';
import { MemberPanel } from './MemberPanel';
import { WorkspaceActivityPanel } from './WorkspaceActivityPanel';

interface Props {
  workspace: Workspace;
  onBack: () => void;
  onAddMember: (workspaceId: string, member: Omit<WorkspaceMember, 'id' | 'joinedAt' | 'lastActive' | 'status'>) => void;
  onRemoveMember: (workspaceId: string, memberId: string) => void;
  onUpdateRole: (workspaceId: string, memberId: string, role: WorkspaceRole) => void;
  onDeleteWorkspace: (workspaceId: string) => void;
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

type DetailTab = 'activity' | 'members' | 'files';

export const WorkspaceDetail: React.FC<Props> = ({
  workspace,
  onBack,
  onAddMember,
  onRemoveMember,
  onUpdateRole,
  onDeleteWorkspace,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('activity');

  const handleDelete = () => {
    if (confirm(`确定要删除工作区 "${workspace.name}" 吗？此操作不可撤销。`)) {
      onDeleteWorkspace(workspace.id);
    }
  };

  const tabs: { key: DetailTab; label: string; icon: string }[] = [
    { key: 'activity', label: '动态', icon: '📋' },
    { key: 'members', label: '成员', icon: '👥' },
    { key: 'files', label: '文件', icon: '📁' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
      <div
        style={{
          padding: '20px 24px',
          background: '#fff',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <button
            onClick={onBack}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ← 返回
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleDelete}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid #ffcdd2',
              background: '#ffebee',
              color: '#c62828',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            删除工作区
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '14px',
              background: workspace.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '28px',
              fontWeight: 'bold',
              flexShrink: 0,
            }}
          >
            {workspace.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 600 }}>{workspace.name}</h2>
            {workspace.description && (
              <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#666' }}>{workspace.description}</p>
            )}
            <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#888' }}>
              <span>创建者: {workspace.ownerName}</span>
              <span>创建于: {formatDate(workspace.createdAt)}</span>
              <span>📄 {workspace.fileCount} 个文件</span>
              <span>💾 {formatSize(workspace.storageUsed)}</span>
              <span>👥 {workspace.members.length} 位成员</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', marginTop: '20px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                background: activeTab === tab.key ? '#f5f5f5' : 'transparent',
                color: activeTab === tab.key ? '#1976d2' : '#666',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.key ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'activity' && (
          <WorkspaceActivityPanel activities={workspace.recentActivities} />
        )}
        {activeTab === 'members' && (
          <MemberPanel
            members={workspace.members}
            workspaceId={workspace.id}
            onAddMember={onAddMember}
            onRemoveMember={onRemoveMember}
            onUpdateRole={onUpdateRole}
          />
        )}
        {activeTab === 'files' && (
          <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
            <p style={{ fontSize: '48px', margin: '40px 0 12px' }}>📁</p>
            <p>文件管理功能开发中...</p>
          </div>
        )}
      </div>
    </div>
  );
};
