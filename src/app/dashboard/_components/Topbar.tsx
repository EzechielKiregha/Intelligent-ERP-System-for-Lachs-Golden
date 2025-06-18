import React from 'react';
import { Bell, Menu } from 'lucide-react'; // Icons for notifications and sidebar toggle
import Link from 'next/link';
import Image from 'next/image';

const Topbar: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 h-16 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-[#374151]">
      {/* Left: Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Intelligent ERP Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back, User!
        </p>
      </div>

      {/* Right: Notifications and User Avatar */}
      <div className="flex items-center space-x-4">
        {/* Sidebar Toggle (Visible on small screens) */}
        <button
          className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#374151] focus:ring-2 focus:ring-offset-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37]"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5 text-gray-800 dark:text-gray-200" />
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#374151] focus:ring-2 focus:ring-offset-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37]"
          aria-label="View Notifications"
        >
          <Bell className="w-5 h-5 text-gray-800 dark:text-gray-200" />
        </button>

        {/* User Avatar */}
        <Link href="/profile">
          <Image
            src="https://avatar.iran.liara.run/public/47" // Replace with dynamic user image
            alt="User Avatar"
            className="w-8 h-8 rounded-full"
          />
        </Link>
      </div>
    </header>
  );
};

export default Topbar;