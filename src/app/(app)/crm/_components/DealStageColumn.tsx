// app/crm/_components/DealStageColumn.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, GripVertical } from 'lucide-react';
import { DealStage } from '@/generated/prisma';
import { useEffect, useRef, useState } from 'react';
import { Deal } from '../deals/types/types';

interface DealStageColumnProps {
  stage: DealStage;
  deals: Deal[];
  onStageChange: (dealId: string, newStage: DealStage) => void;
}

// Stage color mapping
const STAGE_COLORS: Record<DealStage, string> = {
  NEW: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  QUALIFIED: 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30',
  PROPOSAL: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  NEGOTIATION: 'bg-amber-500/20 text-amber-500/30 border-amber-500/30',
  WON: 'bg-green-500/20 text-green-700 border-green-500/30',
  LOST: 'bg-red-500/20 text-red-700 border-red-500/30',
};

// Stage title mapping
const STAGE_TITLES: Record<DealStage, string> = {
  NEW: 'New',
  QUALIFIED: 'Qualified',
  PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation',
  WON: 'Won',
  LOST: 'Lost',
};

// Calculate total value for a stage
const calculateStageValue = (deals: Deal[]) => {
  return deals.reduce((sum, deal) => sum + deal.amount, 0);
};

export default function DealStageColumn({
  stage,
  deals,
  onStageChange
}: DealStageColumnProps) {
  const stageValue = calculateStageValue(deals);
  const columnRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Drag state management
  const dragItemIndex = useRef<number | null>(null);
  const dragItemStage = useRef<DealStage | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);
  const isDragging = useRef(false);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, index: number, dealId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    // Store deal ID in drag data
    e.dataTransfer.setData('dealId', dealId);

    dragItemIndex.current = index;
    dragItemStage.current = stage;
    isDragging.current = true;

    // Add dragging class for visual feedback
    setTimeout(() => {
      const target = e.target as HTMLElement;
      target.closest('.deal-card')?.classList.add('opacity-50');
    }, 0);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingOver(true);
  };

  // Handle drag enter
  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverItemIndex.current = index;
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    // Reset drag over state if leaving column
    const column = columnRef.current;
    if (column && !column.contains(e.relatedTarget as Node)) {
      dragOverItemIndex.current = null;
    }
  };

  // Handle drop on COLUMN (for cross-column drops)
  const handleColumnDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    // Get deal ID from drag data
    const dealId = e.dataTransfer.getData('dealId');
    if (!dealId) {
      isDragging.current = false;
      return;
    }

    // If dropping within the same stage, ignore (or handle reordering if implemented)
    if (dragItemStage.current === stage) {
      isDragging.current = false;
      return;
    }

    // Call parent to handle stage change
    onStageChange(dealId, stage);

    // Reset drag state
    isDragging.current = false;
  };

  // Reset drag state on mouse up (catch stray drags)
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        dragItemIndex.current = null;
        dragItemStage.current = null;
        dragOverItemIndex.current = null;
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <Card
      ref={columnRef}
      className={`bg-sidebar border ${STAGE_COLORS[stage]} ${isDraggingOver ? 'ring-2 ring-sidebar-accent' : ''
        }`}
      onDrop={handleColumnDrop}
      onDragOver={handleDragOver}
      onDragEnter={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold text-sidebar-foreground truncate">
            {STAGE_TITLES[stage]}
          </CardTitle>
          <Badge className={`px-2 py-0 h-5 ${STAGE_COLORS[stage]} whitespace-nowrap`}>
            {deals.length} deal{deals.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <div className="text-sm mt-1 flex items-center text-sidebar-foreground/80">
          <DollarSign className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{stageValue.toLocaleString()}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Responsive deal list with vertical scroll */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 -mr-1 scrollbar-thin scrollbar-thumb-sidebar-accent/50 scrollbar-track-transparent">
          {deals.length === 0 ? (
            <div className="text-center py-4 text-sidebar-foreground/50 text-sm">
              No deals
            </div>
          ) : (
            deals.map((deal, index) => (
              <div
                key={deal.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index, deal.id)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                className={`p-3 bg-sidebar-accent/10 rounded border border-sidebar-accent/20 cursor-move hover:border-sidebar-accent/50 transition-colors deal-card ${(dragItemIndex.current === index && dragItemStage.current === stage)
                  ? 'opacity-50'
                  : ''
                  }`}
              >
                <div className="flex items-start">
                  <GripVertical className="h-4 w-4 text-sidebar-foreground/50 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sidebar-foreground line-clamp-2 break-words">
                      {deal.title}
                    </h3>
                    <div className="mt-1 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                      <span className="text-sm text-sidebar-foreground/80 flex items-center">
                        <DollarSign className="h-3 w-3 mr-0.5 flex-shrink-0" />
                        {deal.amount.toLocaleString()}
                      </span>
                      <span className="text-xs bg-sidebar-accent/20 text-sidebar-accent-foreground px-2 py-0.5 rounded truncate max-w-full">
                        {deal.contact?.fullName?.split(' ')[0] || 'Contact'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}