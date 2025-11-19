'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { format, addMonths, subMonths, startOfMonth, getDay, getDaysInMonth } from 'date-fns'
import { useMonthlyCalendarData, getHeatmapColor } from '@/lib/hooks/useCalendarData'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface MonthlyCalendarViewProps {
  familyId: string
  initialDate?: Date
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function MonthlyCalendarViewComponent({ familyId, initialDate = new Date() }: MonthlyCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(initialDate)
  const router = useRouter()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const { data: monthData, isLoading, error } = useMonthlyCalendarData(year, month, familyId)

  // Memoize callbacks to prevent unnecessary re-renders
  const handlePreviousMonth = useCallback(() => {
    setCurrentDate(prev => subMonths(prev, 1))
  }, [])

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => addMonths(prev, 1))
  }, [])

  const handleTodayClick = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  const handleDayClick = useCallback((date: string) => {
    router.push(`/daily?date=${date}`)
  }, [router])

  const handleWeekClick = useCallback((weekStart: string) => {
    router.push(`/calendar?view=weekly&date=${weekStart}`)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading monthly calendar...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Failed to load monthly calendar</p>
      </div>
    )
  }

  if (!monthData) return null

  // Build calendar grid
  const monthStart = startOfMonth(currentDate)
  const startDayOfWeek = getDay(monthStart)
  const daysInMonth = getDaysInMonth(currentDate)
  const isCurrentMonth = format(currentDate, 'yyyy-MM') === format(new Date(), 'yyyy-MM')

  // Create array of days including leading empty cells
  const calendarDays = Array(startDayOfWeek).fill(null).concat(monthData.days)

  // Split into weeks
  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          {isCurrentMonth && (
            <p className="text-sm text-blue-600 font-medium">Current Month</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleTodayClick}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Month Summary Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Progress</p>
            <p className="text-2xl font-bold text-gray-900">
              {monthData.completed_tasks}/{monthData.total_tasks}
            </p>
            <p className="text-sm text-gray-600">
              {monthData.completion_percentage}% complete
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Perfect Days</p>
            <p className="text-2xl font-bold text-gray-900">
              {monthData.perfect_days_count} days
            </p>
            <p className="text-sm text-gray-600">
              with 100% completion
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Average Daily Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {monthData.average_daily_completion_rate}%
            </p>
            <p className="text-sm text-gray-600">
              per day average
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Trend</p>
            <p className={`text-2xl font-bold ${monthData.trend_vs_previous >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthData.trend_vs_previous >= 0 ? '↗' : '↘'} {Math.abs(monthData.trend_vs_previous)}%
            </p>
            <p className="text-xs text-gray-500">vs last month</p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {WEEKDAY_NAMES.map(day => (
            <div key={day} className="p-2 text-center font-semibold text-sm text-gray-700 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Weeks */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200 last:border-b-0">
            {week.map((day, dayIndex) => {
              if (!day) {
                return <div key={`empty-${dayIndex}`} className="min-h-[100px] border-r border-gray-200 last:border-r-0 bg-gray-50"></div>
              }

              const isToday = format(new Date(), 'yyyy-MM-dd') === day.date
              const heatmapColor = getHeatmapColor(day.completion_percentage)

              return (
                <button
                  key={day.date}
                  onClick={() => handleDayClick(day.date)}
                  className={`
                    min-h-[100px] p-2 border-r border-gray-200 last:border-r-0 transition-all hover:shadow-inner
                    ${heatmapColor}
                    ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}
                  `}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                      {format(new Date(day.date), 'd')}
                    </span>
                    {day.has_perfect_completion && (
                      <span className="text-yellow-500 text-xs">⭐</span>
                    )}
                  </div>

                  {/* Task Info */}
                  {day.total_tasks > 0 && (
                    <div className="text-xs text-gray-700">
                      <p className="font-medium">{day.completed_tasks}/{day.total_tasks} tasks</p>
                      <p className="text-gray-600">{day.completion_percentage}%</p>
                    </div>
                  )}

                  {/* No tasks */}
                  {day.total_tasks === 0 && (
                    <p className="text-xs text-gray-400">No tasks</p>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Heat Map Legend */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <span className="text-gray-600">Completion:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 border border-gray-300 rounded"></div>
          <span className="text-gray-600">0%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span className="text-gray-600">25%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 rounded"></div>
          <span className="text-gray-600">50%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-300 rounded"></div>
          <span className="text-gray-600">75%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600">100%</span>
        </div>
      </div>
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders when parent re-renders
export const MonthlyCalendarView = memo(MonthlyCalendarViewComponent)
