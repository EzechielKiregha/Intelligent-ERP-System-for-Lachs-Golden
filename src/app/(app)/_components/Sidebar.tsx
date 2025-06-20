"use client";
import React from 'react';
import { Grid, DollarSign, Box, Users, Briefcase } from 'lucide-react'; // Example icons
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar: React.FC = () => {

  const pathname = usePathname();
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <Grid /> },
    { name: 'Finance', href: '/finance', icon: <DollarSign /> },
    { name: 'Inventory', href: '/inventory', icon: <Box /> },
    { name: 'HR', href: '/hr', icon: <Users /> },
    { name: 'CRM', href: '/crm', icon: <Briefcase /> },
  ];

  return (
    <nav
      className="h-screen w-64  bg-gradient-to-l from-[#80410e] to-[#c56a03] text-white flex flex-col"
      aria-label="Sidebar"
    >
      {/* Logo */}
      <div className="p-6 text-xl font-bold border-b border-white/20">
        Intelligent ERP
      </div>

      {/* Navigation Items */}
      <ul className="flex-1 mt-4 space-y-2">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-white/10 focus:ring-2 focus:ring-offset-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37]"
              aria-current={item.href === pathname ? 'page' : undefined}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="p-4 border-t border-white/20 text-sm">
        © 2025 Intelligent ERP
      </div>
    </nav>
  );
};

export default Sidebar;