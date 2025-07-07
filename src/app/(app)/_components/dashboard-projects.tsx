"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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

export function DashboardProjects({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const workspaceId = useGetWorkspaceIdParam();
  const pathname = usePathname();

  return (
    <><CreateWorkspacesModal /><CreateProjectModal /><SidebarGroup>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          {NAV_ITEMS.map(({ name, link, icon: Icon }) => {
            const fullHrefPath = `/workspaces/${workspaceId}${link}`;
            const isActive = pathname === fullHrefPath;
            return (
              <SidebarMenuItem key={name}>
                <SidebarMenuButton asChild isActive={isActive} className={`${isActive ? "bg-sidebar-accent text-sidebar-foreground" : ""}`}>
                  <Link href={fullHrefPath}>
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
    </SidebarGroup></>
  );
}
