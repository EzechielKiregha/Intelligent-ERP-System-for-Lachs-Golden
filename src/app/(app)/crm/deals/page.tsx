// app/crm/deals/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useDeals } from '@/lib/hooks/crm';
import DealTable from './_components/DealTable';
import { useUserSettings } from '../../settings/hooks/useUserSettings';
import DealFormPopover from './_components/DealFormPopover';

export default function DealsPage() {
  const { userData } = useUserSettings();
  const { data: deals = [] } = useDeals();

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-sidebar-foreground">Deals</h1>
        <DealFormPopover>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Deal
          </Button>
        </DealFormPopover>
      </div>

      <Card className="bg-sidebar border-[var(--sidebar-border)]">
        <CardHeader>
          <CardTitle className="text-sidebar-foreground">All Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <DealTable deals={deals} />
        </CardContent>
      </Card>
    </div>
  );
}