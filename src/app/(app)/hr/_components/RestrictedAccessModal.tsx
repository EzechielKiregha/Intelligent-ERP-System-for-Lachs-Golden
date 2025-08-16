import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface RestrictedAccessModalProps {
  isOpen: boolean;
  desc?: string;
  onClose: () => void;
}

export function RestrictedAccessModal({ isOpen, desc, onClose }: RestrictedAccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-sidebar text-sidebar-foreground border-[var(--sidebar-border)]">
        <DialogHeader>
          <DialogTitle>Access Restricted</DialogTitle>
          <DialogDescription>
            {desc}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}