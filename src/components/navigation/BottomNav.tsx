'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from '@/hooks/useTranslation'

const navigation = [
  { name: 'nav.home', href: '/dashboard', icon: HomeIcon },
  { name: 'nav.children', href: '/children', icon: UsersIcon },
  { name: 'nav.tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'nav.completions', href: '/completions', icon: CheckCircleIcon },
  { name: 'nav.settings', href: '/settings', icon: CogIcon },
]

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useTranslation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
      <div className="flex justify-around">
        {navigation.map((item) => {
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
      </div>
    </nav>
  )
}
