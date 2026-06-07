import React, { useState } from 'react';
import { WorkspaceMember, WorkspaceRole } from '../types';

interface Props {
  members: WorkspaceMember[];
  workspaceId: string;
  onAddMember: (workspaceId: string, member: Omit<WorkspaceMember, 'id' | 'joinedAt' | 'lastActive' | 'status'>) => void;
  onRemoveMember: (workspaceId: string, memberId: string) => void;
  onUpdateRole: (workspaceId: string, memberId: string, role: WorkspaceRole) => void;
}

const roleConfig: Record<WorkspaceRole, { label: string; color: string; bg: string }> = {
  owner: { label: '所有者', color: '#c62828', bg: '#ffebee' },
  admin: { label: '管理员', color: '#ef6c00', bg: '#fff3e0' },
  editor: { label: '编辑者', color: '#1565c0', bg: '#e3f2fd' },
  viewer: { label: '查看者', color: '#2e7d32', bg: '#e8f5e9' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  online: { label: '在线', color: '#4caf50' },
  away: { label: '离开', color: '#ff9800' },
  offline: { label: '离线', color: '#9e9e9e' },
};

const formatTime = (timestamp: string): string => {
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
  return date.toLocaleDateString();
};

export const MemberPanel: React.FC<Props> = ({
  members,
  workspaceId,
  onAddMember,
  onRemoveMember,
  onUpdateRole,
}) => {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('viewer');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail.trim() && inviteName.trim()) {
      onAddMember(workspaceId, {
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteEmail('');
      setInviteName('');
      setInviteRole('viewer');
      setShowInvite(false);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ margin: 0, fontSize: '16px' }}>成员管理 ({members.length})</h4>
        <button
          onClick={() => setShowInvite(true)}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            background: '#1976d2',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          + 邀请成员
        </button>
      </div>

      {showInvite && (
        <div
          style={{
            padding: '16px',
            background: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          <h5 style={{ margin: '0 0 12px', fontSize: '14px' }}>邀请新成员</h5>
          <form onSubmit={handleInvite}>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="成员姓名"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  marginBottom: '8px',
                }}
              />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="邮箱地址"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                角色
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="viewer">查看者 - 仅可查看文件</option>
                <option value="editor">编辑者 - 可编辑和上传文件</option>
                <option value="admin">管理员 - 可管理成员和设置</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!inviteEmail.trim() || !inviteName.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: inviteEmail.trim() && inviteName.trim() ? '#1976d2' : '#bbb',
                  color: '#fff',
                  cursor: inviteEmail.trim() && inviteName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                }}
              >
                发送邀请
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {members.map((member) => {
          const roleInfo = roleConfig[member.role];
          const statusInfo = statusConfig[member.status];
          return (
            <div
              key={member.id}
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: '#fff',
                border: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#666',
                  }}
                >
                  {member.name.charAt(0)}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: statusInfo.color,
                    border: '2px solid #fff',
                  }}
                  title={statusInfo.label}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>{member.name}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: roleInfo.bg,
                      color: roleInfo.color,
                    }}
                  >
                    {roleInfo.label}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                  {member.email}
                </div>
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                  最后活跃: {formatTime(member.lastActive)}
                </div>
              </div>
              {member.role !== 'owner' && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    value={member.role}
                    onChange={(e) => onUpdateRole(workspaceId, member.id, e.target.value as WorkspaceRole)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="viewer">查看者</option>
                    <option value="editor">编辑者</option>
                    <option value="admin">管理员</option>
                  </select>
                  <button
                    onClick={() => {
                      if (confirm(`确定要移除 ${member.name} 吗？`)) {
                        onRemoveMember(workspaceId, member.id);
                      }
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: 'none',
                      background: '#ffebee',
                      color: '#c62828',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    移除
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
