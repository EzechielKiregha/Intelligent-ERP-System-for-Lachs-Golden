import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface RestrictedAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RestrictedAccessModal({ isOpen, onClose }: RestrictedAccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Access Restricted</DialogTitle>
          <DialogDescription>
            You are not the assignee of this task. Only the assigned user can view or edit this task.
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