
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React, { Suspense } from "react";
import { AppSidebar } from "../(app)/_components/app-sidebar";
import Topbar from "../(app)/_components/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
