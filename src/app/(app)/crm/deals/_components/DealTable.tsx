// app/crm/deals/_components/DealTable.tsx
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDeleteDeal } from '@/lib/hooks/crm';
import { toast } from 'sonner';
import { DealStage } from '@/generated/prisma';
import { Deal } from '../types/types';

interface DealTableProps {
  deals: Deal[];
}

// Stage color mapping
const STAGE_COLORS: Record<DealStage, string> = {
  NEW: 'bg-blue-500/20 text-blue-300',
  QUALIFIED: 'bg-cyan-500/20 text-cyan-300',
  PROPOSAL: 'bg-emerald-500/20 text-emerald-300',
  NEGOTIATION: 'bg-amber-500/20 text-amber-300',
  WON: 'bg-green-500/20 text-green-300',
  LOST: 'bg-red-500/20 text-red-300',
};

export default function DealTable({ deals }: DealTableProps) {
  const router = useRouter();
  const deleteDeal = useDeleteDeal();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this deal?')) {
      deleteDeal.mutate(id, {
        onSuccess: () => {
          toast.success('Deal deleted successfully');
        },
        onError: () => {
          toast.error('Failed to delete deal');
        },
      });
    }
  };

  const handleView = (id: string) => {
    router.push(`/crm/deals/manage/${id}`);
  };

  return (
    <div className="rounded-md border border-[var(--sidebar-border)]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-sidebar-accent/50">
            <TableHead className="text-sidebar-foreground">Title</TableHead>
            <TableHead className="text-sidebar-foreground">Amount</TableHead>
            <TableHead className="text-sidebar-foreground">Stage</TableHead>
            <TableHead className="text-sidebar-foreground">Contact</TableHead>
            <TableHead className="text-sidebar-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-sidebar-foreground/70">
                No deals found
              </TableCell>
            </TableRow>
          ) : (
            deals.map((deal) => (
              <TableRow
                key={deal.id}
                className="hover:bg-sidebar-accent/50 cursor-pointer"
                onClick={() => handleView(deal.id)}
              >
                <TableCell className="font-medium text-sidebar-foreground">
                  {deal.title}
                </TableCell>
                <TableCell className="text-sidebar-foreground/80">
                  <div className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {deal.amount.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={STAGE_COLORS[deal.stage]}>
                    {deal.stage}
                  </Badge>
                </TableCell>
                <TableCell className="text-sidebar-foreground/80">
                  {deal.contact?.fullName || 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(deal.id);
                    }}
                    className="hover:text-sidebar-foreground"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/crm/deals/manage/${deal.id}`);
                    }}
                    className="hover:text-sidebar-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(deal.id, e)}
                    className="hover:text-red-400"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}