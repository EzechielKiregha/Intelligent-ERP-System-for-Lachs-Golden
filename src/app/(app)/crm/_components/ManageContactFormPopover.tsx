// app/crm/_components/ManageContactFormPopover.tsx
'use client';

import { useState } from 'react';
import BasePopover from '@/components/BasePopover';
import ManageContactForm from '../contacts/_components/ManageContactForm';

interface ManageContactFormPopoverProps {
  children: React.ReactNode;
  contact?: any;
}

export default function ManageContactFormPopover({
  children,
  contact
}: ManageContactFormPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  return (
    <BasePopover
      title={contact ? "Edit Contact" : "Add New Contact"}
      buttonLabel={contact ? "Edit Contact" : "Add Contact"}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <ManageContactForm contact={contact} onSuccess={handleSuccess} />
    </BasePopover>
  );
}