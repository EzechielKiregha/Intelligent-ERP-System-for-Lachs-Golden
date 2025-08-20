// app/crm/deals/_components/DealFormPopover.tsx
'use client';

import { useState } from 'react';
import BasePopover from '@/components/BasePopover';
import DealForm from './DealForm';

interface DealFormPopoverProps {
  children: React.ReactNode;
  contactId?: string; // Optional: Pre-select contact when coming from contact page
  label?: string
}

export default function DealFormPopover({
  children,
  contactId,
  label
}: DealFormPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    // Optional: Refresh parent data
    // You could pass a refresh function via props if needed
  };

  return (
    <BasePopover
      title="Create New Deal"
      buttonLabel={label ? label : "Add Deal"}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <DealForm
        onSuccess={handleSuccess}
      // contactId={contactId}
      />
    </BasePopover>
  );
}