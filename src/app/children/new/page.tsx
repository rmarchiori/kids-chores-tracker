'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher'
import { ImageUpload } from '@/components/ImageUpload'
import type { AgeGroup, ThemeType } from '@/lib/theme-utils'
import { motion } from 'framer-motion'

export default function NewChildPage() {
  const router = useRouter()
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    name: '',
    age_group: '5-8' as AgeGroup,
    theme_preference: 'age-default' as 'age-default' | ThemeType,
    profile_photo_url: null as string | null,
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError(t('children.name_required'))
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create child')
      }

      router.push('/children')
    } catch (err) {
      console.error('Error creating child:', err)
      setError(err instanceof Error ? err.message : 'Failed to create child. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleThemeSave(newTheme: 'age-default' | ThemeType) {
    setFormData(prev => ({ ...prev, theme_preference: newTheme }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            onClick={() => router.back()}
            className="text-purple-600 hover:text-purple-700 font-bold mb-4 flex items-center gap-2"
            whileHover={{ x: -5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('common.back')}
          </motion.button>

          <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{t('children.add_child')}</h1>
          <p className="text-gray-700 mt-2">{t('children.add_child_description')}</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-3xl text-red-600 shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}

          {/* Profile Photo Upload */}
          <div className="mb-6">
            <ImageUpload
              currentPhotoUrl={formData.profile_photo_url}
              onPhotoUrlChange={(url) => setFormData(prev => ({ ...prev, profile_photo_url: url }))}
            />
          </div>

          {/* Name Field */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
              {t('children.name')} *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-3xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-lg"
              placeholder={t('children.name_placeholder')}
              required
              disabled={submitting}
            />
          </div>

          {/* Age Group Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              {t('children.age_group')} *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, age_group: '5-8' }))}
                disabled={submitting}
                className={`p-4 rounded-3xl border-2 transition-all shadow-xl ${
                  formData.age_group === '5-8'
                    ? 'border-pink-500 bg-gradient-to-br from-pink-400 to-pink-300 text-white'
                    : 'border-purple-300 hover:border-pink-400 bg-white'
                }`}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <motion.div
                  className="text-4xl mb-2"
                  animate={{ rotate: [-5, 5] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                >
                  🧒
                </motion.div>
                <div className={`font-black ${formData.age_group === '5-8' ? 'text-white' : 'text-gray-900'}`}>5-8 {t('children.years')}</div>
                <div className={`text-sm ${formData.age_group === '5-8' ? 'text-white/90' : 'text-gray-600'}`}>{t('children.younger_kids')}</div>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, age_group: '9-12' }))}
                disabled={submitting}
                className={`p-4 rounded-3xl border-2 transition-all shadow-xl ${
                  formData.age_group === '9-12'
                    ? 'border-purple-500 bg-gradient-to-br from-purple-400 to-purple-300 text-white'
                    : 'border-purple-300 hover:border-purple-400 bg-white'
                }`}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <motion.div
                  className="text-4xl mb-2"
                  animate={{ rotate: [-5, 5] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: 0.2 }}
                >
                  👦
                </motion.div>
                <div className={`font-black ${formData.age_group === '9-12' ? 'text-white' : 'text-gray-900'}`}>9-12 {t('children.years')}</div>
                <div className={`text-sm ${formData.age_group === '9-12' ? 'text-white/90' : 'text-gray-600'}`}>{t('children.older_kids')}</div>
              </motion.button>
            </div>
          </div>

          {/* Theme Preference */}
          <div className="mb-8">
            <ThemeSwitcher
              ageGroup={formData.age_group}
              currentPreference={formData.theme_preference}
              onSave={handleThemeSave}
            />
            <p className="text-sm text-gray-500 mt-2">
              {t('children.theme_help')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <motion.button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="flex-1 px-6 py-3 border-2 border-purple-300 text-purple-700 rounded-3xl hover:bg-purple-50 transition-colors font-bold disabled:opacity-50 shadow-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {t('common.cancel')}
            </motion.button>
            <motion.button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-3xl hover:from-purple-500 hover:to-pink-500 transition-colors font-black disabled:opacity-50 flex items-center justify-center gap-2 shadow-2xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {t('common.saving')}
                </>
              ) : (
                t('children.add_child')
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  )
}
