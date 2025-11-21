import { createClient } from '@/lib/supabase/server'

interface StreakData {
  current_streak: number
  longest_streak: number
  last_completion_date: string | null
}

/**
 * Update a child's streak based on a new task completion
 */
export async function updateStreak(childId: string): Promise<StreakData> {
  const supabase = await createClient()

  // Get child's current streak data
  const { data: child } = await supabase
    .from('children')
    .select('current_streak, longest_streak, last_completion_date')
    .eq('id', childId)
    .single()

  if (!child) {
    throw new Error('Child not found')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastCompletionDate = child.last_completion_date
    ? new Date(child.last_completion_date)
    : null

  if (lastCompletionDate) {
    lastCompletionDate.setHours(0, 0, 0, 0)
  }

  let currentStreak = child.current_streak || 0
  let longestStreak = child.longest_streak || 0

  if (!lastCompletionDate) {
    // First ever completion
    currentStreak = 1
  } else {
    const daysSinceLastCompletion = Math.floor(
      (today.getTime() - lastCompletionDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceLastCompletion === 0) {
      // Completed today already, no change to streak
    } else if (daysSinceLastCompletion === 1) {
      // Completed yesterday, increment streak
      currentStreak++
    } else {
      // Streak broken, reset to 1
      currentStreak = 1
    }
  }

  // Update longest streak if current is higher
  longestStreak = Math.max(longestStreak, currentStreak)

  // Update child record
  const { error } = await supabase
    .from('children')
    .update({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_completion_date: today.toISOString()
    })
    .eq('id', childId)

  if (error) {
    throw error
  }

  return {
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_completion_date: today.toISOString()
  }
}

/**
 * Get a child's current streak information
 */
export async function getStreak(childId: string): Promise<StreakData> {
  const supabase = await createClient()

  const { data: child } = await supabase
    .from('children')
    .select('current_streak, longest_streak, last_completion_date')
    .eq('id', childId)
    .single()

  if (!child) {
    throw new Error('Child not found')
  }

  return {
    current_streak: child.current_streak || 0,
    longest_streak: child.longest_streak || 0,
    last_completion_date: child.last_completion_date
  }
}

/**
 * Check if a streak is active (completed today or yesterday)
 */
export function isStreakActive(lastCompletionDate: string | null): boolean {
  if (!lastCompletionDate) return false

  const lastDate = new Date(lastCompletionDate)
  lastDate.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysSince = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  return daysSince <= 1
}
