import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { VersionBadge } from '@/components/VersionBadge'

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
    <html lang="en" data-theme="parent">
      <body className="bg-white text-gray-900">
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
