'use client'

import { useState } from 'react'
import { FlagIcon } from './flags/FlagIcon'

const LANGUAGES = [
  { code: 'en-CA', name: 'English', flagCountry: 'GB' as const },
  { code: 'pt-BR', name: 'Português', flagCountry: 'BR' as const },
  { code: 'fr-CA', name: 'Français', flagCountry: 'FR' as const },
]

interface LanguageSelectorProps {
  currentLocale: string
  onLanguageChange?: (locale: string) => void
}

export default function LanguageSelector({
  currentLocale,
  onLanguageChange,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = LANGUAGES.find((lang) => lang.code === currentLocale) ?? LANGUAGES[0]!  // Fallback always exists

  const handleLanguageChange = async (localeCode: string) => {
    setIsOpen(false)

    console.log('🌐 Switching language to:', localeCode)

    try {
      // Try to save preference to database via API (optional - may fail if column doesn't exist)
      try {
        const response = await fetch('/api/user/language', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: localeCode }),
        })

        if (!response.ok) {
          console.warn('⚠️ Failed to save language preference to database (column may not exist yet)')
        } else {
          console.log('✅ Language preference saved to database')
        }
      } catch (apiError) {
        console.warn('⚠️ API call failed:', apiError)
        // Continue anyway - we'll use cookies
      }

      // Call optional callback
      if (onLanguageChange) {
        await onLanguageChange(localeCode)
      }

      // Update cookie for language preference (primary method)
      document.cookie = `NEXT_LOCALE=${localeCode}; path=/; max-age=31536000; SameSite=Lax`
      console.log('🍪 Cookie set:', document.cookie)

      // Refresh the page to apply new language
      console.log('🔄 Reloading page...')
      window.location.reload()
    } catch (error) {
      console.error('❌ Failed to change language:', error)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label={`Select language - Current: ${currentLanguage.name}`}
      >
        <FlagIcon country={currentLanguage.flagCountry} className="w-7 h-5" />
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                    language.code === currentLocale ? 'bg-blue-50' : ''
                  }`}
                >
                  <FlagIcon country={language.flagCountry} className="w-7 h-5" />
                  <span className="text-sm font-medium text-gray-900">
                    {language.name}
                  </span>
                  {language.code === currentLocale && (
                    <svg
                      className="w-5 h-5 ml-auto text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
