"use client";

import { Plus } from "lucide-react";

import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { useGetWorkspaces } from "../../../features/workspaces/api/use-get-workspaces";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetWorkspaceIdParam } from "../../../features/workspaces/hooks/use-get-workspace-param";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateWorkspace } from "../../../features/workspaces/hooks/use-create-workspace";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Workspace } from "@/generated/prisma";

export function WorkspaceSwitcher() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { open: openCreateWorkspace } = useCreateWorkspace();
  const workspaceId = useGetWorkspaceIdParam();
  const { data, isPending } = useGetWorkspaces();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-muted-foreground">WORKSPACE</span>
          <Plus
            onClick={openCreateWorkspace}
            className="size-5 p-0.5 hover:bg-sidebar-accent bg-sidebar-primary cursor-pointer transition-all text-white rounded-full"
          />
        </div>
        <Select
          value={workspaceId}
          onValueChange={(e) => {
            queryClient.invalidateQueries({
              queryKey: ["members", workspaceId],
            });
            router.push(`/workspaces/${e}`);
          }}
        >
          <SelectTrigger className="focus-visible:right-0 focus-visible:ring-neutral-200">
            {isPending ? (
              <div className="animate-pulse text-muted-foreground flex items-center gap-x-1">
                Loading...
              </div>
            ) : (
              <SelectValue placeholder={"No workspace selected"} />
            )}
          </SelectTrigger>
          <SelectContent>
            {data && data?.documents?.map((workspace: Workspace) => (
              <SelectItem key={workspace.id} value={workspace.id}>
                <div className="flex items-center gap-x-2">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage
                      src={workspace?.imageUrl as string}
                      alt="Workspace logo"
                    />
                    <AvatarFallback className="bg-black text-white rounded-lg font-bold text-lg">
                      {workspace?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{workspace?.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
