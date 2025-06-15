// components/NavigationEvents.tsx
'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useLoading } from '@/contexts/loadingContext'
import { Suspense } from 'react'

export function NavigationEventsWrapper() {
  return (
    <Suspense fallback={null}>
      <NavigationEvents />
    </Suspense>
  )
}

function NavigationEvents() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { setIsLoading } = useLoading()

  useEffect(() => {
    const url = pathname + searchParams.toString()
    setIsLoading(false)
    console.log('Route changed to: ', url)
  }, [pathname, searchParams, setIsLoading])

  return null
}