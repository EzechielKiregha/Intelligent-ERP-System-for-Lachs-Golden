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

]

const financeLinks = [
  { title: "Finance", url: "/finance", icon: PieChart },
  { title: "Transactions", url: "/finance/transactions", icon: SquareTerminal },
  { title: "Budget", url: "/finance/budget", icon: BookOpen },
  { title: "Analytics", url: "/finance/analytics", icon: IconAnalyze },
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
  { title: "Lead/Customer", url: "/crm/contacts", icon: Command },
  // { title: "Sales Pipeline", url: "/crm/sales", icon: Bot },
]

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
      // { title: "Sales Pipeline", url: "/crm/sales" },
    ],
  },
];

const userData = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png",
};

function AppSidebarContent({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { data: logs, isLoading } = useAuditLog();
  const path = usePathname();
  const [pm, setPm] = React.useState(false)
  const [navItems, setNavItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (path.startsWith("/workspaces")) setPm(true)
    else setPm(false)

    const getNavItems = () => {
      if (user.role === Role.CEO || user.role === Role.MANAGER) {
        return [
          ...dashboardLinks,
          ...financeLinks,
        ]
      } else if (user.role === Role.HR || user.role === Role.ACCOUNTANT) {
        return [
          ...hrLinks,
          ...financeLinks,
        ]
      } else if (user.role === Role.EMPLOYEE) {
        return [
          ...crmLinks,
          ...inventoryLinks,
        ]
      } else if (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN) {
        return navMainItems;
      } else {
        return [];
      }
    }
    setNavItems(getNavItems());
  }, [path])

  const user = useAuth().user;

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
          }} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}

const AppSidebar = dynamic(() => Promise.resolve(AppSidebarContent), { ssr: false });

export { AppSidebar };