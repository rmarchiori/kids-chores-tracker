'use client'

import { useMemo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/lib/theme-utils'

interface ThemeCardProps {
  children: React.ReactNode
  className?: string
}

/**
 * ThemeCard - Age-appropriate themed card container
 *
 * Provides a consistent card layout with theme-specific styling
 * including background, border radius, padding, and shadows.
 *
 * @param children - Card content
 * @param className - Additional CSS classes for customization
 */
export function ThemeCard({ children, className = '' }: ThemeCardProps) {
  const { theme } = useTheme()
  const themeClasses = useMemo(() => getThemeClasses(theme), [theme])

  return (
    <div
      className={`
        ${themeClasses.surface}
        ${themeClasses.borderRadius}
        ${themeClasses.padding}
        ${themeClasses.border}
        shadow-md
        ${className}
      `}
    >
      {children}
    </div>
  )
}
