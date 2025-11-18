/** @type {import('next-i18next').UserConfig} */
module.exports = {
  defaultLocale: 'en-CA',
  locales: ['en-CA', 'pt-BR', 'fr-CA'],
  localePath: typeof window === 'undefined' ? require('path').resolve('./public/locales') : '/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}
