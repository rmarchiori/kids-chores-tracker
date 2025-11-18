'use client'

import { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react'
import { getThemeCSSVariables, type ThemeType } from '@/lib/themes'

interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * Apply CSS variables to document root
 * This enables dynamic theming throughout the application
 */
const applyThemeVariables = (theme: ThemeType): void => {
  const variables = getThemeCSSVariables(theme)
  const root = document.documentElement

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

/**
 * ThemeProvider - Manages application-wide theme state with CSS variables
 *
 * Features:
 * - Dynamic CSS variable injection for real-time theme switching
 * - FOUC prevention with useLayoutEffect
 * - Performance optimization with memoization
 * - Type-safe theme management
 *
 * @param children - React children to wrap with theme context
 * @param initialTheme - Initial theme to use (defaults to 'parent')
 */
export function ThemeProvider({
  children,
  initialTheme = 'parent'
}: {
  children: React.ReactNode
  initialTheme?: ThemeType
}) {
  const [theme, setTheme] = useState<ThemeType>(initialTheme)

  // Use useLayoutEffect to prevent flash of unstyled content (FOUC)
  // This runs synchronously before browser paint
  useLayoutEffect(() => {
    // Set data attribute for CSS selectors
    document.documentElement.setAttribute('data-theme', theme)

    // Apply CSS variables for dynamic theming
    applyThemeVariables(theme)
  }, [theme])

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ theme, setTheme }), [theme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * useTheme - Hook to access theme context
 *
 * @returns Theme context with current theme and setter
 * @throws Error if used outside ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

/**
 * useThemeClasses - Hook to get theme-specific utility classes
 *
 * Provides theme-aware class names for common UI elements
 */
export function useThemeClasses() {
  const { theme } = useTheme()

  return useMemo(() => {
    // Import dynamically to avoid circular dependencies
    const { getThemeClasses, getButtonClasses, getCardClasses } = require('@/lib/themes')

    return {
      theme,
      classes: getThemeClasses(theme),
      button: (variant?: 'primary' | 'success' | 'pending' | 'warning' | 'urgent') =>
        getButtonClasses(theme, variant),
      card: () => getCardClasses(theme),
    }
  }, [theme])
}
