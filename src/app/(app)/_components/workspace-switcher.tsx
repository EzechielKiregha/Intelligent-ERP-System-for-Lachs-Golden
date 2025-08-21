// app/components/WorkspaceSwitcher.tsx
'use client';

import { Plus } from 'lucide-react';
import { SidebarGroup, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { useGetWorkspaces } from '../../../features/workspaces/api/use-get-workspaces';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateWorkspace } from '../../../features/workspaces/hooks/use-create-workspace';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from 'contents/authContext';
import { useGetWorkspaceIdParam } from '@/features/workspaces/hooks/use-get-workspace-param';
import { useGetMembersSwitcher } from '@/features/members/api/use-get-members';
import { toast } from 'sonner';

interface Workspace {
  id: string;
  name: string;
  images: { url: string }[];
  companyId: string;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export function WorkspaceSwitcher() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { open: openCreateWorkspace } = useCreateWorkspace();
  const workspaceId = useGetWorkspaceIdParam();
  const user = useAuth().user;

  // 🔹 Fetch all workspaces in the company
  const { data: allWorkspaces = [], isPending: isWorkspacesPending } = useGetWorkspaces();

  // 🔹 Fetch all member records for this user
  const { data: memberRecords = [], isPending: isMembersPending } = useGetMembersSwitcher({
    userId: user?.id,
  });

  // 🔹 Extract allowed workspace IDs
  const allowedWorkspaceIds = memberRecords.map((m: any) => m.workspaceId);

  // 🔹 Filter workspaces to only those the user is a member of
  const allowedWorkspaces = allWorkspaces.filter((ws: Workspace) =>
    allowedWorkspaceIds.includes(ws.id)
  );

  // 🔹 Loading state
  if (isWorkspacesPending || isMembersPending) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between my-2">
              <span className="text-[11px] text-muted-foreground">WORKSPACE</span>
            </div>
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center justify-between my-2">
            <span className="text-[11px] text-muted-foreground">WORKSPACE</span>
            <Plus
              onClick={openCreateWorkspace}
              className="size-5 p-0.5 hover:bg-sidebar-accent bg-sidebar-primary cursor-pointer transition-all text-white rounded-full"
            />
          </div>
          <Select
            value={workspaceId}
            onValueChange={(newWorkspaceId) => {
              // ✅ Optional: Validate switch is allowed
              if (!allowedWorkspaceIds.includes(newWorkspaceId)) {
                toast('You do not have access to this workspace');
                return;
              }

              // ✅ Invalidate only relevant queries
              queryClient.invalidateQueries({
                queryKey: ['members', workspaceId],
              });
              queryClient.invalidateQueries({
                queryKey: ['tasks', { workspaceId: newWorkspaceId }],
              });

              // ✅ Navigate
              router.push(`/workspaces/${newWorkspaceId}`);
            }}
          >
            <SelectTrigger className="focus-visible:right-0 focus-visible:ring-neutral-200">
              <SelectValue placeholder="Select workspace" />
            </SelectTrigger>
            <SelectContent className="w-[--radix-select-trigger-width] bg-sidebar max-h-60">
              {allowedWorkspaces.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">No workspaces available</div>
              ) : (
                allowedWorkspaces.map((workspace: Workspace) => (
                  <SelectItem
                    key={workspace.id}
                    value={workspace.id}
                    className="bg-sidebar hover:bg-sidebar-primary"
                  >
                    <div className="flex items-center gap-x-2">
                      <Avatar className="size-8 rounded-none">
                        <AvatarImage src={workspace.images[0]?.url} alt={workspace.name} />
                        <AvatarFallback className="bg-black text-white rounded-lg font-bold text-lg">
                          {workspace.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{workspace.name}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}