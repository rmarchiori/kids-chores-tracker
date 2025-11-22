'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  CogIcon,
  CalendarIcon,
  ChartBarIcon,
  GiftIcon,
  TvIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from '@/hooks/useTranslation'

const mainNavigationItems = [
  { key: 'nav.home', href: '/dashboard', icon: HomeIcon },
  { key: 'nav.today', href: '/daily', icon: ClipboardDocumentListIcon },
  { key: 'nav.children', href: '/children', icon: UsersIcon },
  { key: 'nav.tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
]

const allNavigationItems = [
  { key: 'nav.home', href: '/dashboard', icon: HomeIcon },
  { key: 'nav.family', href: '/family/settings', icon: UsersIcon },
  { key: 'nav.children', href: '/children', icon: UsersIcon },
  { key: 'nav.today', href: '/daily', icon: ClipboardDocumentListIcon },
  { key: 'nav.tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
  { key: 'nav.calendar', href: '/calendar', icon: CalendarIcon },
  { key: 'nav.reviews', href: '/reviews', icon: CheckCircleIcon },
  { key: 'nav.completions', href: '/completions', icon: CheckCircleIcon },
  { key: 'nav.analytics', href: '/analytics', icon: ChartBarIcon },
  { key: 'nav.rewards', href: '/rewards', icon: GiftIcon },
  { key: 'nav.cast', href: '/settings/cast', icon: TvIcon },
  { key: 'nav.settings', href: '/settings', icon: CogIcon },
]

export function BottomNav() {
  const pathname = usePathname()
  const { t, isLoading } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Memoize translated navigation items to prevent flash
  const mainNavigation = useMemo(() => {
    if (isLoading) return []
    return mainNavigationItems.map(item => ({
      ...item,
      name: t(item.key)
    }))
  }, [t, isLoading])

  const allNavigation = useMemo(() => {
    if (isLoading) return []
    return allNavigationItems.map(item => ({
      ...item,
      name: t(item.key)
    }))
  }, [t, isLoading])

  return (
    <>
      {/* Menu Drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-lg font-black text-gray-900">Menu</h2>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close menu"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <nav className="p-4 grid grid-cols-3 gap-3">
              {allNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`
                      flex flex-col items-center justify-center
                      p-4 rounded-2xl border-2
                      transition-all duration-200
                      ${isActive
                        ? 'bg-blue-50 border-blue-600 text-blue-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
                    `}
                  >
                    <Icon className="w-8 h-8 mb-2" />
                    <span className="text-xs font-bold text-center">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around">
          {mainNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center
                  flex-1 py-2 px-1 min-h-[48px]
                  transition-colors duration-200
                  ${isActive ? 'text-blue-600' : 'text-gray-600'}
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            )
          })}

          {/* Menu Button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-2 px-1 min-h-[48px] text-gray-600 hover:text-blue-600 transition-colors duration-200"
            aria-label="Open menu"
          >
            <Bars3Icon className="w-6 h-6" />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </nav>
    </>
  )
}
