import { CheckCircle2, Home, LayoutDashboard, Settings, Users } from "lucide-react";

export const NAV_ITEMS = [
  {
    name: "Workplace",
    link: "",
    icon: LayoutDashboard,
  },
  {
    name: "Tasks",
    link: "/tasks",
    icon: CheckCircle2,
  },
  {
    name: "Settings",
    link: "/settings",
    icon: Settings,
  },
  {
    name: "Members",
    link: "/members",
    icon: Users,
  },
];
