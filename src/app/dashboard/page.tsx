'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LanguageSelector from '@/components/LanguageSelector'
import { getClientLocale } from '@/lib/i18n'
import { useTranslation } from '@/hooks/useTranslation'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { motion } from 'framer-motion'

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
        <motion.div
          className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.01, y: -2 }}
        >
          <h2 className="text-4xl font-black mb-2">
            {t('dashboard.welcome', { name: user?.name || '' })}
          </h2>
          <p className="text-xl mb-6 text-white/90">
            {t('dashboard.family')}: <span className="font-bold">{user?.familyName}</span>
          </p>
          <p className="text-white/80">
            {t('dashboard.comingSoon')}
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Family Settings Card */}
          <motion.button
            onClick={() => router.push('/dashboard/family/settings')}
            className="bg-gradient-to-br from-blue-400 to-cyan-400 rounded-3xl shadow-2xl p-6 text-left text-white"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="text-5xl mb-4"
              animate={{ rotate: [-5, 5] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            >
              👨‍👩‍👧‍👦
            </motion.div>
            <h3 className="text-xl font-bold mb-2">{t('cards.family.title')}</h3>
            <p className="text-white/90 text-sm">
              {t('cards.family.description')}
            </p>
          </motion.button>

          {/* Children Card */}
          <motion.button
            onClick={() => router.push('/children')}
            className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl shadow-2xl p-6 text-left text-white"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="text-5xl mb-4"
              animate={{ rotate: [-5, 5] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: 0.2 }}
            >
              👥
            </motion.div>
            <h3 className="text-xl font-bold mb-2">{t('cards.children.title')}</h3>
            <p className="text-white/90 text-sm">
              Add and manage children profiles
            </p>
          </motion.button>

          {/* Today's Tasks Card */}
          <motion.button
            onClick={() => router.push('/daily')}
            className="bg-gradient-to-br from-indigo-400 to-blue-400 rounded-3xl shadow-2xl p-6 text-left text-white"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="text-5xl mb-4"
              animate={{ rotate: [-5, 5] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: 0.4 }}
            >
              📋
            </motion.div>
            <h3 className="text-xl font-bold mb-2">Today's Tasks</h3>
            <p className="text-white/90 text-sm">
              View and manage today's tasks for all children
            </p>
          </motion.button>

          {/* Tasks Management Card */}
          <motion.button
            onClick={() => router.push('/tasks')}
            className="bg-gradient-to-br from-pink-400 to-rose-400 rounded-3xl shadow-2xl p-6 text-left text-white"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="text-5xl mb-4"
              animate={{ rotate: [-5, 5] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: 0.6 }}
            >
              ✅
            </motion.div>
            <h3 className="text-xl font-bold mb-2">{t('cards.tasks.title')}</h3>
            <p className="text-white/90 text-sm">
              Create and manage all tasks
            </p>
          </motion.button>

          {/* Reviews Card */}
          <motion.button
            onClick={() => router.push('/reviews')}
            className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl shadow-2xl p-6 text-left text-white"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="text-5xl mb-4"
              animate={{ rotate: [-5, 5] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: 0.8 }}
            >
              ⭐
            </motion.div>
            <h3 className="text-xl font-bold mb-2">Reviews</h3>
            <p className="text-white/90 text-sm">
              Review and approve completed tasks
            </p>
          </motion.button>

          {/* Completions History Card */}
          <motion.button
            onClick={() => router.push('/completions')}
            className="bg-gradient-to-br from-cyan-400 to-teal-400 rounded-3xl shadow-2xl p-6 text-left text-white"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="text-5xl mb-4"
              animate={{ rotate: [-5, 5] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: 1.0 }}
            >
              📊
            </motion.div>
            <h3 className="text-xl font-bold mb-2">Completions</h3>
            <p className="text-white/90 text-sm">
              View task completion history
            </p>
          </motion.button>

          {/* Progress Card */}
          <motion.button
            onClick={() => router.push('/analytics')}
            className="bg-gradient-to-br from-emerald-400 to-green-400 rounded-3xl shadow-2xl p-6 text-left text-white"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="text-5xl mb-4"
              animate={{ rotate: [-5, 5] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: 1.4 }}
            >
              📈
            </motion.div>
            <h3 className="text-xl font-bold mb-2">{t('cards.progress.title')}</h3>
            <p className="text-white/90 text-sm">
              {t('cards.progress.description')}
            </p>
          </motion.button>

          {/* Settings Card */}
          <motion.button
            onClick={() => router.push('/dashboard/settings')}
            className="bg-gradient-to-br from-purple-400 to-indigo-400 rounded-3xl shadow-2xl p-6 text-left text-white"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <motion.div
              className="text-5xl mb-4"
              animate={{ rotate: [-5, 5] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: 1.2 }}
            >
              ⚙️
            </motion.div>
            <h3 className="text-xl font-bold mb-2">Settings</h3>
            <p className="text-white/90 text-sm">
              Manage account and preferences
            </p>
          </motion.button>
        </div>
      </div>
    </DashboardLayout>
  )
}
