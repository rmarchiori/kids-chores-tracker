'use client'

import { useQuery } from '@tanstack/react-query'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'

export interface DayData {
  date: string // ISO date string
  total_tasks: number
  completed_tasks: number
  completion_percentage: number
  has_perfect_completion: boolean
}

export interface WeekData {
  week_start: string
  week_end: string
  days: DayData[]
  total_tasks: number
  completed_tasks: number
  completion_percentage: number
  best_day: DayData | null
  trend_vs_previous: number // percentage change
}

export interface MonthData {
  month: string // "2025-01"
  days: DayData[]
  total_tasks: number
  completed_tasks: number
  completion_percentage: number
  perfect_days_count: number
  average_daily_completion_rate: number
  trend_vs_previous: number
}

/**
 * Fetch weekly calendar data
 */
export function useWeeklyCalendarData(date: Date, familyId: string) {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 }) // Sunday
  const weekEnd = endOfWeek(date, { weekStartsOn: 0 })

  return useQuery<WeekData>({
    queryKey: ['calendar', 'weekly', format(weekStart, 'yyyy-MM-dd'), familyId],
    queryFn: async () => {
      const response = await fetch(
        `/api/calendar/weekly?date=${format(weekStart, 'yyyy-MM-dd')}&familyId=${familyId}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch weekly calendar data')
      }
      return response.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}

/**
 * Fetch monthly calendar data
 */
export function useMonthlyCalendarData(year: number, month: number, familyId: string) {
  return useQuery<MonthData>({
    queryKey: ['calendar', 'monthly', `${year}-${month}`, familyId],
    queryFn: async () => {
      const response = await fetch(
        `/api/calendar/monthly?year=${year}&month=${month}&familyId=${familyId}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch monthly calendar data')
      }
      return response.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}

/**
 * Get color for completion percentage
 */
export function getCompletionColor(percentage: number): string {
  if (percentage === 0) return 'bg-gray-100 text-gray-400'
  if (percentage < 50) return 'bg-red-100 text-red-700'
  if (percentage < 80) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}

/**
 * Get intensity color for heat map
 */
export function getHeatmapColor(percentage: number): string {
  if (percentage === 0) return 'bg-gray-50'
  if (percentage < 25) return 'bg-green-100'
  if (percentage < 50) return 'bg-green-200'
  if (percentage < 75) return 'bg-green-300'
  if (percentage < 100) return 'bg-green-400'
  return 'bg-green-500' // 100%
}
