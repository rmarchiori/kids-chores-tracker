'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { WeeklyCalendarView } from '@/components/calendar/WeeklyCalendarView'
import { MonthlyCalendarView } from '@/components/calendar/MonthlyCalendarView'
import { createClient } from '@/lib/supabase/client'

type CalendarView = 'daily' | 'weekly' | 'monthly'

export default function CalendarPage() {
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
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!familyId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">No family found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* View Switcher */}
      <div className="mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex">
          <button
            onClick={() => handleViewChange('daily')}
            className={`
              px-6 py-2 rounded-md font-medium transition-colors
              ${view === 'daily'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            Daily
          </button>
          <button
            onClick={() => handleViewChange('weekly')}
            className={`
              px-6 py-2 rounded-md font-medium transition-colors
              ${view === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            Weekly
          </button>
          <button
            onClick={() => handleViewChange('monthly')}
            className={`
              px-6 py-2 rounded-md font-medium transition-colors
              ${view === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Calendar Views */}
      {view === 'daily' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-900">
            Daily view is available at <a href="/daily" className="underline font-medium">Daily Tasks</a> page.
          </p>
        </div>
      )}

      {view === 'weekly' && <WeeklyCalendarView familyId={familyId} />}

      {view === 'monthly' && <MonthlyCalendarView familyId={familyId} />}
    </div>
  )
}
