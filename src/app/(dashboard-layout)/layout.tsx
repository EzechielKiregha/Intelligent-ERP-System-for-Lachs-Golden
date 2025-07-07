
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import React, { Suspense } from "react";
import { AppSidebar } from "../(app)/_components/app-sidebar";
import Topbar from "../(app)/_components/Topbar";
import AuthGuard from "../(app)/_components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen">
        {/* Sidebar */}
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            {/* Main Content */}
            <div className="">
              <Topbar />
              <main className="overflow-y-auto">
                {children}
              </main>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </AuthGuard>
  );
}
