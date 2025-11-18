/**
 * Theme Constants
 *
 * Centralized theme type definitions and constants
 */

export const THEME_TYPES = ['young', 'older', 'parent'] as const
export const AGE_GROUPS = ['5-8', '9-12'] as const
export const THEME_PREFERENCES = ['age-default', 'young', 'older'] as const

export type ThemeType = typeof THEME_TYPES[number]
export type AgeGroup = typeof AGE_GROUPS[number]
export type ThemePreference = typeof THEME_PREFERENCES[number] | 'parent'

/**
 * Theme-to-age group mapping
 */
export const THEME_AGE_MAP: Record<AgeGroup, ThemeType> = {
  '5-8': 'young',
  '9-12': 'older',
}

/**
 * Theme display metadata
 */
export const THEME_METADATA = {
  young: {
    name: 'Bright & Playful',
    description: 'Large text, vibrant colors, rounded shapes',
    ageRange: '5-8 years',
    icon: '🌈',
  },
  older: {
    name: 'Cool & Mature',
    description: 'Modern design, balanced colors',
    ageRange: '9-12 years',
    icon: '🎯',
  },
  parent: {
    name: 'Professional',
    description: 'Clean interface, information-dense',
    ageRange: 'Adults',
    icon: '👔',
  },
} as const

/**
 * Minimum contrast ratios for WCAG AA compliance
 */
export const WCAG_AA_CONTRAST = {
  normalText: 4.5,
  largeText: 3.0,
  uiComponents: 3.0,
} as const

/**
 * Touch target minimum sizes (in pixels)
 */
export const TOUCH_TARGET_MIN = {
  mobile: 48,
  desktop: 44,
} as const
