// components/settings/UserFormPopover.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Role, UserStatus } from '@/generated/prisma';
import { toast } from 'sonner';
import { User, Loader2 } from 'lucide-react';
import { useAuth } from 'contents/authContext';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role?: Role;
  status?: UserStatus;
}

interface UserFormPopoverProps {
  children: React.ReactNode;
  user?: any; // If provided, it's for editing
  onSuccess?: () => void;
}

export default function UserFormPopover({ children, user, onSuccess }: UserFormPopoverProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: Role.USER,
    status: UserStatus.PENDING,
  });

  const { user: currentUser } = useAuth();

  // Initialize form data when editing
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || Role.USER,
        status: user.status || UserStatus.PENDING,
      });
    } else {
      // Reset form for new user
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: Role.USER,
        status: UserStatus.PENDING,
      });
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // For new users, we need companyId from the session
      const companyId = currentUser?.currentCompanyId || '';

      if (!companyId) {
        throw new Error('Company ID is required');
      }

      const payload = {
        ...formData,
        companyId,
        // For new users, require password
        ...(user ? {} : { password: formData.password }),
      };

      const url = user ? `/api/settings/user/update/${user.id}` : '/api/signup';
      const method = user ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save user');
      }

      toast.success(user ? 'User updated successfully' : 'User created successfully');
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-sidebar border-[var(--sidebar-border)]">
        <DialogHeader>
          <DialogTitle className="text-sidebar-foreground flex items-center gap-2">
            <User className="h-5 w-5" />
            {user ? 'Edit User' : 'Create New User'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sidebar-foreground/80">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="bg-sidebar-accent/10 border-sidebar-accent/30 text-sidebar-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sidebar-foreground/80">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="bg-sidebar-accent/10 border-sidebar-accent/30 text-sidebar-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sidebar-foreground/80">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-sidebar-accent/10 border-sidebar-accent/30 text-sidebar-foreground"
            />
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sidebar-foreground/80">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required={!user}
                className="bg-sidebar-accent/10 border-sidebar-accent/30 text-sidebar-foreground"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sidebar-foreground/80">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange('role', value)}
              >
                <SelectTrigger className="bg-sidebar-accent/10 border-sidebar-accent/30">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-sidebar border-[var(--sidebar-border)]">
                  {Object.values(Role).map(role => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0) + role.slice(1).toLowerCase().replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sidebar-foreground/80">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger className="bg-sidebar-accent/10 border-sidebar-accent/30">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-sidebar border-[var(--sidebar-border)]">
                  {Object.values(UserStatus).map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {user ? 'Updating...' : 'Creating...'}
                </>
              ) : user ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}