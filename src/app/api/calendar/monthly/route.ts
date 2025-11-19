import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, subMonths } from 'date-fns'
import { doesTaskOccurOnDate } from '@/lib/utils/rrule-generator'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')
    const familyId = searchParams.get('familyId')

    if (!yearParam || !monthParam || !familyId) {
      return NextResponse.json(
        { error: 'Missing required parameters: year, month, and familyId' },
        { status: 400 }
      )
    }

    const year = parseInt(yearParam)
    const month = parseInt(monthParam)
    const baseDate = new Date(year, month - 1, 1)
    const monthStart = startOfMonth(baseDate)
    const monthEnd = endOfMonth(baseDate)

    // Get all days in the month
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Fetch task completions for the month
    const { data: completions, error: completionsError } = await supabase
      .from('task_completions')
      .select(`
        id,
        task_id,
        completed_at,
        status,
        tasks!inner(
          id,
          family_id
        )
      `)
      .eq('tasks.family_id', familyId)
      .gte('completed_at', format(monthStart, 'yyyy-MM-dd'))
      .lte('completed_at', format(monthEnd, 'yyyy-MM-dd'))

    if (completionsError) {
      console.error('Error fetching completions:', completionsError)
      throw completionsError
    }

    // Fetch all tasks for the family with RRULE information
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, due_date, recurring, rrule, created_at')
      .eq('family_id', familyId)

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError)
      throw tasksError
    }

    // Calculate metrics per day
    const daysData = daysInMonth.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')

      // Count completions for this day
      const dayCompletions = completions?.filter(c => {
        const completedDate = format(new Date(c.completed_at), 'yyyy-MM-dd')
        return completedDate === dayStr && (c.status === 'completed' || c.status === 'pending_review')
      }) || []

      // Count total tasks for the day using RRULE logic
      const tasksForDay = tasks?.filter(t => {
        // Non-recurring tasks: check if due_date matches
        if (!t.recurring && t.due_date) {
          return format(new Date(t.due_date), 'yyyy-MM-dd') === dayStr
        }

        // Recurring tasks: use RRULE to determine if task occurs on this day
        if (t.recurring && t.rrule) {
          return doesTaskOccurOnDate(t.rrule, day, t.created_at ? new Date(t.created_at) : undefined)
        }

        return false
      }) || []

      const totalTasks = tasksForDay.length
      const completedTasks = dayCompletions.length
      const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      return {
        date: dayStr,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        completion_percentage: completionPercentage,
        has_perfect_completion: totalTasks > 0 && completedTasks === totalTasks
      }
    })

    // Calculate month summary
    const totalTasks = daysData.reduce((sum, day) => sum + day.total_tasks, 0)
    const completedTasks = daysData.reduce((sum, day) => sum + day.completed_tasks, 0)
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Count perfect days
    const perfectDaysCount = daysData.filter(day => day.has_perfect_completion).length

    // Calculate average daily completion rate
    const daysWithTasks = daysData.filter(day => day.total_tasks > 0)
    const averageDailyCompletionRate = daysWithTasks.length > 0
      ? Math.round(daysWithTasks.reduce((sum, day) => sum + day.completion_percentage, 0) / daysWithTasks.length)
      : 0

    // Calculate trend vs previous month
    const prevMonthStart = subMonths(monthStart, 1)
    const prevMonthEnd = subMonths(monthEnd, 1)

    const { data: prevCompletions } = await supabase
      .from('task_completions')
      .select(`
        id,
        tasks!inner(family_id)
      `)
      .eq('tasks.family_id', familyId)
      .gte('completed_at', format(prevMonthStart, 'yyyy-MM-dd'))
      .lte('completed_at', format(prevMonthEnd, 'yyyy-MM-dd'))
      .in('status', ['completed', 'pending_review'])

    const prevCompletedCount = prevCompletions?.length || 0
    const trendVsPrevious = prevCompletedCount > 0
      ? Math.round(((completedTasks - prevCompletedCount) / prevCompletedCount) * 100)
      : 0

    const monthData = {
      month: format(baseDate, 'yyyy-MM'),
      days: daysData,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      completion_percentage: completionPercentage,
      perfect_days_count: perfectDaysCount,
      average_daily_completion_rate: averageDailyCompletionRate,
      trend_vs_previous: trendVsPrevious
    }

    return NextResponse.json(monthData)
  } catch (error) {
    console.error('Error in GET /api/calendar/monthly:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monthly calendar data' },
      { status: 500 }
    )
  }
}
