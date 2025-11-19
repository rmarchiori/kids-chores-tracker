'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LanguageSelector from '@/components/LanguageSelector'
import { getClientLocale } from '@/lib/i18n'
import { useTranslation } from '@/hooks/useTranslation'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'

interface UserProfile {
  name: string
  email: string
  familyName: string
  language: string
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useTranslation()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentLocale, setCurrentLocale] = useState<string>('en-CA')

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true)

        // Get current locale from cookie
        const locale = getClientLocale()
        console.log('📍 Dashboard loaded with locale:', locale)
        setCurrentLocale(locale)

        // Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session) {
          router.push('/auth/login')
          return
        }

        // Get family member profile
        const { data: memberData, error: memberError } = await supabase
          .from('family_members')
          .select('display_name, email, families(name)')
          .eq('user_id', session.user.id)
          .single()

        if (memberError) {
          setError('Failed to load profile')
          return
        }

        if (memberData) {
          setUser({
            name: memberData.display_name,
            email: memberData.email,
            familyName: (memberData.families as any)?.name || 'Family',
            language: 'en-CA', // Will be loaded from cookie by getClientLocale
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('dashboard.loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              {t('dashboard.backToLogin')}
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 md:hidden">{t('app.title')}</h1>
            <div className="md:ml-auto flex items-center gap-4">
              <LanguageSelector currentLocale={currentLocale} />
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('dashboard.welcome', { name: user?.name || '' })}
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            {t('dashboard.family')}: <span className="font-semibold">{user?.familyName}</span>
          </p>
          <p className="text-gray-600">
            {t('dashboard.comingSoon')}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Family Settings Card */}
          <button
            onClick={() => router.push('/family/settings')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cards.family.title')}</h3>
            <p className="text-gray-600 text-sm">
              {t('cards.family.description')}
            </p>
          </button>

          {/* Children Card */}
          <button
            onClick={() => router.push('/children')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cards.children.title')}</h3>
            <p className="text-gray-600 text-sm">
              {t('cards.children.description')}
            </p>
          </button>

          {/* Today's Tasks Card */}
          <button
            onClick={() => router.push('/daily')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cards.todayTasks.title')}</h3>
            <p className="text-gray-600 text-sm">
              {t('cards.todayTasks.description')}
            </p>
          </button>

          {/* Tasks Management Card */}
          <button
            onClick={() => router.push('/tasks')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cards.tasks.title')}</h3>
            <p className="text-gray-600 text-sm">
              {t('cards.tasks.description')}
            </p>
          </button>

          {/* Reviews Card */}
          <button
            onClick={() => router.push('/reviews')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cards.reviews.title')}</h3>
            <p className="text-gray-600 text-sm">
              {t('cards.reviews.description')}
            </p>
          </button>

          {/* Completions History Card */}
          <button
            onClick={() => router.push('/completions')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cards.completions.title')}</h3>
            <p className="text-gray-600 text-sm">
              {t('cards.completions.description')}
            </p>
          </button>

          {/* Progress Card */}
          <div className="bg-white rounded-lg shadow p-6 opacity-75">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cards.progress.title')}</h3>
            <p className="text-gray-600 text-sm">
              {t('cards.progress.description')}
            </p>
          </div>

          {/* Settings Card */}
          <button
            onClick={() => router.push('/settings')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cards.settings.title')}</h3>
            <p className="text-gray-600 text-sm">
              {t('cards.settings.description')}
            </p>
          </button>
        </div>

        {/* Getting Started Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('gettingStarted.title')}</h3>
          <ol className="space-y-3 list-decimal list-inside text-gray-600">
            <li>
              <span className="font-medium text-gray-900">{t('gettingStarted.step1')}</span>
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                ✓ {t('gettingStarted.availableNow')}
              </span>
            </li>
            <li>
              <span className="font-medium text-gray-900">{t('gettingStarted.step2')}</span>
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                ✓ {t('gettingStarted.availableNow')}
              </span>
            </li>
            <li>{t('gettingStarted.step3')}</li>
            <li>{t('gettingStarted.step4')}</li>
            <li>{t('gettingStarted.step5')}</li>
            <li>{t('gettingStarted.step6')}</li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  )
}
