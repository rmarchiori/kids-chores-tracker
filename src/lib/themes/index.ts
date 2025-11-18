/**
 * Theme System Entry Point
 *
 * Centralized export for all theme-related functionality
 */

// Types and constants
export {
  THEME_TYPES,
  AGE_GROUPS,
  THEME_PREFERENCES,
  THEME_AGE_MAP,
  THEME_METADATA,
  WCAG_AA_CONTRAST,
  TOUCH_TARGET_MIN,
  type ThemeType,
  type AgeGroup,
  type ThemePreference,
} from './constants'

// Theme configuration
export {
  THEME_CONFIGS,
  getThemeConfig,
  getThemeCSSVariables,
  type ThemeConfig,
} from './config'

// Utilities
export {
  getThemeFromAge,
  resolveTheme,
  getThemeClasses,
  getButtonClasses,
  getCardClasses,
  getIconSize,
  getPadding,
  getBorderRadius,
  getFontSize,
  getThemeMetadata,
  isValidThemeForAge,
  cn,
} from './utils'

// Accessibility
export {
  getRelativeLuminance,
  getContrastRatio,
  meetsWCAGAA,
  validateThemeAccessibility,
  generateAccessibilityReport,
  isDarkColor,
  getRecommendedTextColor,
  type ContrastValidation,
} from './accessibility'
