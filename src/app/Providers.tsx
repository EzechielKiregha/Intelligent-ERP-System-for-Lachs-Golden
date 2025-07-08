'use client'

import { HeroUIProvider } from '@heroui/react'
import { ThemeProvider } from "@/components/theme-provider"
import LoadingSpinner from '@/components/LoadingSpinner'
import { useLoading } from '@/contexts/loadingContext'
import { NavigationEventsWrapper } from '@/components/NavigationEvents';
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from 'contents/authContext'
import QueryProviders from '@/components/providers/query-provider'
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from 'sonner'

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
          <QueryProviders>
            <NuqsAdapter>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {isLoading && <LoadingSpinner />}
                {children}
                <NavigationEventsWrapper />
              </ThemeProvider>
            </NuqsAdapter>
            <Toaster />
          </QueryProviders>
        </HeroUIProvider>
      </AuthProvider>
    </SessionProvider>
  )
}