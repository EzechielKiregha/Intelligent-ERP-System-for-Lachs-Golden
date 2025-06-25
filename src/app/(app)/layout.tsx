"use client";

import React from 'react';
import Topbar from './_components/Topbar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/app/(app)/_components/app-sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
};

export default Layout;