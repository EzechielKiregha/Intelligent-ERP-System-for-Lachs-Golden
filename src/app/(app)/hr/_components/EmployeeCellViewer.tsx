// components/EmployeeCellViewer.tsx
'use client'

import * as React from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { useReviews } from '@/lib/hooks/hr'
import Link from 'next/link'

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  jobTitle?: string
  hireDate?: string
  status: string
}

export function EmployeeCellViewer({ item }: { item: Employee }) {
  const isMobile = useIsMobile()
  const { data: reviews } = useReviews(item.id)

  const fullName = `${item.firstName} ${item.lastName}`

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild>
        <Button variant="link" className="px-0 text-left hover:text-sidebar-accent">
          {fullName}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="bg-sidebar text-sidebar-foreground border-sidebar-border">
        <DrawerHeader>
          <DrawerTitle>{fullName}</DrawerTitle>
          <DrawerDescription>{item.jobTitle || 'No job title'}</DrawerDescription>
        </DrawerHeader>

        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Avatar + Basic Info */}
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={`https://github.com/shadcn.png`} alt={fullName} />
              <AvatarFallback>{item.firstName[0]}{item.lastName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{fullName}</p>
              <p className="text-sm text-muted-foreground">{item.email}</p>
            </div>
          </div>
          <Separator />

          {/* Static Fields */}
          {[
            ['Status', item.status],
            ['Hire Date', item.hireDate ? format(new Date(item.hireDate), 'yyyy-MM-dd') : '—'],
          ].map(([label, val]) => (
            <div key={label} className="space-y-1">
              <Label className="text-[var(--sidebar-foreground)]">{label}</Label>
              <Input value={val} disabled className="bg-sidebar border-sidebar-border" />
            </div>
          ))}
          <Separator />

          {/* Recent Reviews */}
          <div>
            <p className="font-medium mb-2">Recent Reviews</p>
            {!reviews ? (
              <>
                <h3 className="text-lg font-semibold">Not Reviewed Yet</h3>
                <div className="mt-4 space-y-2 flex flex-row justify-between items-start">
                  <Link href={`/hr/reviews/manage?employeeId=${item.id}`} className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                    Start Reviewing this Employee
                  </Link>
                </div>
              </>
            ) : reviews.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold">Not Reviewed Yet</h3>
                <div className="mt-4 space-y-2 flex flex-row justify-between items-start">
                  <Link href={`/hr/reviews/manage?employeeId=${item.id}`} className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                    Start Reviewing this Employee
                  </Link>
                </div>
              </>
            ) : (
              <ul className="space-y-2">
                {reviews.slice(0, 5).map((r) => (
                  <>
                    <li key={r.id} className="text-sm">
                      <span className="font-medium">{format(new Date(r.reviewDate), 'MMM d, yyyy')}:</span>{' '}
                      {r.rating}
                      <p className="text-xs text-muted-foreground">
                        {r.comments || 'No comments'}
                      </p>
                      <div className="flex flex-row justify-between items-start">
                        <Link href={`/hr/reviews/manage?employeeId=${item.id}`} className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                          Review Employee
                        </Link>
                      </div>
                    </li>
                  </>
                ))}
              </ul>
            )}
          </div>
          <Separator />

          {/* Recent Reviews */}
          <div>
            <p className="font-medium mb-2">Payroll </p>
            {!reviews ? (
              <>
                <h3 className="text-lg font-semibold">No Pay-Check so far</h3>
                <div className="mt-4 space-y-2 flex flex-row justify-between items-start">
                  <Link href={`/hr/payroll/manage?employeeId=${item.id}`} className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                    Pay Employee by generating a Pay-Check
                  </Link>
                </div>
              </>
            ) : reviews.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold">No Pay-Check so far</h3>
                <div className="mt-4 space-y-2 flex flex-row justify-between items-start">
                  <Link href={`/hr/payroll/manage?employeeId=${item.id}`} className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                    Pay Employee by generating a Pay-Check
                  </Link>
                </div>
              </>
            ) : (
              <ul className="space-y-2">
                {reviews.slice(0, 5).map((r) => (
                  <li key={r.id} className="text-sm">
                    <span className="font-medium">{format(new Date(r.reviewDate), 'MMM d, yyyy')}:</span>{' '}
                    {r.rating}
                    <p className="text-xs text-muted-foreground">
                      {r.comments || 'No comments'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="border-sidebar-border hover:bg-sidebar-accent">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
