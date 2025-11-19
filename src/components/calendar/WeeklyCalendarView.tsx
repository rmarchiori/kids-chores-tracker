'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { format, addWeeks, subWeeks, startOfWeek } from 'date-fns'
import { useWeeklyCalendarData, getCompletionColor } from '@/lib/hooks/useCalendarData'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface WeeklyCalendarViewProps {
  familyId: string
  initialDate?: Date
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function WeeklyCalendarViewComponent({ familyId, initialDate = new Date() }: WeeklyCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(initialDate)
  const router = useRouter()

  const { data: weekData, isLoading, error } = useWeeklyCalendarData(currentDate, familyId)

  // Memoize callbacks to prevent unnecessary re-renders
  const handlePreviousWeek = useCallback(() => {
    setCurrentDate(prev => subWeeks(prev, 1))
  }, [])

  const handleNextWeek = useCallback(() => {
    setCurrentDate(prev => addWeeks(prev, 1))
  }, [])

  const handleTodayClick = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  const handleDayClick = useCallback((date: string) => {
    router.push(`/daily?date=${date}`)
  }, [router])

  // Memoize computed values
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 0 }), [currentDate])

  const isCurrentWeek = useMemo(
    () => format(weekStart, 'yyyy-MM-dd') === format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd'),
    [weekStart]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading weekly calendar...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Failed to load weekly calendar</p>
      </div>
    )
  }

  if (!weekData) return null

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const isCurrentWeek = format(weekStart, 'yyyy-MM-dd') === format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'yyyy-MM-dd')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {format(weekStart, 'MMMM d')} - {format(new Date(weekData.week_end), 'MMMM d, yyyy')}
          </h2>
          {isCurrentWeek && (
            <p className="text-sm text-blue-600 font-medium">Current Week</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousWeek}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Previous week"
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
            onClick={handleNextWeek}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Next week"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Week Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Tasks Completed</p>
            <p className="text-2xl font-bold text-gray-900">
              {weekData.completed_tasks}/{weekData.total_tasks}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {weekData.completion_percentage}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Best Day</p>
            <p className="text-lg font-semibold text-gray-900">
              {weekData.best_day ? format(new Date(weekData.best_day.date), 'EEEE') : 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              {weekData.best_day?.completion_percentage || 0}% complete
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Trend</p>
            <p className={`text-2xl font-bold ${weekData.trend_vs_previous >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {weekData.trend_vs_previous >= 0 ? '↗' : '↘'} {Math.abs(weekData.trend_vs_previous)}%
            </p>
            <p className="text-xs text-gray-500">vs last week</p>
          </div>
        </div>
      </div>

      {/* 7-Day Grid */}
      <div className="grid grid-cols-7 gap-4">
        {weekData.days.map((day, index) => {
          const isToday = format(new Date(), 'yyyy-MM-dd') === day.date
          const colorClass = getCompletionColor(day.completion_percentage)

          return (
            <button
              key={day.date}
              onClick={() => handleDayClick(day.date)}
              className={`
                relative p-4 rounded-lg border-2 transition-all hover:shadow-md
                ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}
              `}
            >
              {/* Day Name */}
              <div className="text-center mb-2">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  {WEEKDAY_NAMES[index]}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {format(new Date(day.date), 'd')}
                </p>
              </div>

              {/* Task Count */}
              <div className="mb-2">
                <p className="text-sm text-gray-600 text-center">
                  {day.total_tasks} {day.total_tasks === 1 ? 'task' : 'tasks'}
                </p>
              </div>

              {/* Completion Progress */}
              {day.total_tasks > 0 && (
                <>
                  {/* Circular Progress */}
                  <div className="flex justify-center mb-2">
                    <div className={`w-16 h-16 rounded-full ${colorClass} flex items-center justify-center`}>
                      <span className="text-lg font-bold">
                        {day.completion_percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="flex justify-center gap-1">
                    {day.has_perfect_completion && (
                      <span className="text-yellow-500" title="Perfect completion!">
                        ⭐
                      </span>
                    )}
                    {day.completed_tasks > 0 && !day.has_perfect_completion && (
                      <span className="text-blue-500" title="In progress">
                        ⏳
                      </span>
                    )}
                    {day.completed_tasks === 0 && day.total_tasks > 0 && (
                      <span className="text-gray-400" title="Not started">
                        ❌
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* No tasks indicator */}
              {day.total_tasks === 0 && (
                <div className="text-center text-gray-400 text-sm">
                  No tasks
                </div>
              )}

              {/* Today indicator */}
              {isToday && (
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-yellow-500">⭐</span>
          <span>100% completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blue-500">⏳</span>
          <span>In progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">❌</span>
          <span>Not started</span>
        </div>
      </div>
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders when parent re-renders
export const WeeklyCalendarView = memo(WeeklyCalendarViewComponent)
