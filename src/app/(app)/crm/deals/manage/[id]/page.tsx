// app/crm/deals/manage/[id]/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DealForm from '../../_components/DealForm';
import { useSingleDeal } from '@/lib/hooks/crm';
import { toast } from 'sonner';

export default function ManageDealPage() {
  const router = useRouter();
  const { id } = useParams();
  const dealId = id as string;
  const { data: deal, isLoading, error } = useSingleDeal(dealId);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (error) {
      toast.error('Failed to load deal');
    }
  }, [error]);

  const handleSuccess = () => {
    toast.success('Deal updated successfully');
    router.push('/crm/deals');
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this deal?')) {
      try {
        await fetch(`/api/crm/deals/${dealId}`, {
          method: 'DELETE',
        });

        toast.success('Deal deleted successfully');
        router.push('/crm/deals');
      } catch (error) {
        toast.error('Failed to delete deal');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push('/crm/deals')} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold text-sidebar-foreground">Loading Deal...</h1>
        </div>
        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-sidebar-accent" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push('/crm/deals')} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold text-sidebar-foreground">Deal Not Found</h1>
        </div>
        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardContent className="p-8 text-center text-sidebar-foreground/70">
            We couldn't find a deal with that ID. The deal may have been deleted.
          </CardContent>
        </Card>
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => router.push('/crm/deals')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Deals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push('/crm/deals')} className="mr-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold text-sidebar-foreground">
          {deal.title}
        </h1>
        <div className="ml-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${deal.stage === 'WON' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
            deal.stage === 'LOST' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
              'bg-sidebar-accent/20 text-sidebar-accent-foreground'
            }`}>
            {deal.stage.charAt(0) + deal.stage.slice(1).toLowerCase().replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <Card className="bg-sidebar border-[var(--sidebar-border)]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <Button
                variant={activeTab === 'details' ? 'default' : 'outline'}
                onClick={() => setActiveTab('details')}
              >
                Details
              </Button>
              <Button
                variant={activeTab === 'contact' ? 'default' : 'outline'}
                onClick={() => setActiveTab('contact')}
              >
                Contact
              </Button>
              <Button
                variant={activeTab === 'activity' ? 'default' : 'outline'}
                onClick={() => setActiveTab('activity')}
              >
                Activity
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleDelete} className="text-red-400 hover:text-red-300">
                Delete Deal
              </Button>
              <Button>Save Changes</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'details' && (
            <DealForm
              deal={deal}
              onSuccess={handleSuccess}
            />
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="p-4 bg-sidebar-accent/10 rounded border border-sidebar-accent/20">
                <h3 className="font-medium text-sidebar-foreground mb-2">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-sidebar-foreground/60">Name</p>
                    <p className="font-medium text-sidebar-foreground">
                      {deal.contact?.fullName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-sidebar-foreground/60">Email</p>
                    <p className="font-medium text-sidebar-foreground">
                      {deal.contact?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-sidebar-foreground/60">Phone</p>
                    <p className="font-medium text-sidebar-foreground">
                      {deal.contact?.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-sidebar-foreground/60">Company</p>
                    <p className="font-medium text-sidebar-foreground">
                      {deal.contact?.companyName || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => router.push(`/crm/contacts/manage/${deal.contactId}`)}>
                  View Full Contact
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="p-4 bg-sidebar-accent/10 rounded border border-sidebar-accent/20">
                <h3 className="font-medium text-sidebar-foreground mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-blue-500/20 text-blue-300 p-1 rounded mr-2 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-sidebar-foreground">Email sent</p>
                      <p className="text-sm text-sidebar-foreground/70">Proposal document shared</p>
                      <p className="text-xs text-sidebar-foreground/50 mt-1">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-green-500/20 text-green-300 p-1 rounded mr-2 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-sidebar-foreground">Meeting completed</p>
                      <p className="text-sm text-sidebar-foreground/70">Discussed pricing and timeline</p>
                      <p className="text-xs text-sidebar-foreground/50 mt-1">Yesterday at 2:30 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline">
                  View All Activity
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}