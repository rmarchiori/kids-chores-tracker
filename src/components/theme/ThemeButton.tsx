'use client'

import { useMemo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/lib/theme-utils'

interface ThemeButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'pending' | 'warning' | 'urgent'
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
}

/**
 * ThemeButton - Age-appropriate themed button component
 *
 * Automatically applies theme-specific styling including colors, sizing,
 * and spacing based on the current theme context.
 *
 * @param children - Button content
 * @param variant - Visual variant (primary, success, pending, warning, urgent)
 * @param onClick - Click handler
 * @param disabled - Whether button is disabled
 * @param className - Additional CSS classes
 * @param type - Button type attribute
 * @param ariaLabel - Accessible label for screen readers
 */
export function ThemeButton({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  ariaLabel
}: ThemeButtonProps) {
  const { theme } = useTheme()
  const themeClasses = useMemo(() => getThemeClasses(theme), [theme])

  const variantClasses = {
    primary: themeClasses.primary,
    success: themeClasses.success,
    pending: theme === 'parent' ? (themeClasses as any).warning || themeClasses.primary : (themeClasses as any).pending || themeClasses.primary,
    warning: theme === 'parent' ? (themeClasses as any).warning || themeClasses.primary : (themeClasses as any).pending || themeClasses.primary,
    urgent: theme === 'parent' ? (themeClasses as any).urgent || themeClasses.primary : themeClasses.primary,
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${themeClasses.borderRadius}
        ${themeClasses.padding}
        ${themeClasses.textSize}
        ${themeClasses.fontWeight}

        min-h-[48px]
        min-w-[48px]

        transition-colors
        duration-200

        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-blue-500

        disabled:opacity-50
        disabled:cursor-not-allowed

        ${className}
      `}
    >
      {children}
    </button>
  )
}
