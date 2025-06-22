'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/hooks/use-navigation';
import { ModeToggle } from './toggleTheme';
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Menu, Sparkles, X } from 'lucide-react';
import { useAuth } from 'contents/authContext';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const nav = useNavigation();
  const navItems = [
    { label: 'Features', href: '/#features' },
    { label: 'Solutions', href: '/#solutions' },
    { label: 'Stats', href: '/#stats' },
    { label: 'Contact', href: '/#contact' },
  ];
  const user = useAuth().user;
  const logout = useAuth().logout

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-sidebar shadow flex items-center px-6 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full w-full">
        <Link href="/" className="text-[20px] font-bold text-[#80520e] dark:text-[#c56a03] ">
          Golden Intelingent ERP
        </Link>
        {/* Desktop menu */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-800 dark:text-gray-200 hover:text-[#80410e] dark:hover:text-[#D4AF37]"
            >
              {item.label}
            </Link>
          ))}
          <ModeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent bg-sidebar hover:bg-sidebar-accent dark:hover:text-sidebar-foreground text-sidebar-foreground data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-sidebar text-sidebar-foreground"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => nav("/dashboard")}>
                    <Sparkles />
                    Dashboard
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="text-gray-800 dark:text-gray-200 hover:text-[#80410e] dark:hover:text-[#D4AF37]">
                Login
              </Link>
              <Button onClick={() => nav('/signup')} className="bg-gradient-to-l from-[#80410e] to-[#c56a03] hover:bg-[#8C6A1A] text-white">
                Register
              </Button>
            </>
          )}

          {/* Get Started Button */}


        </div>
        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#374151]"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-[#1E293B] shadow">
          <div className="flex flex-col px-4 py-2 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded text-gray-800 dark:text-gray-200 hover:bg-[#FEF3C7] dark:hover:bg-[#3E3E3E]"
              >
                {item.label}
              </Link>
            ))}
            <Button onClick={() => nav('/signup')} className="w-full bg-gradient-to-l from-[#80410e] to-[#c56a03] hover:bg-[#8C6A1A] text-white">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}