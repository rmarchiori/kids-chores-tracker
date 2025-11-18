export type ThemeType = 'young' | 'older' | 'parent'
export type AgeGroup = '5-8' | '9-12'

/**
 * Get theme type based on child's age group
 */
export const getThemeFromAge = (ageGroup: AgeGroup): ThemeType => {
  return ageGroup === '5-8' ? 'young' : 'older'
}

/**
 * Get Tailwind classes for a specific theme
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
      lineHeight: 'leading-relaxed', // 1.6

      // Layout
      borderRadius: 'rounded-young',
      padding: 'p-young-card',
      iconSize: 'w-12 h-12',
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
      lineHeight: 'leading-normal', // 1.5

      // Layout
      borderRadius: 'rounded-older',
      padding: 'p-older-card',
      iconSize: 'w-10 h-10',
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
      lineHeight: 'leading-normal', // 1.5

      // Layout
      borderRadius: 'rounded-parent',
      padding: 'p-parent-card',
      iconSize: 'w-6 h-6',
    },
  }

  return baseClasses[theme]
}

/**
 * Get icon size in pixels for a theme
 */
export const getIconSize = (theme: ThemeType): number => {
  const sizes: Record<ThemeType, number> = {
    young: 48,
    older: 40,
    parent: 24,
  }
  return sizes[theme]
}

/**
 * Get padding value for a theme
 */
export const getPadding = (theme: ThemeType): string => {
  const padding: Record<ThemeType, string> = {
    young: '24px',
    older: '20px',
    parent: '16px',
  }
  return padding[theme]
}
