import * as React from 'react';
import { ChevronsUpDown, Plus } from 'lucide-react';
import axiosdb from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { C, useGetOwnerCompanies, useSwitchCompany } from '@/lib/hooks/use-owner-company';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from 'contents/authContext';
import { useRouter } from 'next/navigation';
import { useOpenCreateCompanyModal } from '@/hooks/use-open-create-company-modal';
import { Role } from '@/generated/prisma';

// Company Switcher Component
export function CompanySwitcher() {
  const { data: companies, isLoading } = useGetOwnerCompanies();
  const switchCompanyMutation = useSwitchCompany();
  const [activeCompany, setActiveCompany] = React.useState<C>();
  const isMobile = useIsMobile()
  const user = useAuth().user;
  const router = useRouter();
  const { open: openCreateCompany } = useOpenCreateCompanyModal();

  // Set the first company as active if no active company is set
  React.useEffect(() => {
    if (companies && companies.length > 0 && !activeCompany) {
      for (let i = 0; i < companies.length; i++) {
        if (user?.companyId === companies[i].id || user?.currentCompanyId === companies[i].id) {
          setActiveCompany(companies[i]);
          return;
        } else {
          setActiveCompany(companies[0]);
        }
      }
    }
  }, [companies, activeCompany, user?.companyId, user?.currentCompanyId]);

  if (isLoading) {
    return (
      <div className="h-full w-full">
        <Skeleton className="bg-sidebar-ring flex-1 w-full h-full py-6" />
      </div>
    );
  }

  // console.log("[Front Data] ", companies[0])

  // Show loading state or nothing if no active company
  if (isLoading || !activeCompany) return null;

  // Handle company switch
  const handleSwitch = (companyId: string) => {
    switchCompanyMutation.mutate(companyId, {
      onSuccess: () => {
        const newActive = companies?.find((c: C) => c.id === companyId);
        if (newActive) setActiveCompany(newActive);
      },
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className=" flex aspect-square size-8 items-center justify-center rounded-lg">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage
                    src={activeCompany?.images[0] ? activeCompany?.images[0].url : "https://github.com/shadcn.png"}
                    alt="Workspace logo"
                  />
                  <AvatarFallback className="bg-black text-white rounded-lg font-bold text-lg">
                    {activeCompany ? activeCompany?.name.charAt(0).toUpperCase() : "No Company"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeCompany.name}</span>
                <span className="truncate text-xs">{activeCompany.industry}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-sidebar text-sidebar-accent-foreground shadow-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Companies
            </DropdownMenuLabel>
            {companies && companies.map((company: C, i: number) => (
              <DropdownMenuItem
                key={company.name}
                onClick={() => {
                  if (user?.role === 'ADMIN' || user?.role === 'OWNER') {
                    handleSwitch(company.id);
                  } else {
                    toast.error('You do not have permission to switch companies.');
                  }
                }}
                className="gap-2 p-2 hover:bg-sidebar-accent"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage
                      src={company?.images[0] ? company?.images[0].url : "https://github.com/shadcn.png"}
                      alt="company logo"
                    />
                    <AvatarFallback className="bg-black text-white rounded-lg font-bold text-lg">
                      {company?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {company.name}
                <DropdownMenuShortcut className='hover:bg-sidebar-accent' >⌘{i + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <div className="px-2 flex items-center justify-between mb-1">
              <span className="text-[11px] text-muted-foreground">Add Company</span>
              <Plus
                onClick={
                  () => {
                    if (user?.role === Role.OWNER) {
                      openCreateCompany();
                    } else {
                      toast.error('You do not have permission to add a company.');
                    }
                  }
                }
                className="size-5 p-0.5 hover:bg-sidebar-accent bg-sidebar-primary cursor-pointer transition-all text-white rounded-full"
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}