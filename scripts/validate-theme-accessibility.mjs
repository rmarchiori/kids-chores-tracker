#!/usr/bin/env node
/**
 * Theme Accessibility Validation Script
 *
 * Validates all theme color combinations for WCAG AA compliance
 * Run with: node scripts/validate-theme-accessibility.mjs
 */

// Theme configurations (matching src/lib/themes/config.ts)
const THEME_CONFIGS = {
  young: {
    colors: {
      primary: '#DC143C',
      success: '#00857A',
      pending: '#D4A60A',
      background: '#F7F7FF',
      surface: '#FFFFFF',
      text: '#2D3748',
    }
  },
  older: {
    colors: {
      primary: '#6C5CE7',
      success: '#00756C',
      pending: '#D4A60A',
      background: '#DFE6E9',
      surface: '#FFFFFF',
      text: '#2D3748',
    }
  },
  parent: {
    colors: {
      primary: '#0770D0',
      success: '#00756C',
      warning: '#D4A60A',
      urgent: '#C41E3A',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#2D3748',
    }
  }
}

// WCAG AA minimum contrast ratios
const WCAG_AA_NORMAL_TEXT = 4.5
const WCAG_AA_LARGE_TEXT = 3.0

/**
 * Calculate relative luminance of a color (0-1 scale)
 */
function getRelativeLuminance(hexColor) {
  const hex = hexColor.replace('#', '')

  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const gammaCorrect = (value) => {
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
  }

  const rLinear = gammaCorrect(r)
  const gLinear = gammaCorrect(g)
  const bLinear = gammaCorrect(b)

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1, color2) {
  const lum1 = getRelativeLuminance(color1)
  const lum2 = getRelativeLuminance(color2)

  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Format pass/fail with colors
 */
function formatResult(passes) {
  return passes ? '✅ PASS' : '❌ FAIL'
}

/**
 * Validate a single color combination
 */
function validateCombination(fg, bg, name, requiredRatio = WCAG_AA_NORMAL_TEXT) {
  const ratio = getContrastRatio(fg, bg)
  const passes = ratio >= requiredRatio

  return {
    name,
    foreground: fg,
    background: bg,
    ratio: ratio.toFixed(2),
    required: requiredRatio.toFixed(1),
    passes,
    result: formatResult(passes)
  }
}

/**
 * Validate all combinations for a theme
 */
function validateTheme(themeName, themeConfig) {
  const { colors } = themeConfig
  const validations = []

  console.log(`\n${'='.repeat(60)}`)
  console.log(`🎨 Theme: ${themeName.toUpperCase()}`)
  console.log('='.repeat(60))

  // Text on background colors
  validations.push(validateCombination(
    colors.text,
    colors.background,
    'Text on Background'
  ))

  validations.push(validateCombination(
    colors.text,
    colors.surface,
    'Text on Surface'
  ))

  // White text on colored buttons
  validations.push(validateCombination(
    '#FFFFFF',
    colors.primary,
    'White on Primary Button'
  ))

  validations.push(validateCombination(
    '#FFFFFF',
    colors.success,
    'White on Success Button'
  ))

  // Dark text on warning/pending (if they exist)
  if (colors.pending) {
    validations.push(validateCombination(
      colors.text,
      colors.pending,
      'Dark Text on Pending/Warning'
    ))
  }

  // Parent theme has urgent color
  if (colors.urgent) {
    validations.push(validateCombination(
      '#FFFFFF',
      colors.urgent,
      'White on Urgent Button'
    ))
  }

  // Print results
  console.log('\n📊 Contrast Validation Results:\n')
  console.log('Combination'.padEnd(35), 'Ratio'.padEnd(10), 'Required'.padEnd(10), 'Status')
  console.log('-'.repeat(70))

  validations.forEach(v => {
    console.log(
      v.name.padEnd(35),
      v.ratio.padEnd(10),
      v.required.padEnd(10),
      v.result
    )
  })

  const allPassed = validations.every(v => v.passes)
  const passCount = validations.filter(v => v.passes).length

  console.log('\n' + '-'.repeat(70))
  console.log(`Summary: ${passCount}/${validations.length} tests passed`)
  console.log(`Overall: ${allPassed ? '✅ WCAG AA COMPLIANT' : '❌ NEEDS IMPROVEMENT'}`)

  return {
    themeName,
    validations,
    allPassed,
    passCount,
    totalCount: validations.length
  }
}

/**
 * Main validation function
 */
function runValidation() {
  console.log('🔍 WCAG AA Accessibility Validation')
  console.log('Testing all theme color combinations for contrast compliance')
  console.log(`Minimum contrast ratio: ${WCAG_AA_NORMAL_TEXT}:1 (normal text)`)

  const results = []

  // Validate each theme
  Object.entries(THEME_CONFIGS).forEach(([themeName, config]) => {
    const result = validateTheme(themeName, config)
    results.push(result)
  })

  // Overall summary
  console.log('\n' + '='.repeat(60))
  console.log('📈 OVERALL SUMMARY')
  console.log('='.repeat(60))

  results.forEach(r => {
    const status = r.allPassed ? '✅' : '❌'
    console.log(`${status} ${r.themeName.padEnd(10)} - ${r.passCount}/${r.totalCount} tests passed`)
  })

  const allThemesPassed = results.every(r => r.allPassed)

  console.log('\n' + '='.repeat(60))
  if (allThemesPassed) {
    console.log('🎉 SUCCESS! All themes are WCAG AA compliant!')
    console.log('All color combinations meet the minimum 4.5:1 contrast ratio.')
  } else {
    console.log('⚠️  WARNING! Some themes need contrast improvements.')
    console.log('Review the failed combinations above and adjust colors.')
    process.exit(1)
  }
  console.log('='.repeat(60) + '\n')

  return results
}

// Run validation
try {
  runValidation()
  process.exit(0)
} catch (error) {
  console.error('❌ Validation script failed:', error)
  process.exit(1)
}
