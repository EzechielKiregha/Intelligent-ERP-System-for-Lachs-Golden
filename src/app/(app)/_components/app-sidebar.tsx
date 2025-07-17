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
import { CompanySwitcher } from "./company-switcher"
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
import { DashboardProjects } from "./dashboard-projects"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import CreateCompanyModal from "./create-company-modal"

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
      { title: "Stock", url: "/inventory/manage" },
      { title: "Low Stock Alerts", url: "/inventory/alerts" },
    ],
  },
  {
    title: "HR",
    url: "/hr",
    icon: Map,
    items: [
      { title: "Human Resource", url: "/hr" },
      { title: "Employees", url: "/hr/employees" },
      { title: "Departments", url: "/hr/departments" },
      { title: "Payroll", url: "/hr/payroll" },
      { title: "Perfornance Review", url: "/hr/reviews" },
    ],
  },
  {
    title: "CRM",
    url: "/crm",
    icon: Command,
    items: [
      { title: "Lead/Customer", url: "/crm/contacts" },
      { title: "Sales Pipeline", url: "/crm/sales" },
    ],
  },
];

const company = [
  {
    id: "1",
    name: "Intelligent ERP Inc.",
    logo: Cpu,
    plan: "Enterprise",
  },
  {
    id: "2",
    name: "Smart Solutions Ltd.",
    logo: AudioWaveform,
    plan: "Startup",
  },
  {
    id: "3",
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

function AppSidebarContent({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { data: logs, isLoading } = useAuditLog();
  const path = usePathname();
  const [pm, setPm] = React.useState(false)

  React.useEffect(() => {
    if (path.startsWith("/workspaces")) setPm(true)
    else setPm(false)
  }, [path])

  const user = useAuth().user;

  return (
    <>
      <CreateCompanyModal />
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <CompanySwitcher />
        </SidebarHeader>
        <SidebarContent>
          {pm ? (
            <DashboardProjects />
          ) : (
            <NavMain items={navMainItems} />
          )}
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
        <SidebarRail />
      </Sidebar>
    </>
  );
}

const AppSidebar = dynamic(() => Promise.resolve(AppSidebarContent), { ssr: false });

export { AppSidebar };