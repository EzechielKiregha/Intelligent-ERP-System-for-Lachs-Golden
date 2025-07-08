"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CreateWorkspacesModal from "@/features/workspaces/components/create-workspaces-modal";
import { useGetWorkspaceIdParam } from "@/features/workspaces/hooks/use-get-workspace-param";
import CreateProjectModal from "@/features/projects/components/create-project-modal";
import { NAV_ITEMS } from "@/app/constants";
import ProjectsNavigation from "./projects-navigation";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "contents/authContext";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { User, Workspace } from "@/generated/prisma";
import { useEffect, useState } from "react";
import { WorkspaceSwitcher } from "@/app/(app)/_components/workspace-switcher";

export function DashboardProjects({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const workspaceId = useGetWorkspaceIdParam();
  const pathname = usePathname();

  const { user: authUser } = useAuth()
  const { data } = useGetWorkspaces();
  const [user, setUser] = useState<User | null>(authUser)
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(data)

  useEffect(() => {
    setUser(authUser || null)
    const { data } = useGetWorkspaces();
    setWorkspaces(data)
  }, [authUser])

  const workspaceUrl = user
    ? workspaces && workspaces.length > 0
      ? `/workspaces/${workspaces[0].id}`
      : '/workspaces/create'
    : '/login'

  return (
    <>
      <CreateWorkspacesModal />
      <CreateProjectModal />
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>ERP Task Pilot</SidebarGroupLabel>
        <SidebarMenuItem className="pt-4">
          <WorkspaceSwitcher />
        </SidebarMenuItem>

        <SidebarMenu>
          {NAV_ITEMS.map(({ name, link, icon: Icon }) => {
            const fullHrefPath = `/workspaces/${workspaceId}${link}`;
            const isActive = pathname === fullHrefPath;
            return (
              <SidebarMenuItem key={name}>
                <SidebarMenuButton asChild isActive={isActive} className={`${isActive ? "bg-sidebar-accent text-sidebar-foreground" : ""}`}>
                  <Link href={user && link === "" ? workspaceUrl : fullHrefPath}>
                    <Icon /> {name}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
        <Separator />
        <ProjectsNavigation />
      </SidebarGroup>
    </>
  );
}
