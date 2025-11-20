'use client'

import { useState, useEffect } from 'react'
import { getClientLocale, type Language } from '@/lib/i18n'

type Translations = Record<string, any>

// Global cache for translations (shared across all hook instances)
const translationCache = new Map<Language, Translations>()
let loadingPromise: Promise<void> | null = null

export function useTranslation() {
  // Always read locale from cookie, don't rely on cached value
  const [locale, setLocale] = useState<Language>(() => getClientLocale())
  const [translations, setTranslations] = useState<Translations>(() => {
    // Return cached translations if available
    return translationCache.get(locale) || {}
  })
  const [isLoading, setIsLoading] = useState(() => !translationCache.has(locale))

  useEffect(() => {
    const loadTranslations = async () => {
      // Get current locale
      const currentLocale = getClientLocale()
      setLocale(currentLocale)

      // If already cached, use cached version
      if (translationCache.has(currentLocale)) {
        setTranslations(translationCache.get(currentLocale)!)
        setIsLoading(false)
        return
      }

      // If another component is already loading, wait for it
      if (loadingPromise) {
        await loadingPromise
        if (translationCache.has(currentLocale)) {
          setTranslations(translationCache.get(currentLocale)!)
          setIsLoading(false)
          return
        }
      }

      // Load translations for the first time
      setIsLoading(true)
      loadingPromise = (async () => {
        try {
          // Fetch translation file from public folder
          const response = await fetch(`/locales/${currentLocale}/common.json`)
          if (!response.ok) {
            throw new Error(`Failed to load translations: ${response.status}`)
          }
          const loadedTranslations = await response.json()
          translationCache.set(currentLocale, loadedTranslations)
          setTranslations(loadedTranslations)
        } catch (error) {
          console.error('Failed to load translations:', error)
          // Fallback to English
          try {
            const response = await fetch('/locales/en-CA/common.json')
            if (!response.ok) {
              throw new Error(`Failed to load fallback translations: ${response.status}`)
            }
            const fallbackTranslations = await response.json()
            translationCache.set(currentLocale, fallbackTranslations)
            setTranslations(fallbackTranslations)
          } catch (fallbackError) {
            console.error('Failed to load fallback translations:', fallbackError)
          }
        }
        setIsLoading(false)
      })()

      await loadingPromise
      loadingPromise = null
    }

    loadTranslations()
  }, [])

  // Translation function with dot notation support
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = translations

    // Navigate through nested object
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Silently return key if translation not found (to avoid build noise)
        // Translations load client-side, so this is expected during SSR/build
        return key
      }
    }

    // If final value is not a string, return the key
    if (typeof value !== 'string') {
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
