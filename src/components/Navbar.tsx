'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from 'contents/authContext';
import { useNavigation } from '@/hooks/use-navigation';
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
import { Menu, LogOut, Sparkles, Bell, CreditCard, BadgeCheck, ChevronsUpDown, Cpu } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const user = useAuth().user;
  const logout = useAuth().logout;

  const navItems = [
    { label: 'Features', href: '/#features' },
    { label: 'Solutions', href: '/#solutions' },
    { label: 'Stats', href: '/#stats' },
    { label: 'Contact', href: '/#contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-sidebar shadow flex items-center px-6 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full w-full">
        <Link href="/" className="text-xl font-bold flex flex-row gap-1.5 text-[#80410e] dark:text-[#D4AF37]">
          <Cpu className="w-6 h-6 text-[#80410e] dark:text-[#D4AF37]" />
          Intelligent ERP
          <span className="hidden md:flex text-sm text-muted-foreground">Inc.</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-3">
          {navItems.map((item) => (
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
          ))}

          <ModeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent bg-sidebar-accent hover:bg-sidebar-primary data-[state=open]:text-sidebar-accent-foreground text-sidebar-accent-foreground"
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
                side={"bottom"}
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
                  <DropdownMenuItem className="hover:bg-sidebar-accent" onClick={() => router.push("/dashboard")}>
                    <Sparkles />
                    Dashboard
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="hover:bg-sidebar-accent">
                    <Sparkles />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="hover:bg-sidebar-accent">
                    <BadgeCheck />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-sidebar-accent">
                    <CreditCard />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-sidebar-accent">
                    <Bell />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-sidebar-accent" onClick={logout}>
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
              <Button onClick={() => router.push('/signup')} className="bg-sidebar-accent text-sidebar-accent-foreground">
                Register
              </Button>
            </>
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

                {user ? (
                  <>
                    <div className="flex items-center gap-2 mt-4 bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={"https://github.com/shadcn.png"} alt={user.name} />
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
