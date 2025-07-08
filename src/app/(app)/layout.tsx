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
        <div className="flex h-screen">
          <AppSidebar />
          <SidebarInset>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Topbar />
              <main className="overflow-y-auto">{children}</main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
};

export default Layout;