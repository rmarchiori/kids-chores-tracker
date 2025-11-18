'use client'

import { I18nextProvider } from 'react-i18next'
import { createInstance, Resource } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { ReactNode, useEffect, useState } from 'react'
import { getOptions } from '@/lib/i18n'

interface TranslationProviderProps {
  children: ReactNode
  locale: string
  namespaces: string[]
  resources: Resource
}

export default function TranslationProvider({
  children,
  locale,
  namespaces,
  resources,
}: TranslationProviderProps) {
  const [i18n, setI18n] = useState<any>(null)

  useEffect(() => {
    const initI18n = async () => {
      const i18nInstance = createInstance()
      await i18nInstance
        .use(initReactI18next)
        .init({
          ...getOptions(locale, namespaces),
          resources,
          preload: [locale],
        })
      setI18n(i18nInstance)
    }

    initI18n()
  }, [locale, namespaces, resources])

  if (!i18n) {
    return <>{children}</>
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
