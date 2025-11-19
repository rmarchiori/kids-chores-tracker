'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { WeeklyCalendarView } from '@/components/calendar/WeeklyCalendarView'
import { MonthlyCalendarView } from '@/components/calendar/MonthlyCalendarView'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { motion } from 'framer-motion'

type CalendarView = 'daily' | 'weekly' | 'monthly'

export default function CalendarPage() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [view, setView] = useState<CalendarView>('weekly')
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Get initial view from URL
  useEffect(() => {
    const viewParam = searchParams.get('view') as CalendarView | null
    if (viewParam && ['daily', 'weekly', 'monthly'].includes(viewParam)) {
      setView(viewParam)
    }
  }, [searchParams])

  // Fetch family ID
  useEffect(() => {
    async function fetchFamilyId() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: familyMember, error } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('user_id', user.id)
          .single()

        if (error || !familyMember) {
          console.error('Failed to fetch family:', error)
          return
        }

        setFamilyId(familyMember.family_id)
      } catch (error) {
        console.error('Error fetching family:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFamilyId()
  }, [router])

  const handleViewChange = (newView: CalendarView) => {
    setView(newView)
    router.push(`/calendar?view=${newView}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">{t('calendar.loading')}</div>
      </div>
    )
  }

  if (!familyId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{t('calendar.no_family')}</div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-700 py-8 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
        </div>
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* View Switcher */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-br from-indigo-400 to-blue-400 rounded-3xl shadow-2xl p-1 inline-flex">
            <motion.button
              onClick={() => handleViewChange('daily')}
              className={`
                px-6 py-2 rounded-3xl font-black transition-colors
                ${view === 'daily'
                  ? 'bg-white text-indigo-600'
                  : 'text-white hover:bg-white/20'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {t('calendar.view_daily')}
            </motion.button>
            <motion.button
              onClick={() => handleViewChange('weekly')}
              className={`
                px-6 py-2 rounded-3xl font-black transition-colors
                ${view === 'weekly'
                  ? 'bg-white text-indigo-600'
                  : 'text-white hover:bg-white/20'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {t('calendar.view_weekly')}
            </motion.button>
            <motion.button
              onClick={() => handleViewChange('monthly')}
              className={`
                px-6 py-2 rounded-3xl font-black transition-colors
                ${view === 'monthly'
                  ? 'bg-white text-indigo-600'
                  : 'text-white hover:bg-white/20'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {t('calendar.view_monthly')}
            </motion.button>
          </div>
        </motion.div>

        {/* Calendar Views */}
        {view === 'daily' && (
          <motion.div
            className="bg-gradient-to-br from-indigo-400 to-blue-400 rounded-3xl shadow-2xl p-8 text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <motion.div
              className="text-6xl mb-4 inline-block"
              animate={{ rotate: [-5, 5] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            >
              📅
            </motion.div>
            <h2 className="text-3xl font-black mb-4">
              {t('calendar.daily_view_title')}
            </h2>
            <p className="text-white/90 mb-6 text-lg">
              {t('calendar.daily_view_description')}
            </p>
            <motion.button
              onClick={() => router.push('/daily')}
              className="px-8 py-4 bg-white text-indigo-600 rounded-3xl hover:bg-gray-100 font-black transition-colors shadow-lg"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {t('calendar.go_to_daily_tasks')}
            </motion.button>
          </motion.div>
        )}

        {view === 'weekly' && <WeeklyCalendarView familyId={familyId} />}

        {view === 'monthly' && <MonthlyCalendarView familyId={familyId} />}
      </div>
      </div>
    </DashboardLayout>
  )
}
