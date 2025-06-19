'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell, Menu } from 'lucide-react';

const Topbar: React.FC = () => {
  const pathname = usePathname();

  // Determine the active page based on the route
  const activePage = (pathname.split('/')[2] || 'dashboard') as keyof typeof topbarLinks;

  // Define Topbar links based on the active page
  const topbarLinks: Record<'dashboard' | 'finance' | 'inventory' | 'hr' | 'crm', { name: string; href: string; }[]> = {
    dashboard: [
      { name: 'Analytics', href: '/dashboard/analytics' },
      { name: 'Reports', href: '/dashboard/reports' },
    ],
    finance: [
      { name: 'Finance CRUD', href: '/dashboard/finance/crud' },
      { name: 'Export Report', href: '/dashboard/finance/export' },
    ],
    inventory: [
      { name: 'Stock Management', href: '/dashboard/inventory/stock' },
      { name: 'Low Stock Alerts', href: '/dashboard/inventory/alerts' },
    ],
    hr: [
      { name: 'Employee Management', href: '/dashboard/hr/employees' },
      { name: 'Payroll', href: '/dashboard/hr/payroll' },
    ],
    crm: [
      { name: 'Customer Management', href: '/dashboard/crm/customers' },
      { name: 'Sales Pipeline', href: '/dashboard/crm/sales' },
    ],
  };

  return (
    <header className="flex items-center justify-between px-6 h-16 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-[#374151]">
      {/* Left: Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 capitalize">
          {activePage} Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, User!</p>
      </div>

      {/* Right: Topbar Links and Notifications */}
      <div className="flex items-center space-x-4">
        {/* Sidebar Toggle (Visible on small screens) */}
        <button
          className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#374151] focus:ring-2 focus:ring-offset-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37]"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5 text-gray-800 dark:text-gray-200" />
        </button>

        {/* Topbar Links */}
        {topbarLinks[activePage]?.map((link) => (
          <Link key={link.name} href={link.href}>
            <button className="px-4 py-2 rounded-lg bg-[#A17E25] text-white hover:bg-[#8C6A1A]">
              {link.name}
            </button>
          </Link>
        ))}

        {/* Notifications */}
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#374151] focus:ring-2 focus:ring-offset-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37]"
          aria-label="View Notifications"
        >
          <Bell className="w-5 h-5 text-gray-800 dark:text-gray-200" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;