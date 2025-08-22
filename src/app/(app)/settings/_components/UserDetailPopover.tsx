// app/settings/components/UserDetailPopover.tsx
'use client';

import { useState } from 'react';
import BasePopover from '@/components/BasePopover';
import { User, Role, UserStatus } from '@/generated/prisma';
import { format } from 'date-fns';
import {
  Users,
  Briefcase,
  DollarSign,
  BookOpen,
  FileText as FileTextIcon,
  MessageSquare,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import UserRelationships from './UserRelationships';
import UserStatistics from './UserStatistics';
import UserStatusManagement from './UserStatusManagement';
import UserRoleManagement from './UserRoleManagement';
import UserDocumentManagement from './UserDocumentManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserDetailPopoverProps {
  children: React.ReactNode;
  user: User;
}

export default function UserDetailPopover({ children, user }: UserDetailPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('relationships');

  const handleSuccess = () => {
    toast.success('User updated successfully');
    setIsOpen(false);
  };

  return (
    <BasePopover
      title={`${user.firstName} ${user.lastName}`}
      isOpen={isOpen}
      buttonLabel={`${user.firstName} ${user.lastName}`}
      onClose={() => setIsOpen(false)}
    >
      <div className="flex flex-col max-w-[90vw] min-h-[500px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-5 mb-4 bg-sidebar-accent/10">
            <TabsTrigger
              value="relationships"
              className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-foreground"
            >
              <Users className="h-4 w-4 mr-2" />
              Relationships
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
              className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-foreground"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Statistics
            </TabsTrigger>
            <TabsTrigger
              value="status"
              className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-foreground"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Status
            </TabsTrigger>
            <TabsTrigger
              value="roles"
              className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-foreground"
            >
              <Settings className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-foreground"
            >
              <FileTextIcon className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="relationships" className="flex-1">
            <UserRelationships user={user} />
          </TabsContent>

          <TabsContent value="statistics" className="flex-1">
            <UserStatistics user={user} />
          </TabsContent>

          <TabsContent value="status" className="flex-1">
            <UserStatusManagement user={user} onSuccess={handleSuccess} />
          </TabsContent>

          <TabsContent value="roles" className="flex-1">
            <UserRoleManagement user={user} onSuccess={handleSuccess} />
          </TabsContent>

          <TabsContent value="documents" className="flex-1">
            <UserDocumentManagement user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </BasePopover>
  );
}