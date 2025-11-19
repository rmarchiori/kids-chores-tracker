import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subWeeks } from 'date-fns'

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
    const dateParam = searchParams.get('date')
    const familyId = searchParams.get('familyId')

    if (!dateParam || !familyId) {
      return NextResponse.json(
        { error: 'Missing required parameters: date and familyId' },
        { status: 400 }
      )
    }

    const baseDate = new Date(dateParam)
    const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(baseDate, { weekStartsOn: 0 })

    // Get all days in the week
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

    // Fetch task completions for the week
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
      .gte('completed_at', format(weekStart, 'yyyy-MM-dd'))
      .lte('completed_at', format(weekEnd, 'yyyy-MM-dd'))

    if (completionsError) {
      console.error('Error fetching completions:', completionsError)
      throw completionsError
    }

    // Fetch all tasks for the family in this period
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, due_date, recurring')
      .eq('family_id', familyId)

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError)
      throw tasksError
    }

    // Calculate metrics per day
    const daysData = daysInWeek.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')

      // Count completions for this day
      const dayCompletions = completions?.filter(c => {
        const completedDate = format(new Date(c.completed_at), 'yyyy-MM-dd')
        return completedDate === dayStr && (c.status === 'completed' || c.status === 'pending_review')
      }) || []

      // Estimate total tasks for the day (due tasks + recurring tasks)
      const dueTasks = tasks?.filter(t => {
        if (t.due_date) {
          return format(new Date(t.due_date), 'yyyy-MM-dd') === dayStr
        }
        return t.recurring // Recurring tasks count every day
      }) || []

      const totalTasks = dueTasks.length
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

    // Calculate week summary
    const totalTasks = daysData.reduce((sum, day) => sum + day.total_tasks, 0)
    const completedTasks = daysData.reduce((sum, day) => sum + day.completed_tasks, 0)
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Find best day
    const bestDay = daysData.reduce((best, current) => {
      if (!best || current.completion_percentage > best.completion_percentage) {
        return current
      }
      return best
    }, daysData[0])

    // Calculate trend vs previous week
    const prevWeekStart = subWeeks(weekStart, 1)
    const prevWeekEnd = subWeeks(weekEnd, 1)

    const { data: prevCompletions } = await supabase
      .from('task_completions')
      .select(`
        id,
        tasks!inner(family_id)
      `)
      .eq('tasks.family_id', familyId)
      .gte('completed_at', format(prevWeekStart, 'yyyy-MM-dd'))
      .lte('completed_at', format(prevWeekEnd, 'yyyy-MM-dd'))
      .in('status', ['completed', 'pending_review'])

    const prevCompletedCount = prevCompletions?.length || 0
    const trendVsPrevious = prevCompletedCount > 0
      ? Math.round(((completedTasks - prevCompletedCount) / prevCompletedCount) * 100)
      : 0

    const weekData = {
      week_start: format(weekStart, 'yyyy-MM-dd'),
      week_end: format(weekEnd, 'yyyy-MM-dd'),
      days: daysData,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      completion_percentage: completionPercentage,
      best_day: bestDay,
      trend_vs_previous: trendVsPrevious
    }

    return NextResponse.json(weekData)
  } catch (error) {
    console.error('Error in GET /api/calendar/weekly:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weekly calendar data' },
      { status: 500 }
    )
  }
}
