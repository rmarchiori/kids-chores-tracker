import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'

export const defaultNS = 'common'
export const fallbackLng = 'en-CA'
export const languages = ['en-CA', 'pt-BR', 'fr-CA'] as const

export type Language = typeof languages[number]

export function getOptions(lng = fallbackLng, ns: string | string[] = defaultNS) {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  }
}

// Get locale from cookies (client-side)
export function getClientLocale(): Language {
  if (typeof document === 'undefined') return fallbackLng

  const cookies = document.cookie.split(';')
  const localeCookie = cookies.find(c => c.trim().startsWith('NEXT_LOCALE='))

  if (localeCookie) {
    const locale = localeCookie.split('=')[1]?.trim()
    if (locale && languages.includes(locale as Language)) {
      return locale as Language
    }
  }

  return fallbackLng
}

export async function initI18next(lng: string, ns: string | string[]) {
  const i18nInstance = createInstance()
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(`../../public/locales/${language}/${namespace}.json`)
      )
    )
    .init(getOptions(lng, ns))

  return i18nInstance
}

export async function getTranslation(
  lng: string,
  ns: string | string[] = defaultNS,
  options: { keyPrefix?: string } = {}
) {
  const i18nextInstance = await initI18next(lng, ns)
  return {
    t: i18nextInstance.getFixedT(
      lng,
      Array.isArray(ns) ? ns[0] : ns,
      options.keyPrefix
    ),
    i18n: i18nextInstance,
  }
}
