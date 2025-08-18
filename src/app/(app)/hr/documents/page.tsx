'use client'
import React, { useState } from 'react'
import DocumentFormPopover from '../_components/DocumentFormPopover'
import DocumentManager from '../_components/DocumentManager'
import { useAuth } from 'contents/authContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DocumentsPage() {
  const user = useAuth().user
  const [hasAccess, setHasAccess] = useState(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR' || user?.role === 'ACCOUNTANT')

  return (
    <div className="flex flex-col min-h-full">
      <div className="@container/main flex flex-1 flex-col gap-4">
        <h1 className="text-2xl font-semibold text-sidebar-foreground">Documents</h1>
        <div className="flex gap-2">
          {hasAccess && (
            <>
              <DocumentFormPopover />
              <Link href="/hr/documents/manage">
                <Button className="hover:bg-sidebar-primary bg-sidebar-accent text-sidebar-primary-foreground">
                  Full Manage
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
      <DocumentManager />
    </div>
  )
}
