import React from 'react';
import { Workspace, WorkspaceMember, WorkspaceRole } from '../types';
import { WorkspaceList } from './WorkspaceList';
import { WorkspaceDetail } from './WorkspaceDetail';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

interface Props {
  workspaces: Workspace[];
  selectedWorkspaceId: string | null;
  isCreateModalOpen: boolean;
  onSelectWorkspace: (id: string | null) => void;
  onCreateWorkspace: (name: string, description: string, color: string) => void;
  onOpenCreateModal: () => void;
  onCloseCreateModal: () => void;
  onDeleteWorkspace: (workspaceId: string) => void;
  onAddMember: (workspaceId: string, member: Omit<WorkspaceMember, 'id' | 'joinedAt' | 'lastActive' | 'status'>) => void;
  onRemoveMember: (workspaceId: string, memberId: string) => void;
  onUpdateRole: (workspaceId: string, memberId: string, role: WorkspaceRole) => void;
}

export const WorkspacePanel: React.FC<Props> = ({
  workspaces,
  selectedWorkspaceId,
  isCreateModalOpen,
  onSelectWorkspace,
  onCreateWorkspace,
  onOpenCreateModal,
  onCloseCreateModal,
  onDeleteWorkspace,
  onAddMember,
  onRemoveMember,
  onUpdateRole,
}) => {
  const selectedWorkspace = workspaces.find((w) => w.id === selectedWorkspaceId);

  if (selectedWorkspace) {
    return (
      <WorkspaceDetail
        workspace={selectedWorkspace}
        onBack={() => onSelectWorkspace(null)}
        onAddMember={onAddMember}
        onRemoveMember={onRemoveMember}
        onUpdateRole={onUpdateRole}
        onDeleteWorkspace={(id) => {
          onDeleteWorkspace(id);
          onSelectWorkspace(null);
        }}
      />
    );
  }

  return (
    <>
      <WorkspaceList
        workspaces={workspaces}
        selectedWorkspaceId={selectedWorkspaceId}
        onSelectWorkspace={onSelectWorkspace}
        onCreateNew={onOpenCreateModal}
      />
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={onCloseCreateModal}
        onCreate={onCreateWorkspace}
      />
    </>
  );
};
