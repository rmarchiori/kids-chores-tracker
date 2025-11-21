'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { getClientLocale } from '@/lib/i18n'

export default function TestTranslationsPage() {
  const { t, locale, isLoading } = useTranslation()

  // Get locale directly from cookie for comparison
  const directLocale = typeof window !== 'undefined' ? getClientLocale() : 'unknown'
  const cookieValue = typeof document !== 'undefined'
    ? document.cookie.split(';').find(c => c.trim().startsWith('NEXT_LOCALE='))?.split('=')[1]
    : 'no-cookie'

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Translation System Test</h1>

      <div className="space-y-4 mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-bold">Debug Info:</h2>
        <p><strong>Hook Locale:</strong> {locale}</p>
        <p><strong>Direct Locale (from cookie):</strong> {directLocale}</p>
        <p><strong>Cookie Value:</strong> {cookieValue}</p>
        <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
      </div>

      <div className="space-y-4 p-4 bg-blue-50 rounded">
        <h2 className="text-xl font-bold mb-4">Translation Tests:</h2>

        <div className="space-y-2">
          <p><strong>Test 1 - Simple key:</strong></p>
          <p className="pl-4">t('app.title') = {t('app.title')}</p>

          <p><strong>Test 2 - Nested key:</strong></p>
          <p className="pl-4">t('analytics.title') = {t('analytics.title')}</p>

          <p><strong>Test 3 - Deep nested key:</strong></p>
          <p className="pl-4">t('analytics.stats.total_completions') = {t('analytics.stats.total_completions')}</p>

          <p><strong>Test 4 - Cast key:</strong></p>
          <p className="pl-4">t('cast.dashboard') = {t('cast.dashboard')}</p>

          <p><strong>Test 5 - Missing key (should show key):</strong></p>
          <p className="pl-4">t('this.key.does.not.exist') = {t('this.key.does.not.exist')}</p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h2 className="text-xl font-bold mb-4">Expected Results:</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Test 1 should show: "Kids Chores Tracker"</li>
          <li>Test 2 should show: "Analytics Dashboard"</li>
          <li>Test 3 should show: "Total Completions"</li>
          <li>Test 4 should show: "Dashboard"</li>
          <li>Test 5 should show: "this.key.does.not.exist"</li>
        </ul>
      </div>

      <div className="mt-8 p-4 bg-green-50 rounded">
        <h2 className="text-xl font-bold mb-4">Change Language Test:</h2>
        <p className="mb-4">Click a button to change language and reload:</p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              document.cookie = 'NEXT_LOCALE=en-CA; path=/; max-age=31536000'
              window.location.reload()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            English
          </button>
          <button
            onClick={() => {
              document.cookie = 'NEXT_LOCALE=pt-BR; path=/; max-age=31536000'
              window.location.reload()
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Português
          </button>
          <button
            onClick={() => {
              document.cookie = 'NEXT_LOCALE=fr-CA; path=/; max-age=31536000'
              window.location.reload()
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Français
          </button>
        </div>
      </div>
    </div>
  )
}
