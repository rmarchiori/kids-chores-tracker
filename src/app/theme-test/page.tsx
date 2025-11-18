'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/lib/theme-utils'
import { ThemeButton, ThemeCard } from '@/components/theme'
import type { ThemeType } from '@/lib/theme-utils'

export default function ThemeTestPage() {
  const { theme, setTheme } = useTheme()
  const themeClasses = getThemeClasses(theme)

  const themes: ThemeType[] = ['young', 'older', 'parent']

  return (
    <div className={`min-h-screen ${themeClasses.bg} p-8`}>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className={`text-4xl font-bold ${themeClasses.text}`}>
          Theme Testing Page
        </h1>

        {/* Theme Selector */}
        <div className="flex gap-4">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all
                ${theme === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
              `}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)} Theme
            </button>
          ))}
        </div>

        {/* Current Theme Info */}
        <ThemeCard>
          <h2 className={`text-2xl font-bold ${themeClasses.text} mb-4`}>
            Current Theme: {theme}
          </h2>
          <div className="space-y-2 text-sm">
            <p><strong>Text Size:</strong> {themeClasses.textSize}</p>
            <p><strong>Font Weight:</strong> {themeClasses.fontWeight}</p>
            <p><strong>Border Radius:</strong> {themeClasses.borderRadius}</p>
            <p><strong>Padding:</strong> {themeClasses.padding}</p>
            <p><strong>Icon Size:</strong> {themeClasses.iconSize}</p>
          </div>
        </ThemeCard>

        {/* Button Variants */}
        <ThemeCard>
          <h2 className={`text-2xl font-bold ${themeClasses.text} mb-4`}>
            Button Variants
          </h2>
          <div className="flex flex-wrap gap-4">
            <ThemeButton variant="primary">Primary Button</ThemeButton>
            <ThemeButton variant="success">Success Button</ThemeButton>
            <ThemeButton variant="pending">Pending Button</ThemeButton>
            {theme === 'parent' && (
              <>
                <ThemeButton variant="warning">Warning Button</ThemeButton>
                <ThemeButton variant="urgent">Urgent Button</ThemeButton>
              </>
            )}
          </div>
        </ThemeCard>

        {/* Color Palette */}
        <ThemeCard>
          <h2 className={`text-2xl font-bold ${themeClasses.text} mb-4`}>
            Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className={`w-full h-16 mb-2 rounded ${
                theme === 'young' ? 'bg-young-primary' :
                theme === 'older' ? 'bg-older-primary' :
                'bg-parent-primary'
              }`}></div>
              <p className="text-sm font-medium">Primary</p>
            </div>
            <div>
              <div className={`w-full h-16 mb-2 rounded ${
                theme === 'young' ? 'bg-young-success' :
                theme === 'older' ? 'bg-older-success' :
                'bg-parent-success'
              }`}></div>
              <p className="text-sm font-medium">Success</p>
            </div>
            <div>
              <div className={`w-full h-16 mb-2 rounded ${
                theme === 'young' ? 'bg-young-pending' :
                theme === 'older' ? 'bg-older-pending' :
                'bg-parent-warning'
              }`}></div>
              <p className="text-sm font-medium">{theme === 'parent' ? 'Warning' : 'Pending'}</p>
            </div>
            <div>
              <div className={`w-full h-16 mb-2 rounded border-2 ${
                theme === 'young' ? 'bg-young-surface border-young-border' :
                theme === 'older' ? 'bg-older-surface border-older-border' :
                'bg-parent-surface border-parent-border'
              }`}></div>
              <p className="text-sm font-medium">Surface</p>
            </div>
            <div>
              <div className={`w-full h-16 mb-2 rounded border-2 ${
                theme === 'young' ? 'bg-young-bg border-young-border' :
                theme === 'older' ? 'bg-older-bg border-older-border' :
                'bg-parent-bg border-parent-border'
              }`}></div>
              <p className="text-sm font-medium">Background</p>
            </div>
            {theme === 'parent' && (
              <div>
                <div className="w-full h-16 mb-2 rounded bg-parent-urgent"></div>
                <p className="text-sm font-medium">Urgent</p>
              </div>
            )}
          </div>
        </ThemeCard>

        {/* Typography Scale */}
        <ThemeCard>
          <h2 className={`text-2xl font-bold ${themeClasses.text} mb-4`}>
            Typography
          </h2>
          <div className="space-y-2">
            <p className={`${themeClasses.textSize} ${themeClasses.fontWeight}`}>
              Base text with theme styling
            </p>
            <p className={`text-lg ${themeClasses.text}`}>
              Large text example
            </p>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              Secondary text example
            </p>
          </div>
        </ThemeCard>

        {/* Accessibility Info */}
        <ThemeCard>
          <h2 className={`text-2xl font-bold ${themeClasses.text} mb-4`}>
            Accessibility Testing
          </h2>
          <p className="mb-4">
            This theme should meet WCAG AA contrast requirements. Test with:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Chrome Lighthouse audit</li>
            <li>WAVE accessibility checker</li>
            <li>Keyboard navigation (Tab key)</li>
            <li>Screen reader (NVDA/JAWS)</li>
          </ul>
        </ThemeCard>
      </div>
    </div>
  )
}
