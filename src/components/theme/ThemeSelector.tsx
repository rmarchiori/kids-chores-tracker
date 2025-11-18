'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeFromAge, getThemeMetadata, type ThemeType, type AgeGroup, type ThemePreference } from '@/lib/themes'
import { useTranslation } from '@/hooks/useTranslation'

interface ThemeSelectorProps {
  ageGroup: AgeGroup
  currentPreference: ThemePreference
  onSave: (preference: ThemePreference) => Promise<void>
  showParentTheme?: boolean
}

/**
 * ThemeSelector - Enhanced theme preference selection component
 *
 * Features:
 * - Visual preview of each theme
 * - Age-appropriate theme recommendations
 * - Accessible radio group with keyboard navigation
 * - Loading states and error handling
 * - Responsive grid layout
 *
 * @param ageGroup - Child's age group for age-default theme selection
 * @param currentPreference - Currently selected theme preference
 * @param onSave - Async function to persist theme preference
 * @param showParentTheme - Whether to show parent theme option (default: false)
 */
export function ThemeSelector({
  ageGroup,
  currentPreference,
  onSave,
  showParentTheme = false,
}: ThemeSelectorProps) {
  const { setTheme } = useTheme()
  const { t } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleThemeChange = async (newTheme: ThemePreference) => {
    if (newTheme === currentPreference) return

    setSaving(true)
    setError(null)

    try {
      await onSave(newTheme)

      // Apply theme immediately
      if (newTheme === 'age-default') {
        setTheme(getThemeFromAge(ageGroup))
      } else {
        setTheme(newTheme as ThemeType)
      }
    } catch (err) {
      console.error('Failed to save theme preference:', err)
      setError(t('errors.theme_save_failed') || 'Failed to save theme preference. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const themes: Array<{ value: ThemePreference; label: string; description: string }> = [
    {
      value: 'age-default',
      label: t('theme.auto') || 'Auto',
      description: t('theme.age_based') || 'Based on age',
    },
    {
      value: 'young',
      label: getThemeMetadata('young').name,
      description: getThemeMetadata('young').description,
    },
    {
      value: 'older',
      label: getThemeMetadata('older').name,
      description: getThemeMetadata('older').description,
    },
  ]

  if (showParentTheme) {
    themes.push({
      value: 'parent',
      label: getThemeMetadata('parent').name,
      description: getThemeMetadata('parent').description,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          id="theme-preference-label"
          className="block text-base font-semibold text-themed mb-1"
        >
          {t('settings.theme_preference') || 'Theme Preference'}
        </label>
        <p className="text-sm text-themed-secondary">
          {t('settings.theme_description') || 'Choose how your app looks'}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-labelledby="theme-preference-label"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {themes.map((themeOption) => {
          const isSelected = currentPreference === themeOption.value
          const themeIcon = themeOption.value === 'age-default'
            ? '🔄'
            : getThemeMetadata(
                themeOption.value === 'young' ? 'young' :
                themeOption.value === 'older' ? 'older' : 'parent'
              ).icon

          return (
            <button
              key={themeOption.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${themeOption.label} - ${themeOption.description}`}
              onClick={() => handleThemeChange(themeOption.value)}
              disabled={saving}
              className={`
                min-h-[80px] p-4 rounded-lg border-2 transition-all
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isSelected
                  ? 'border-themed-primary bg-themed-surface ring-2 ring-themed-primary ring-opacity-20'
                  : 'border-themed-border hover:border-gray-400 bg-white'}
                ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                touch-target
              `}
            >
              <div className="flex flex-col items-center text-center space-y-1">
                <div className="text-3xl mb-1" aria-hidden="true">
                  {themeIcon}
                </div>
                <div className="text-sm font-semibold text-themed">
                  {themeOption.label}
                </div>
                <div className="text-xs text-themed-secondary">
                  {themeOption.description}
                </div>
                {isSelected && (
                  <div className="text-xs text-themed-primary font-medium mt-1">
                    ✓ {t('theme.active') || 'Active'}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Screen reader status announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {saving && (t('theme.saving') || 'Saving theme preference...')}
        {error && error}
        {!saving && !error && currentPreference && (
          t('theme.saved') || 'Theme preference saved successfully'
        )}
      </div>

      {/* Visual error message */}
      {error && (
        <div
          className="text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Success feedback */}
      {!error && !saving && (
        <div className="text-sm text-themed-secondary text-center">
          {t('theme.changes_immediate') || 'Changes apply immediately'}
        </div>
      )}
    </div>
  )
}
