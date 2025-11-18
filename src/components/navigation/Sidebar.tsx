'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from '@/hooks/useTranslation'
import { useSidebar } from '@/contexts/SidebarContext'

const navigation = [
  { name: 'nav.dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'nav.children', href: '/children', icon: UsersIcon },
  { name: 'nav.tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'nav.reports', href: '/dashboard/reports', icon: ChartBarIcon },
  { name: 'nav.settings', href: '/dashboard/settings', icon: CogIcon },
]

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar()
  const pathname = usePathname()
  const { t } = useTranslation()

  return (
    <aside
      className={`
        hidden md:flex md:flex-col
        fixed inset-y-0 left-0
        bg-white border-r border-gray-200
        transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
        z-30
      `}
    >
      {/* Logo/Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gray-900">{t('app.title')}</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 rounded-lg
                transition-colors duration-200
                ${isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'}
                ${collapsed ? 'justify-center' : 'justify-start'}
              `}
              title={collapsed ? t(item.name) : undefined}
            >
              <Icon className="w-6 h-6 flex-shrink-0" />
              {!collapsed && (
                <span className="ml-3 text-sm font-medium">{t(item.name)}</span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
