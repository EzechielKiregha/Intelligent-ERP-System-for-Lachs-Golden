'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, BellRingIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/toggleTheme';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { NavUser } from './nav-user';
import { useAuth } from 'contents/authContext';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const Topbar: React.FC = () => {
  const pathname = usePathname();
  const user = useAuth().user;

  // Determine the active page based on the route
  const activePage = (pathname.split('/')[1] || 'dashboard');

  return (
    <header className="flex h-16 shrink-0 items-center border-b-2 border-[#D4AF37] justify-between px-6 gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">
                Intelligent ERP
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{activePage}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right: Topbar Links and Notifications */}
      <div className="flex items-center space-x-4">


        {/* Notifications Toggle theme*/}
        <ModeToggle />

        {/* <Button variant="outline" size="icon" className="transition ease-in-out duration-150 hover:shadow-lg hover:scale-105 motion-safe:transform">
          <Bell className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 text-[#A17E25] dark:text-[#D4AF37]" />
          <BellRingIcon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 text-[#A17E25] dark:text-[#D4AF37]" />
          <span className="sr-only">Notifications</span>
        </Button> */}
        {/* User Profile (Placeholder) */}
        <NavUser user={
          {
            name: user?.name,
            email: user?.email,
            avatar: user?.image || "https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png",
          }
        } />

      </div>
    </header>
  );
};

export default Topbar;