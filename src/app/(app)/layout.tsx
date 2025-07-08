"use client";

import React from "react";
import Topbar from "./_components/Topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/(app)/_components/app-sidebar";
import AuthGuard from "./_components/AuthGuard";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Topbar />
          <div className="overflow-y-auto flex items-center justify-between px-6 h-16">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
};

export default Layout;