"use client";
import CreateCompanyForm from '@/app/(app)/_components/CreateCompanyForm';
import { LeftAuthPanel } from '@/components/LeftAuthPanel';
import { useSearchParams } from 'next/navigation';
import React from 'react';

function CreateCompanyPage() {
  const searchParams = useSearchParams();
  const isOwner = searchParams.get('isOwner') === 'true';
  const fowardUser = searchParams.get('data')
    ? JSON.parse(decodeURIComponent(searchParams.get('data') || ''))
    : null; // Decode and parse the forwarded user data

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0a0e16] px-4 shadow-lg">
      <div className="bg-sidebar shadow-lg rounded-2xl flex flex-col md:flex-row w-full max-w-[900px] md:h-[600px] overflow-hidden">
        <LeftAuthPanel />
        <CreateCompanyForm fowardUser={fowardUser} isOwner={isOwner} />
      </div>
    </div>
  );
}

export default CreateCompanyPage;