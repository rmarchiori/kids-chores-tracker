'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher'
import { ImageUpload } from '@/components/ImageUpload'
import type { AgeGroup, ThemeType } from '@/lib/theme-utils'
import type { Child } from '@/lib/schemas'

export default function EditChildPage() {
  const router = useRouter()
  const params = useParams()
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    name: '',
    age_group: '5-8' as AgeGroup,
    theme_preference: 'age-default' as 'age-default' | ThemeType,
    profile_photo_url: null as string | null,
  })

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadChild()
  }, [params.id])

  async function loadChild() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/children/${params.id}`)

      if (!response.ok) {
        throw new Error('Failed to load child')
      }

      const data = await response.json()
      const child: Child = data.child

      setFormData({
        name: child.name,
        age_group: child.age_group,
        theme_preference: child.theme_preference || 'age-default',
        profile_photo_url: child.profile_photo_url || null,
      })
    } catch (err) {
      console.error('Error loading child:', err)
      setError('Failed to load child. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError(t('children.name_required'))
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch(`/api/children/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update child')
      }

      router.push('/children')
    } catch (err) {
      console.error('Error updating child:', err)
      setError(err instanceof Error ? err.message : 'Failed to update child. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleThemeSave(newTheme: 'age-default' | ThemeType) {
    setFormData(prev => ({ ...prev, theme_preference: newTheme }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('common.back')}
          </button>

          <h1 className="text-3xl font-bold text-gray-900">{t('children.edit_child')}</h1>
          <p className="text-gray-600 mt-2">{t('children.edit_child_description')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              {t('children.name')} *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder={t('children.name_placeholder')}
              required
              disabled={submitting}
            />
          </div>

          {/* Age Group Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('children.age_group')} *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, age_group: '5-8' }))}
                disabled={submitting}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.age_group === '5-8'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-4xl mb-2">🧒</div>
                <div className="font-semibold text-gray-900">5-8 {t('children.years')}</div>
                <div className="text-sm text-gray-600">{t('children.younger_kids')}</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, age_group: '9-12' }))}
                disabled={submitting}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.age_group === '9-12'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-4xl mb-2">👦</div>
                <div className="font-semibold text-gray-900">9-12 {t('children.years')}</div>
                <div className="text-sm text-gray-600">{t('children.older_kids')}</div>
              </button>
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
            <button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {t('common.saving')}
                </>
              ) : (
                t('common.save')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
