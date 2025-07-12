import CreateCompanyForm from '@/app/(app)/_components/CreateCompanyForm'
import { LeftAuthPanel } from '@/components/LeftAuthPanel'
import { useSearchParams } from 'next/navigation'
import React from 'react'

function CreateCompanyPage() {

  const searchParams = useSearchParams();
  const isOwner = searchParams.get('isOwner') === 'true';
  const fowardUser = searchParams.get('fowardUser') ? searchParams.get('fowardUser') : null; // Parse the fowardUser from search params if it exists 

  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent px-4 shadow-lg">
      <div className="bg-white dark:bg-[#111827] shadow-lg rounded-2xl flex flex-col md:flex-row w-full max-w-[900px] md:h-[600px] overflow-hidden">
        <LeftAuthPanel />
        <CreateCompanyForm fowardUser={fowardUser} isOwner={isOwner} />
      </div>
    </div>
  )
}

export default CreateCompanyPage