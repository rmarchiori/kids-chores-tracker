import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { QueryProvider } from '@/components/providers/QueryProvider'
import dynamic from 'next/dynamic'

// Load VersionBadge only on client to avoid hydration mismatch
const VersionBadge = dynamic(() => import('@/components/VersionBadge').then(mod => ({ default: mod.VersionBadge })), {
  ssr: false
})

export const metadata: Metadata = {
  title: 'Kids Chores Tracker',
  description: 'A family chore management app for parents and children',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-gray-900" suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider>
            {children}
            <VersionBadge />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
