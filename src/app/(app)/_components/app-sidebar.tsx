"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
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

// This is sample data.

const companyData = {
  name: "Intelligent ERP Inc.",
  logo: "/logos/intelligent-erp.png",
  plan: "Enterprise",
};

const transactions = [
  { id: 1, date: "2025-06-01", amount: 15000, category: "Marketing", status: "Completed", url: "/finance/transactions/1" },
  { id: 2, date: "2025-06-02", amount: 25000, category: "Sales", status: "Completed", url: "/finance/transactions/1" },
  { id: 3, date: "2025-06-03", amount: 5000, category: "Office Supplies", status: "Pending", url: "/finance/transactions/1" },
  { id: 4, date: "2025-06-04", amount: 12000, category: "HR", status: "Failed", url: "/finance/transactions/1" },
];

const navMainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: GalleryVerticalEnd,
    isActive: true,
    items: [
      { title: "Dashboard", url: "/dashboard" },
      { title: "Analytics", url: "/dashboard/analytics" },
      { title: "Reports", url: "/dashboard/reports" },
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
      { title: "Stock Management", url: "/inventory/stock" },
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
    logo: GalleryVerticalEnd,
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

  const user = useAuth().user;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher company={company} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
        <NavProjects transactions={transactions} />
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