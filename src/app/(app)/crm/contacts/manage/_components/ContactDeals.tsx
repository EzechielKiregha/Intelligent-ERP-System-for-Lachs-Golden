// app/crm/contacts/manage/_components/ContactDeals.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, TrendingUp } from 'lucide-react';
import { DealStage } from '@/generated/prisma';
import { useDealsByContactId } from '@/lib/hooks/crm';
import DealFormPopover from '../../../deals/_components/DealFormPopover';

interface ContactDealsProps {
  contactId: string;
}

const STAGE_COLORS: Record<DealStage, string> = {
  NEW: 'bg-blue-500/20 text-blue-300',
  QUALIFIED: 'bg-cyan-500/20 text-cyan-300',
  PROPOSAL: 'bg-emerald-500/20 text-emerald-300',
  NEGOTIATION: 'bg-amber-500/20 text-amber-300',
  WON: 'bg-green-500/20 text-green-300',
  LOST: 'bg-red-500/20 text-red-300',
};

export default function ContactDeals({ contactId }: ContactDealsProps) {
  const { data: deals = [], isLoading } = useDealsByContactId(contactId);

  if (isLoading) {
    return (
      <Card className="bg-sidebar border-[var(--sidebar-border)]">
        <CardHeader>
          <CardTitle className="text-sidebar-foreground">Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sidebar-foreground/70">Loading deals...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-sidebar border-[var(--sidebar-border)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold text-sidebar-foreground">
          Deals
        </CardTitle>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          <DealFormPopover label={`Add Deal  ${deals.length > 0 ? 'for ' + deals[0].contact.fullName : ''}`} contactId={contactId}>
            <Button>Add Deal  ${deals.length > 0 ? 'for ' + deals[0].contact.fullName : ''}</Button>
          </DealFormPopover>
        </Button>
      </CardHeader>
      <CardContent>
        {deals.length === 0 ? (
          <p className="text-sidebar-foreground/70">No deals found for this contact</p>
        ) : (
          <div className="space-y-4">
            {deals.map(deal => (
              <div
                key={deal.id}
                className="p-4 bg-sidebar-accent/10 rounded border border-sidebar-accent/20"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-sidebar-foreground">{deal.title}</h3>
                    <p className="text-sm text-sidebar-foreground/70">${deal.amount.toLocaleString()}</p>
                  </div>
                  <Badge className={STAGE_COLORS[deal.stage]}>
                    {deal.stage}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center text-sm text-sidebar-foreground/60">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Created {new Date(deal.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}