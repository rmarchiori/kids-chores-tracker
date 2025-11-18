'use client'

import { useState, useEffect } from 'react'
import { getClientLocale, type Language } from '@/lib/i18n'

type Translations = Record<string, any>

export function useTranslation() {
  const [locale, setLocale] = useState<Language>('en-CA')
  const [translations, setTranslations] = useState<Translations>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true)

      // Get current locale
      const currentLocale = getClientLocale()
      setLocale(currentLocale)

      try {
        // Load translation file for current locale
        const translationModule = await import(`../../public/locales/${currentLocale}/common.json`)
        setTranslations(translationModule.default || translationModule)
      } catch (error) {
        console.error('Failed to load translations:', error)
        // Fallback to English
        try {
          const fallbackModule = await import(`../../public/locales/en-CA/common.json`)
          setTranslations(fallbackModule.default || fallbackModule)
        } catch (fallbackError) {
          console.error('Failed to load fallback translations:', fallbackError)
        }
      }

      setIsLoading(false)
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
        return key // Return key if translation not found
      }
    }

    // If final value is not a string, return the key
    if (typeof value !== 'string') {
      return key
    }

    // Replace parameters in the string
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match
      })
    }

    return value
  }

  return { t, locale, isLoading }
}
