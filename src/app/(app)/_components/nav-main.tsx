"use client";

import { ChevronRight, Plus, Settings2, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useCreateWorkspace } from "@/features/workspaces/hooks/use-create-workspace";
import CreateWorkspacesModal from "@/features/workspaces/components/create-workspaces-modal";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { useAuth } from "contents/authContext";
import { CompanySwitcher } from "./company-switcher";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const router = useRouter();
  const path = usePathname();
  const { open: openCreateWorkspace } = useCreateWorkspace();
  const user = useAuth().user

  return (
    <><CreateWorkspacesModal />
      <SidebarGroup>
        <SidebarGroupLabel>ERP Modules</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => {
            const isMainActive = path.includes(item.url);
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={isMainActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={`${isMainActive ? "bg-sidebar-accent text-sidebar-foreground" : ""}`}
                      tooltip={item.title}
                      onClick={() => {
                        if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
                          console.log("sidebar current page :", item.title)
                        } else {
                          router.replace(item.url)
                        }
                      }}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {/* <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" /> */}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        const isSubActive = path === subItem.url;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              className={`${isSubActive ? "bg-sidebar-accent text-sidebar-foreground" : ""}`}
                              onClick={() => router.replace(subItem.url)}
                              asChild
                            >
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
          {/* <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-muted-foreground">WORKSPACE</span>
            <Plus
              onClick={openCreateWorkspace}
              className="size-4 p-0.5 bg-neutral-500 hover:bg-neutral-500/80 cursor-pointer transition-all text-white rounded-full" />
          </div> */}
          <WorkspaceSwitcher />
        </SidebarMenu>
      </SidebarGroup></>
  );
}
