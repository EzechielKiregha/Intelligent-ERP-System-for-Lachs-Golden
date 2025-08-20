// app/crm/_components/ActivityLogTable.tsx
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Video, MessageSquare, Clock, User, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { CommunicationLog } from '@/lib/hooks/crm';

interface ActivityLogTableProps {
  logs: CommunicationLog[];
  isLoading?: boolean;
}

// Map communication type to icon and color
const getLogIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'email': return <Mail className="h-4 w-4" />;
    case 'call': return <Phone className="h-4 w-4" />;
    case 'meeting': return <Video className="h-4 w-4" />;
    default: return <MessageSquare className="h-4 w-4" />;
  }
};

const getLogColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'email': return 'text-blue-400';
    case 'call': return 'text-green-400';
    case 'meeting': return 'text-purple-400';
    default: return 'text-sidebar-foreground/70';
  }
};

export default function ActivityLogTable({ logs, isLoading }: ActivityLogTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sidebar-accent"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-sidebar-foreground/70">
        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No activity logged yet</p>
        <p className="text-sm mt-1">Start tracking your interactions with contacts</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[var(--sidebar-border)]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-sidebar-accent/50">
            <TableHead className="text-sidebar-foreground">Type</TableHead>
            <TableHead className="text-sidebar-foreground">Contact</TableHead>
            <TableHead className="text-sidebar-foreground">Details</TableHead>
            <TableHead className="text-sidebar-foreground">Deal</TableHead>
            <TableHead className="text-sidebar-foreground text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map(log => (
            <TableRow key={log.id} className="hover:bg-sidebar-accent/50">
              <TableCell>
                <div className={`flex items-center ${getLogColor(log.type)}`}>
                  {getLogIcon(log.type)}
                  <span className="ml-2 text-sidebar-foreground/80 capitalize">
                    {log.type} {log.direction && `(${log.direction})`}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sidebar-foreground/80">
                {log.contact?.fullName || 'N/A'}
              </TableCell>
              <TableCell className="text-sidebar-foreground/80 line-clamp-1">
                {log.message || 'No details provided'}
              </TableCell>
              <TableCell className="text-sidebar-foreground/80">
                {log.deal?.title ? (
                  <span className="flex items-center">
                    {log.deal.title}
                    <ArrowRight className="h-3 w-3 mx-1 text-sidebar-foreground/50" />
                    <Badge variant="outline" className={getStageBadgeColor(log.deal.stage)}>
                      {log.deal.stage}
                    </Badge>
                  </span>
                ) : 'N/A'}
              </TableCell>
              <TableCell className="text-right text-sidebar-foreground/60">
                <div className="flex items-center justify-end">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Helper: Get badge color for deal stage
function getStageBadgeColor(stage: string): string {
  switch (stage) {
    case 'NEW': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'QUALIFIED': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    case 'PROPOSAL': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'NEGOTIATION': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'WON': return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'LOST': return 'bg-red-500/20 text-red-300 border-red-500/30';
    default: return 'bg-sidebar-accent/20 text-sidebar-accent-foreground border-sidebar-accent/30';
  }
}