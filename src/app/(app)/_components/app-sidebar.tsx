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
import { Role } from "@/generated/prisma"

const dashboardLinks = [
  { title: "Dashboard", url: "/dashboard", icon: GalleryVerticalEnd },
  { title: "Reports", url: "/dashboard/reports", icon: PieChart },
  { title: "Activity Feed", url: "/dashboard/activity", icon: Command },
  { title: "Workspaces", url: "/workspaces", icon: Frame },

]

const financeLinks = [
  { title: "Finance", url: "/finance", icon: PieChart },
  { title: "Transactions", url: "/finance/transactions", icon: SquareTerminal },
  { title: "Budget", url: "/finance/budget", icon: BookOpen },
  { title: "Analytics", url: "/settings", icon: IconAnalyze },
]

const inventoryLinks = [
  { title: "Inventory", url: "/inventory", icon: Frame },
  { title: "Stock", url: "/inventory/manage", icon: SquareTerminal },
  { title: "Low Stock Alerts", url: "/inventory/alerts", icon: Bot },
]

const hrLinks = [
  { title: "Human Resource", url: "/hr", icon: Map },
  { title: "Employees", url: "/hr/employees", icon: Bot },
  { title: "Departments", url: "/hr/departments", icon: Settings2 },
  { title: "Payroll", url: "/hr/payroll", icon: Cpu },
  { title: "Performance Review", url: "/hr/reviews", icon: AudioWaveform },

]

const crmLinks = [
  { title: "CRM", url: "/crm", icon: Command },
  { title: "Lead/Customer", url: "/crm/contacts", icon: Command },
  { title: "Deals", url: "/crm/deals", icon: Bot },
  { title: "Reports", url: "/crm/reports", icon: Bot },
]

export const navMainItems = [
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
      { title: "Reports", url: "/finance/reports" },
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
      { title: "Reports", url: "/inventory/reports" },
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
      { title: "Performance Review", url: "/hr/reviews" },
      { title: "Reports", url: "/hr/reports" },
    ],
  },
  {
    title: "CRM",
    url: "/crm",
    icon: Command,
    items: [
      { title: "CRM", url: "/crm", icon: Command },
      { title: "Lead/Customers", url: "/crm/contacts", icon: Command },
      { title: "Deals", url: "/crm/deals", icon: Command },
      { title: "Reports", url: "/crm/reports", icon: Command },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2,
    items: [
      { title: "Settings", url: "/settings" },
    ]
  },
];

const userData = {
  name: "John Doe",
  email: "john.doe@example.com",
  role: "USER",
  avatar: "https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png",
};

function AppSidebarContent({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { data: logs, isLoading } = useAuditLog();
  const path = usePathname();
  const [pm, setPm] = React.useState(false)
  const [navItems, setNavItems] = React.useState<any[]>([]);
  const user = useAuth().user;

  React.useEffect(() => {
    if (path.startsWith("/workspaces")) {
      setPm(true);
    } else {
      setPm(false);
    }

    if (!user?.role) return; // Ensure user.role is defined before proceeding

    const getNavItems = () => {
      switch (user.role) {
        case Role.CEO:
        case Role.MANAGER:
          return [...dashboardLinks, ...financeLinks];
        case Role.HR:
          return [...financeLinks, ...hrLinks, ...crmLinks];
        case Role.ACCOUNTANT:
          return [...financeLinks, ...hrLinks];
        case Role.EMPLOYEE:
        case Role.MEMBER:
          return [...inventoryLinks, ...crmLinks];
        case Role.SUPER_ADMIN:
        case Role.ADMIN:
          return navMainItems;
        default:
          return [];
      }
    };

    setNavItems(getNavItems());
  }, [path, user?.role]);

  return (
    <>
      <CreateCompanyModal />
      <Sidebar collapsible="icon" {...props} className="border-r-2 border-[#D4AF37]" >
        <SidebarHeader>
          <CompanySwitcher />
        </SidebarHeader>
        <SidebarContent>
          {pm ? (
            <DashboardProjects />
          ) : (
            <NavMain items={navItems} />
          )}
          {isLoading && <SkeletonLoader type="list" height={40} />}
          <NavProjects auditLogs={logs} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={{
            name: user?.name || userData.name,
            email: user?.email || userData.email,
            avatar: user?.image || userData.avatar,
            role: user?.role || userData.role,

          }} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}

const AppSidebar = dynamic(() => Promise.resolve(AppSidebarContent), { ssr: false });

export { AppSidebar };