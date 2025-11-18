'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeFromAge } from '@/lib/theme-utils'
import type { ThemeType, AgeGroup } from '@/lib/theme-utils'
import { useTranslation } from '@/hooks/useTranslation'

interface ThemeSwitcherProps {
  ageGroup: AgeGroup
  currentPreference: 'age-default' | ThemeType
  onSave: (preference: 'age-default' | ThemeType) => Promise<void>
}

/**
 * ThemeSwitcher - Theme preference selection component
 *
 * Allows users to choose between age-based automatic theming or
 * manual theme selection. Includes error handling and accessibility.
 *
 * @param ageGroup - Child's age group for age-default theme selection
 * @param currentPreference - Currently selected theme preference
 * @param onSave - Async function to persist theme preference
 */
export function ThemeSwitcher({
  ageGroup,
  currentPreference,
  onSave
}: ThemeSwitcherProps) {
  const { setTheme } = useTheme()
  const { t } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleThemeChange = async (newTheme: 'age-default' | ThemeType) => {
    setSaving(true)
    setError(null)

    try {
      await onSave(newTheme)

      // Apply theme immediately
      if (newTheme === 'age-default') {
        setTheme(getThemeFromAge(ageGroup))
      } else {
        setTheme(newTheme)
      }
    } catch (error) {
      console.error('Failed to save theme preference:', error)
      setError('Failed to save theme preference. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      <label
        id="theme-preference-label"
        className="block text-sm font-medium text-gray-700"
      >
        {t('settings.theme_preference')}
      </label>

      <div
        role="radiogroup"
        aria-labelledby="theme-preference-label"
        className="grid grid-cols-1 sm:grid-cols-3 gap-2"
      >
        <button
          role="radio"
          aria-checked={currentPreference === 'age-default'}
          aria-label={`${t('theme.auto')} - ${t('theme.age_based')}`}
          onClick={() => handleThemeChange('age-default')}
          disabled={saving}
          className={`
            min-h-[48px]
            p-3 rounded-lg border-2 transition-all
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${currentPreference === 'age-default'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'}
            ${saving ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="text-sm font-medium">{t('theme.auto')}</div>
          <div className="text-xs text-gray-500">{t('theme.age_based')}</div>
        </button>

        <button
          role="radio"
          aria-checked={currentPreference === 'young'}
          aria-label={`${t('theme.bright')} - ${t('theme.young_style')}`}
          onClick={() => handleThemeChange('young')}
          disabled={saving}
          className={`
            min-h-[48px]
            p-3 rounded-lg border-2 transition-all
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${currentPreference === 'young'
              ? 'border-young-primary bg-young-bg'
              : 'border-gray-300 hover:border-gray-400'}
            ${saving ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="text-sm font-medium">{t('theme.bright')}</div>
          <div className="text-xs text-gray-500">{t('theme.young_style')}</div>
        </button>

        <button
          role="radio"
          aria-checked={currentPreference === 'older'}
          aria-label={`${t('theme.cool')} - ${t('theme.older_style')}`}
          onClick={() => handleThemeChange('older')}
          disabled={saving}
          className={`
            min-h-[48px]
            p-3 rounded-lg border-2 transition-all
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${currentPreference === 'older'
              ? 'border-older-primary bg-older-bg'
              : 'border-gray-300 hover:border-gray-400'}
            ${saving ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="text-sm font-medium">{t('theme.cool')}</div>
          <div className="text-xs text-gray-500">{t('theme.older_style')}</div>
        </button>
      </div>

      {/* Screen reader status announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {saving && 'Saving theme preference...'}
        {error && error}
      </div>

      {/* Visual error message */}
      {error && (
        <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded border border-red-200">
          {error}
        </div>
      )}
    </div>
  )
}
