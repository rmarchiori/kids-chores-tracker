'use client'

import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { useTranslation } from '@/hooks/useTranslation'
import Link from 'next/link'

export default function SettingsPage() {
  const { t } = useTranslation()

  const settingsOptions = [
    {
      icon: '📺',
      title: t('settings.cast.title'),
      description: t('settings.cast.description'),
      href: '/settings/cast',
    },
    {
      icon: '👨‍👩‍👧‍👦',
      title: t('settings.family.title'),
      description: t('settings.family.description'),
      href: '/family/settings',
    },
  ]

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">{t('settings.title')}</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {settingsOptions.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{option.icon}</div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {option.title}
                  </h2>
                  <p className="text-gray-600">{option.description}</p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
