// app/crm/_components/SalesPipeline.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Grid, DollarSign, Pencil } from 'lucide-react';
import { DealStage } from '@/generated/prisma';
import { useDeals, useUpdateDeal } from '@/lib/hooks/crm';
import DealStageColumn from './DealStageColumn';
import { toast } from 'sonner';
import { Deal } from '../deals/types/types';
import DealFormPopover from '../deals/_components/DealFormPopover';
import { Badge } from '@/components/ui/badge';

const STAGES: DealStage[] = [
  'NEW',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST'
];

interface SalesPipelineProps {
  onDealUpdated?: () => void;
}

export default function SalesPipeline({ onDealUpdated }: SalesPipelineProps) {
  const { data: deals = [], isLoading, refetch } = useDeals();
  const updateDealMutation = useUpdateDeal();
  const [stageDeals, setStageDeals] = useState<Record<DealStage, Deal[]>>(() => {
    const initial: Record<DealStage, Deal[]> = {
      NEW: [],
      QUALIFIED: [],
      PROPOSAL: [],
      NEGOTIATION: [],
      WON: [],
      LOST: []
    };

    if (deals) {
      deals.forEach(deal => {
        if (initial[deal.stage] !== undefined) {
          initial[deal.stage].push(deal);
        }
      });
    }

    return initial;
  });

  // View mode: grid (columns) or list (all deals)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Initialize state when deals load
  useEffect(() => {
    if (deals) {
      const newStageDeals: Record<DealStage, Deal[]> = {
        NEW: [],
        QUALIFIED: [],
        PROPOSAL: [],
        NEGOTIATION: [],
        WON: [],
        LOST: []
      };

      deals.forEach(deal => {
        if (newStageDeals[deal.stage] !== undefined) {
          newStageDeals[deal.stage].push(deal);
        }
      });

      setStageDeals(newStageDeals);
    }
  }, [deals]);

  // Handle deal stage change
  const handleStageChange = async (dealId: string, newStage: DealStage) => {
    try {
      // Find the deal in current state
      let currentStage: DealStage | null = null;
      for (const stage of STAGES) {
        if (stageDeals[stage].some(d => d.id === dealId)) {
          currentStage = stage;
          break;
        }
      }

      if (!currentStage) {
        toast.error('Deal not found in pipeline');
        return;
      }

      // Update in database
      await updateDealMutation.mutateAsync({
        id: dealId,
        stage: newStage,
        title: stageDeals[currentStage].find(d => d.id === dealId)?.title || '',
        amount: stageDeals[currentStage].find(d => d.id === dealId)?.amount || 0,
        contactId: stageDeals[currentStage].find(d => d.id === dealId)?.contactId || ''
      });

      // Update UI state
      setStageDeals(prev => {
        const newDeals = { ...prev };

        // Remove from current stage
        newDeals[currentStage!] = newDeals[currentStage!].filter(d => d.id !== dealId);

        // Add to new stage
        newDeals[newStage] = [...newDeals[newStage], {
          ...stageDeals[currentStage!].find(d => d.id === dealId)!,
          stage: newStage
        }];

        return newDeals;
      });

      toast.success('Deal stage updated');
      onDealUpdated?.();
    } catch (error) {
      toast.error('Failed to update deal stage');
      console.error('Stage change error:', error);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Pipeline refreshed');
  };

  return (
    <Card className="bg-sidebar border-[var(--sidebar-border)]">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-semibold text-sidebar-foreground">
            Sales Pipeline
          </CardTitle>
          <p className="text-sm text-sidebar-foreground/70 mt-1">
            {viewMode === 'grid'
              ? 'Viewing deals by stage'
              : 'All deals in a single list'
            }
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="flex-1 sm:flex-none"
            >
              <Grid className="h-4 w-4 mr-2" />
              Grid View
            </Button>

            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex-1 sm:flex-none"
            >
              <ListIcon className="h-4 w-4 mr-2" />
              List View
            </Button>
          </div>

          <DealFormPopover>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Deal
            </Button>
          </DealFormPopover>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sidebar-accent"></div>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {STAGES.flatMap(stage =>
              stageDeals[stage].map(deal => (
                <div
                  key={deal.id}
                  className="p-4 bg-sidebar-accent/10 rounded border border-sidebar-accent/20"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-sidebar-foreground">{deal.title}</h3>
                      <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-sm text-sidebar-foreground/80 flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {deal.amount.toLocaleString()}
                        </span>
                        <Badge
                          variant="outline"
                          className={STAGE_COLORS[deal.stage]}
                        >
                          {STAGE_TITLES[deal.stage]}
                        </Badge>
                        <span className="text-xs bg-sidebar-accent/20 text-sidebar-accent-foreground px-2 py-0.5 rounded">
                          {deal.contact?.fullName?.split(' ')[0] || 'Contact'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <StageSelector
                        currentStage={deal.stage}
                        onStageChange={(newStage) => handleStageChange(deal.id, newStage)}
                      />
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STAGES.map(stage => (
              <DealStageColumn
                key={stage}
                stage={stage}
                deals={stageDeals[stage]}
                onStageChange={handleStageChange}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper components for List View
function StageSelector({
  currentStage,
  onStageChange
}: {
  currentStage: DealStage;
  onStageChange: (stage: DealStage) => void
}) {
  return (
    <select
      value={currentStage}
      onChange={(e) => onStageChange(e.target.value as DealStage)}
      className="text-xs border border-sidebar-accent/30 bg-sidebar-accent/10 text-sidebar-foreground rounded px-2 py-1"
    >
      {STAGES.map(stage => (
        <option key={stage} value={stage}>
          {STAGE_TITLES[stage]}
        </option>
      ))}
    </select>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

// Stage color mapping (reused from DealStageColumn)
const STAGE_COLORS: Record<DealStage, string> = {
  NEW: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  QUALIFIED: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  PROPOSAL: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  NEGOTIATION: 'bg-amber-500/20 text-amber-500/30 border-amber-500/30',
  WON: 'bg-green-500/20 text-green-300 border-green-500/30',
  LOST: 'bg-red-500/20 text-red-300 border-red-500/30',
};

// Stage title mapping (reused from DealStageColumn)
const STAGE_TITLES: Record<DealStage, string> = {
  NEW: 'New',
  QUALIFIED: 'Qualified',
  PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation',
  WON: 'Won',
  LOST: 'Lost',
};