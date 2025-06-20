"use client";

import React from 'react';
import Topbar from './_components/Topbar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/app/(app)/_components/app-sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <AppSidebar />
        <SidebarInset>
          {/* Main Content */}
          <div className="flex flex-col flex-1 min-h-screen">
            <Topbar />
            <main className="overflow-y-auto">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;