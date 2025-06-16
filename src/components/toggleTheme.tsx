'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="transition ease-in-out duration-150 hover:shadow-lg hover:scale-105 motion-safe:transform">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 text-[#A17E25] dark:text-[#D4AF37]" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 text-[#A17E25] dark:text-[#D4AF37]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-[#1E293B] rounded-lg shadow">
        <DropdownMenuItem onClick={() => setTheme('light')} className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A2E3B]">
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A2E3B]">
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A2E3B]">
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
