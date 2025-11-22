'use client'

import { useState, useEffect } from 'react'
import { getClientLocale, type Language } from '@/lib/i18n'

type Translations = Record<string, any>

export function useTranslation() {
  // Read locale from cookie on mount - use effect to ensure client-side reading
  const [locale, setLocale] = useState<Language>('en-CA')
  const [translations, setTranslations] = useState<Translations>({})
  const [isLoading, setIsLoading] = useState(true)

  // Read locale from cookie on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const clientLocale = getClientLocale()
      setLocale(clientLocale)
    }
  }, [])

  useEffect(() => {
    // Cleanup flag to prevent state updates after unmount
    let cancelled = false

    const loadTranslations = async () => {
      // Only run on client side
      if (typeof window === 'undefined') return

      setIsLoading(true)

      try {
        // Fetch translation file with cache busting to prevent stale translations
        // Add timestamp to bypass browser cache
        const timestamp = Date.now()
        const response = await fetch(
          `/locales/${locale}/common.json?t=${timestamp}`,
          {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to load translations: ${response.status}`)
        }

        const loadedTranslations = await response.json()

        // Only update state if component is still mounted
        if (!cancelled) {
          setTranslations(loadedTranslations)
          setIsLoading(false)
          console.log(`✅ Translations loaded for ${locale}:`, Object.keys(loadedTranslations).length, 'keys')
        }
      } catch (error) {
        console.error(`❌ Failed to load translations for ${locale}:`, error)

        // Fallback to English if current locale fails
        if (locale !== 'en-CA') {
          try {
            const timestamp = Date.now()
            const fallbackResponse = await fetch(
              `/locales/en-CA/common.json?t=${timestamp}`,
              {
                cache: 'no-store',
                headers: {
                  'Cache-Control': 'no-cache',
                },
              }
            )

            if (!fallbackResponse.ok) {
              throw new Error(`Failed to load fallback translations: ${fallbackResponse.status}`)
            }

            const fallbackTranslations = await fallbackResponse.json()

            if (!cancelled) {
              setTranslations(fallbackTranslations)
              setIsLoading(false)
              console.log('⚠️ Using fallback English translations')
            }
          } catch (fallbackError) {
            console.error('❌ Failed to load fallback translations:', fallbackError)
            if (!cancelled) {
              setIsLoading(false)
            }
          }
        } else {
          if (!cancelled) {
            setIsLoading(false)
          }
        }
      }
    }

    loadTranslations()

    // Cleanup function to prevent state updates after unmount
    return () => {
      cancelled = true
    }
  }, [locale]) // Only re-run if locale changes (which shouldn't happen after mount)

  // Translation function with dot notation support
  const t = (key: string, params?: Record<string, string | number>): string => {
    // Return key during SSR or if translations are empty
    if (typeof window === 'undefined' || !translations || Object.keys(translations).length === 0) {
      return key
    }

    const keys = key.split('.')
    let value: any = translations

    // Navigate through nested object
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Return key if translation not found
        console.warn(`⚠️ Translation key not found: ${key}`)
        return key
      }
    }

    // If final value is not a string, return the key
    if (typeof value !== 'string') {
      console.warn(`⚠️ Translation value is not a string: ${key}`)
      return key
    }

    // Replace parameters in the string (supports both {{param}} and {param} syntax)
    if (params) {
      return value.replace(/\{\{?(\w+)\}?\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match
      })
    }

    return value
  }

  return { t, locale, isLoading }
}
