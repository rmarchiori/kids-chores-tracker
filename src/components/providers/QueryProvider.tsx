'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default to 5 minutes stale time
            staleTime: 1000 * 60 * 5,
            // Cache for 30 minutes
            gcTime: 1000 * 60 * 30,
            // Retry failed requests once
            retry: 1,
            // Don't refetch on window focus for better UX
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
