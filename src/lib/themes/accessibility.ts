/**
 * Accessibility Validation Utilities
 *
 * WCAG AA compliance validation for color contrast ratios
 */

import { WCAG_AA_CONTRAST } from './constants'

/**
 * Calculate relative luminance of a color (0-1 scale)
 * Based on WCAG 2.1 specification
 */
export const getRelativeLuminance = (hexColor: string): number => {
  // Remove # if present
  const hex = hexColor.replace('#', '')

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  // Apply gamma correction
  const gammaCorrect = (value: number) => {
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
  }

  const rLinear = gammaCorrect(r)
  const gLinear = gammaCorrect(g)
  const bLinear = gammaCorrect(b)

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
}

/**
 * Calculate contrast ratio between two colors
 * Returns ratio in range 1-21
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getRelativeLuminance(color1)
  const lum2 = getRelativeLuminance(color2)

  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export const meetsWCAGAA = (
  foreground: string,
  background: string,
  type: 'normalText' | 'largeText' | 'uiComponents' = 'normalText'
): boolean => {
  const ratio = getContrastRatio(foreground, background)
  const requiredRatio = WCAG_AA_CONTRAST[type]

  return ratio >= requiredRatio
}

/**
 * Validate all text/background combinations for a color palette
 */
export interface ContrastValidation {
  combination: string
  ratio: number
  passes: boolean
  required: number
}

export const validateThemeAccessibility = (colors: {
  primary: string
  success: string
  pending: string
  urgent?: string
  background: string
  surface: string
  text: string
}): ContrastValidation[] => {
  const validations: ContrastValidation[] = []

  // Text on backgrounds
  const textBackgroundCombos = [
    { fg: colors.text, bg: colors.background, name: 'Text on Background' },
    { fg: colors.text, bg: colors.surface, name: 'Text on Surface' },
  ]

  // White text on color backgrounds (buttons)
  const buttonCombos = [
    { fg: '#FFFFFF', bg: colors.primary, name: 'White on Primary' },
    { fg: '#FFFFFF', bg: colors.success, name: 'White on Success' },
  ]

  // Dark text on warning (if applicable)
  if (colors.pending) {
    buttonCombos.push({
      fg: colors.text,
      bg: colors.pending,
      name: 'Dark Text on Pending',
    })
  }

  const allCombos = [...textBackgroundCombos, ...buttonCombos]

  allCombos.forEach(({ fg, bg, name }) => {
    const ratio = getContrastRatio(fg, bg)
    const passes = ratio >= WCAG_AA_CONTRAST.normalText

    validations.push({
      combination: name,
      ratio: Math.round(ratio * 100) / 100,
      passes,
      required: WCAG_AA_CONTRAST.normalText,
    })
  })

  return validations
}

/**
 * Generate accessibility report for all themes
 */
export const generateAccessibilityReport = (
  themeConfigs: Record<
    string,
    {
      colors: {
        primary: string
        success: string
        pending: string
        urgent?: string
        background: string
        surface: string
        text: string
      }
    }
  >
): Record<string, ContrastValidation[]> => {
  const report: Record<string, ContrastValidation[]> = {}

  Object.entries(themeConfigs).forEach(([themeName, config]) => {
    report[themeName] = validateThemeAccessibility(config.colors)
  })

  return report
}

/**
 * Check if a color is sufficiently dark for white text
 */
export const isDarkColor = (hexColor: string): boolean => {
  const luminance = getRelativeLuminance(hexColor)
  return luminance < 0.5
}

/**
 * Get recommended text color (black or white) for a background
 */
export const getRecommendedTextColor = (backgroundColor: string): '#FFFFFF' | '#000000' => {
  const whiteContrast = getContrastRatio('#FFFFFF', backgroundColor)
  const blackContrast = getContrastRatio('#000000', backgroundColor)

  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000'
}
