'use client'

import { useState } from 'react'
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

const mainNavigation = [
  { name: 'nav.home', href: '/dashboard', icon: HomeIcon },
  { name: 'nav.today', href: '/daily', icon: ClipboardDocumentListIcon },
  { name: 'nav.children', href: '/children', icon: UsersIcon },
  { name: 'nav.tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
]

const allNavigation = [
  { name: 'nav.home', href: '/dashboard', icon: HomeIcon },
  { name: 'nav.family', href: '/family/settings', icon: UsersIcon },
  { name: 'nav.children', href: '/children', icon: UsersIcon },
  { name: 'nav.today', href: '/daily', icon: ClipboardDocumentListIcon },
  { name: 'nav.tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'nav.calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'nav.reviews', href: '/reviews', icon: CheckCircleIcon },
  { name: 'nav.completions', href: '/completions', icon: CheckCircleIcon },
  { name: 'nav.analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'nav.rewards', href: '/rewards', icon: GiftIcon },
  { name: 'nav.cast', href: '/settings/cast', icon: TvIcon },
  { name: 'nav.settings', href: '/settings', icon: CogIcon },
]

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)

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
                    key={item.name}
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
                    <span className="text-xs font-bold text-center">{t(item.name)}</span>
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
                key={item.name}
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
                <span className="text-xs mt-1">{t(item.name)}</span>
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
