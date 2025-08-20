// app/crm/contacts/manage/_components/CommunicationLogFormPopover.tsx
'use client';

import { useState } from 'react';
import BasePopover from '@/components/BasePopover';
import CommunicationLogForm from './CommunicationLogForm';

interface CommunicationLogFormPopoverProps {
  children: React.ReactNode;
  contactId: string;
}

export default function CommunicationLogFormPopover({
  children,
  contactId
}: CommunicationLogFormPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  return (
    <BasePopover
      title="Log Communication"
      buttonLabel="Log Communication"
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <CommunicationLogForm contactId={contactId} onSuccess={handleSuccess} />
    </BasePopover>
  );
}