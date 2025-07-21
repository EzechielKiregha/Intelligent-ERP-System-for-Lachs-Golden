"use client";

import { Plus } from "lucide-react";

import { SidebarGroup, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
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

interface W {
  name: string;
  id: string;
  companyId: string;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
  images: { url: string }[]
}
export function WorkspaceSwitcher() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { open: openCreateWorkspace } = useCreateWorkspace();
  const workspaceId = useGetWorkspaceIdParam();
  const { data, isPending } = useGetWorkspaces();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu >
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
            <SelectContent className="w-[--radix-select-trigger-width] bg-sidebar">
              {data && data.map((workspace: W) => (
                <SelectItem className="bg-sidebar-accent text-sidebar-accent-foreground" key={workspace.id} value={workspace.id}>
                  <div className="flex items-center gap-x-2">
                    <Avatar className="size-8 rounded-none">
                      <AvatarImage
                        src={workspace?.images[0].url as string}
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
    </SidebarGroup>
  );
}
