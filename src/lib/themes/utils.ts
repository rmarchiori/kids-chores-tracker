/**
 * Theme Utility Functions
 *
 * Helper functions for theme operations, class generation,
 * and theme-based logic.
 */

import type { ThemeType, AgeGroup, ThemePreference } from './constants'
import { THEME_AGE_MAP, THEME_METADATA } from './constants'
import { getThemeConfig } from './config'

/**
 * Get theme type from age group (for age-default preference)
 */
export const getThemeFromAge = (ageGroup: AgeGroup): ThemeType => {
  return THEME_AGE_MAP[ageGroup]
}

/**
 * Resolve actual theme from preference and age group
 */
export const resolveTheme = (
  preference: ThemePreference,
  ageGroup: AgeGroup
): ThemeType => {
  if (preference === 'age-default') {
    return getThemeFromAge(ageGroup)
  }
  // If preference is 'parent', use parent theme
  // Otherwise use the specific theme (young/older)
  return preference as ThemeType
}

/**
 * Get Tailwind utility classes for a specific theme
 * These classes are pre-defined in tailwind.config.ts
 */
export const getThemeClasses = (theme: ThemeType) => {
  const baseClasses = {
    young: {
      // Colors
      primary: 'bg-young-primary hover:bg-young-primary-hover text-white',
      success: 'bg-young-success hover:bg-young-success-hover text-white',
      pending: 'bg-young-pending hover:bg-young-pending-hover text-gray-900',
      bg: 'bg-young-bg',
      surface: 'bg-young-surface',
      text: 'text-young-text',
      textSecondary: 'text-young-text-secondary',
      border: 'border-young-border',

      // Typography
      textSize: 'text-young',
      fontWeight: 'font-young',
      lineHeight: 'leading-relaxed',

      // Layout
      borderRadius: 'rounded-young',
      padding: 'p-young-card',
      iconSize: 'w-12 h-12',

      // Interactive
      button: 'min-h-[48px] text-young font-young rounded-young px-6 py-3',
      card: 'bg-young-surface rounded-young p-young-card border border-young-border',
    },
    older: {
      // Colors
      primary: 'bg-older-primary hover:bg-older-primary-hover text-white',
      success: 'bg-older-success hover:bg-older-success-hover text-white',
      pending: 'bg-older-pending hover:bg-older-pending-hover text-gray-900',
      bg: 'bg-older-bg',
      surface: 'bg-older-surface',
      text: 'text-older-text',
      textSecondary: 'text-older-text-secondary',
      border: 'border-older-border',

      // Typography
      textSize: 'text-older',
      fontWeight: 'font-older',
      lineHeight: 'leading-normal',

      // Layout
      borderRadius: 'rounded-older',
      padding: 'p-older-card',
      iconSize: 'w-10 h-10',

      // Interactive
      button: 'min-h-[44px] text-older font-older rounded-older px-5 py-2.5',
      card: 'bg-older-surface rounded-older p-older-card border border-older-border',
    },
    parent: {
      // Colors
      primary: 'bg-parent-primary hover:bg-parent-primary-hover text-white',
      success: 'bg-parent-success hover:bg-parent-success-hover text-white',
      warning: 'bg-parent-warning hover:bg-parent-warning-hover text-gray-900',
      urgent: 'bg-parent-urgent hover:bg-parent-urgent-hover text-white',
      bg: 'bg-parent-bg',
      surface: 'bg-parent-surface',
      text: 'text-parent-text',
      textSecondary: 'text-parent-text-secondary',
      border: 'border-parent-border',

      // Typography
      textSize: 'text-parent',
      fontWeight: 'font-parent',
      lineHeight: 'leading-normal',

      // Layout
      borderRadius: 'rounded-parent',
      padding: 'p-parent-card',
      iconSize: 'w-6 h-6',

      // Interactive
      button: 'min-h-[44px] text-parent font-parent rounded-parent px-4 py-2',
      card: 'bg-parent-surface rounded-parent p-parent-card border border-parent-border',
    },
  }

  return baseClasses[theme]
}

/**
 * Get button classes for a specific theme and variant
 */
export const getButtonClasses = (
  theme: ThemeType,
  variant: 'primary' | 'success' | 'pending' | 'warning' | 'urgent' = 'primary'
): string => {
  const themeClasses = getThemeClasses(theme)
  const baseButton = themeClasses.button
  const variantColor = themeClasses[variant] || themeClasses.primary

  return `${baseButton} ${variantColor} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`
}

/**
 * Get card classes for a specific theme
 */
export const getCardClasses = (theme: ThemeType): string => {
  return getThemeClasses(theme).card
}

/**
 * Get icon size in pixels for a theme
 */
export const getIconSize = (theme: ThemeType): number => {
  const config = getThemeConfig(theme)
  return config.spacing.iconSize
}

/**
 * Get padding value for a theme
 */
export const getPadding = (theme: ThemeType): string => {
  const config = getThemeConfig(theme)
  return config.spacing.cardPadding
}

/**
 * Get border radius for a theme
 */
export const getBorderRadius = (theme: ThemeType): string => {
  const config = getThemeConfig(theme)
  return config.spacing.borderRadius
}

/**
 * Get font size for a theme
 */
export const getFontSize = (theme: ThemeType): string => {
  const config = getThemeConfig(theme)
  return config.typography.fontSize
}

/**
 * Get theme metadata (name, description, icon)
 */
export const getThemeMetadata = (theme: ThemeType) => {
  return THEME_METADATA[theme]
}

/**
 * Check if theme preference is valid for age group
 */
export const isValidThemeForAge = (
  theme: ThemePreference,
  ageGroup: AgeGroup
): boolean => {
  // age-default is always valid
  if (theme === 'age-default') return true

  // parent theme is never valid for children
  if (theme === 'parent') return false

  // young theme valid for 5-8, older theme valid for 9-12
  if (theme === 'young' && ageGroup === '5-8') return true
  if (theme === 'older' && ageGroup === '9-12') return true

  // Allow cross-age theme selection (child can choose any theme)
  return theme === 'young' || theme === 'older'
}

/**
 * Generate theme-aware CSS class string
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}
