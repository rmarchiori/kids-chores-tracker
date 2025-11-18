'use client'

import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const { collapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area with dynamic padding */}
      <div
        className={`
          flex flex-col min-h-screen
          transition-all duration-300
          ${collapsed ? 'md:pl-16' : 'md:pl-64'}
        `}
      >
        {/* Main content with padding for bottom nav on mobile */}
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  )
}
