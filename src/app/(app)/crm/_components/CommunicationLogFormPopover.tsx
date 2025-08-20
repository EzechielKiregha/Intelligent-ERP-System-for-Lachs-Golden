// app/crm/_components/CommunicationLogFormPopover.tsx
'use client';

import { useState } from 'react';
import BasePopover from '@/components/BasePopover';
import CommunicationLogForm from '../contacts/manage/_components/CommunicationLogForm';

interface CommunicationLogFormPopoverProps {
  children: React.ReactNode;
  contactId?: string; // Optional: Pre-select contact
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
      title={contactId ? "Log Communication for Contact" : "Log Communication"}
      buttonLabel={contactId ? "Log Communication" : "Log Communication"}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <CommunicationLogForm
        contactId={contactId}
        onSuccess={handleSuccess}
      />
    </BasePopover>
  );
}