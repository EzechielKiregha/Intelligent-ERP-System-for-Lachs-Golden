'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from 'contents/authContext';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { ModeToggle } from './toggleTheme';
import { Menu, LogOut, Sparkles, Bell, CreditCard, BadgeCheck, ChevronsUpDown, Cpu, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetCompanyById } from '@/lib/hooks/use-owner-company';
import Image from 'next/image';
import NotificationPopover from './NotificationPopover';

export function Navbar() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const user = useAuth().user;
  const logout = useAuth().logout;

  const navItems = [
    { label: 'Who we are', href: 'https://lachsgolden.com/about/' },
    { label: 'Contact us', href: 'https://lachsgolden.com/contact-us-2/' },
    { label: 'Features', href: '/#features' },
    { label: 'Solutions', href: '/#solutions' },
    { label: 'Stats', href: '/#stats' },
  ];

  const currentUser = useAuth().user;
  const { data: company, isLoading: companyLoading, isError: companyError } = useGetCompanyById(currentUser?.currentCompanyId || '');

  if (companyLoading) {
    return (
      <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-50">
        <div
          className={`h-full bg-sidebar-primary transition-all duration-500 ${companyLoading ? 'animate-loading-bar' : 'w-0'
            }`}
        >
        </div>
      </div>
    );
  }

  return (
    <nav className="fixed top-0 left-0 w-full h-16 dark:bg-gray-950 bg-gray-50 border-b-3 border-[#D4AF37]  shadow flex items-center px-6 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full w-full">
        <Link href="/" className="text-xl items-center font-bold flex flex-row gap-1.5 text-sidebar-primary dark:text-[#D4AF37]">
          <Image width="50" height="50" src="https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png"
            alt="" sizes="(max-width: 371px) 100vw, 371px" />
          <p>{company ? company?.name : 'Intelligent ERP - Lachs Golden'}</p>
          <span className="hidden md:flex text-sm text-muted-foreground">{company ? company?.industry : 'Inc.'}</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            if (item.label === "Who we are" || item.label === "Contact us") {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="link"
                    className='text-gray-800 cursor-pointer dark:text-gray-200 hover:text-[#80410e] dark:hover:text-[#D4AF37]'
                  >
                    {item.label}<ArrowUpRight />
                  </Button>
                </Link>
              )
            } else {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                >
                  <Button
                    variant="link"
                    className='text-gray-800 cursor-pointer dark:text-gray-200 hover:text-[#80410e] dark:hover:text-[#D4AF37]'
                  >
                    {item.label}
                  </Button>
                </Link>
              )
            }
          })}

          <ModeToggle />
          {/* Notifications Icon */}
          {
            user && (
              <NotificationPopover />
            )
          }
          {user ? (
            <div className="ml-8 space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent bg-transparent hover:bg-sidebar-primary data-[state=open]:text-sidebar-accent-foreground text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-none">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback className="rounded-lg">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
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
                  side={"bottom"}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-none">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback className="rounded-lg">LG</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{user.name}</span>
                        <span className="truncate text-xs">{user.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="hover:bg-sidebar-accent" onClick={() => router.push("/dashboard")}>
                      <Sparkles />
                      Dashboard
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => router.push("/settings")}
                      className="hover:bg-sidebar-accent">
                      <BadgeCheck />
                      Account
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem className="hover:bg-sidebar-accent">
                      <CreditCard />
                      Contract
                    </DropdownMenuItem> */}
                    {/* <DropdownMenuItem className="hover:bg-sidebar-accent">
                      <Bell />
                      <NotificationPopover />
                    </DropdownMenuItem> */}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="hover:bg-sidebar-accent" onClick={logout}>
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="ml-8 space-x-3">
              <Link href="/login" className="text-gray-800 dark:text-gray-200 hover:text-[#80410e] dark:hover:text-[#D4AF37]">
                Login
              </Link>
              <Button onClick={() => router.push('/signup')} className="bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground cursor-pointer">
                Register
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-sidebar text-sidebar-foreground w-64 p-4">
              <SheetHeader>
                <h2 className="text-lg font-bold">Menu</h2>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-sm hover:text-[#D4AF37]"
                  >
                    {item.label}
                  </Link>
                ))}

                <ModeToggle />
                {/* Notifications Icon */}
                {
                  user && (
                    <NotificationPopover />
                  )
                }
                {user ? (
                  <>
                    <div className="flex items-center gap-2 mt-4 bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={"https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png"} alt={user.name} />
                        <AvatarFallback className="rounded-lg">ERP</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs">{user.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="w-full mt-2" onClick={() => router.push('/dashboard')}>
                      Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={logout}>
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
                      Login
                    </Button>
                    <Button className="w-full bg-sidebar-accent text-sidebar-accent-foreground" onClick={() => router.push('/signup')}>
                      Register
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav >
  );
}
