"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Cpu,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { IconAnalyze } from "@tabler/icons-react"
import { useAuth } from "contents/authContext"
import { useAuditLog } from "@/lib/hooks/dashboard"
import SkeletonLoader from "./SkeletonLoader"

// This is sample data.

const companyData = {
  name: "Intelligent ERP Inc.",
  logo: "/logos/intelligent-erp.png",
  plan: "Enterprise",
};

const navMainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: GalleryVerticalEnd,
    isActive: true,
    items: [
      { title: "Dashboard", url: "/dashboard" },
      { title: "Reports", url: "/dashboard/reports" },
      { title: "Activity Feed", url: "/dashboard/activity" },
    ],
  },
  {
    title: "Finance",
    url: "/finance",
    icon: PieChart,
    items: [
      { title: "Finance", url: "/finance" },
      { title: "Transactions", url: "/finance/transactions" },
      { title: "Budget", url: "/finance/budget" },
    ],
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Frame,
    items: [
      { title: "Inventory", url: "/inventory" },
      { title: "Stock Management", url: "/inventory/manage" },
      { title: "Low Stock Alerts", url: "/inventory/alerts" },
    ],
  },
  {
    title: "HR",
    url: "/hr",
    icon: Map,
    items: [
      { title: "Human Resource", url: "/hr" },
      { title: "Employee Management", url: "/hr/employees" },
      { title: "Payroll", url: "/hr/payroll" },
    ],
  },
  {
    title: "CRM",
    url: "/crm",
    icon: Command,
    items: [
      { title: "Customer Management", url: "/crm/customers" },
      { title: "Sales Pipeline", url: "/crm/sales" },
    ],
  },
];

const company = [
  {
    name: "Intelligent ERP Inc.",
    logo: Cpu,
    plan: "Enterprise",
  },
  {
    name: "Smart Solutions Ltd.",
    logo: AudioWaveform,
    plan: "Startup",
  },
  {
    name: "NextGen Tech",
    logo: Command,
    plan: "Free",
  },
]

const userData = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "https://github.com/shadcn.png",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { data: logs, isLoading } = useAuditLog();

  const user = useAuth().user;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher company={company} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
        {isLoading && <SkeletonLoader type="list" height={40} />}
        <NavProjects auditLogs={logs} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: user?.name || userData.name,
          email: user?.email || userData.email,
          avatar: user?.avatar || userData.avatar,
        }} />
      </SidebarFooter>
    </Sidebar>
  );
}