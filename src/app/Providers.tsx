// app/Providers.tsx
'use client'

import { HeroUIProvider } from '@heroui/react'
import { ThemeProvider } from "@/components/theme-provider"
import LoadingSpinner from '@/components/LoadingSpinner'
import { useLoading } from '@/contexts/loadingContext'
import { NavigationEventsWrapper } from '@/components/NavigationEvents';
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from 'contents/authContext'

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {

  const { isLoading } = useLoading()

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <SessionProvider>
      <AuthProvider>
        <HeroUIProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryClientProvider client={queryClient}>
              {isLoading && <LoadingSpinner />}
              {children}
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
            <NavigationEventsWrapper />
          </ThemeProvider>

        </HeroUIProvider>
      </AuthProvider>
    </SessionProvider>
  )
}