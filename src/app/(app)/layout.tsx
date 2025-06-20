"use client";

import React from 'react';
import Topbar from './_components/Topbar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/app/(app)/_components/app-sidebar';
import { AuthProvider } from 'contents/authContext';
import { SessionProvider } from 'next-auth/react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SessionProvider>
      <AuthProvider>

        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
          <SidebarProvider>
            {/* Sidebar */}
            <AppSidebar />
            <SidebarInset>
              {/* Main Content */}
              <div className="flex flex-col flex-1">
                <Topbar />
                <main className="overflow-y-auto">

                  {children}

                </main>
              </div>
            </SidebarInset>

          </SidebarProvider>
        </div>
      </AuthProvider>
    </SessionProvider>
  );
};

export default Layout;