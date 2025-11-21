import { createClient } from '@/lib/supabase/server'

export interface AchievementCheck {
  achievement_id: string
  unlocked: boolean
  progress?: number
  total?: number
}

/**
 * Check which achievements a child has unlocked based on their completion history
 */
export async function checkAchievements(childId: string): Promise<AchievementCheck[]> {
  const supabase = await createClient()

  // Get all available achievements
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .order('category, requirement_value')

  if (!achievements) return []

  // Get child's completion stats
  const stats = await getChildStats(childId)

  // Check each achievement
  const checks: AchievementCheck[] = []

  for (const achievement of achievements) {
    const check = await evaluateAchievement(achievement, stats, childId)
    checks.push(check)
  }

  return checks
}

async function getChildStats(childId: string) {
  const supabase = await createClient()

  // Get all completed tasks
  const { data: completions } = await supabase
    .from('task_completions')
    .select('completed_at, parent_rating, child_rating')
    .eq('child_id', childId)
    .eq('status', 'completed')

  const total = completions?.length || 0

  // Calculate streak stats
  const streak = calculateCurrentStreak(completions || [])

  // Get 5-star ratings count
  const fiveStarCount = completions?.filter(c =>
    c.parent_rating === 5 && c.child_rating === 5
  ).length || 0

  // Weekly completion counts
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const weeklyCount = completions?.filter(c =>
    new Date(c.completed_at) >= oneWeekAgo
  ).length || 0

  // Monthly completion counts
  const oneMonthAgo = new Date()
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30)
  const monthlyCount = completions?.filter(c =>
    new Date(c.completed_at) >= oneMonthAgo
  ).length || 0

  return {
    total,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    fiveStarCount,
    weeklyCount,
    monthlyCount,
    completions: completions || []
  }
}

function calculateCurrentStreak(completions: any[]): { current: number; longest: number } {
  if (completions.length === 0) return { current: 0, longest: 0 }

  // Sort by date descending
  const sorted = completions
    .map(c => new Date(c.completed_at))
    .sort((a, b) => b.getTime() - a.getTime())

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 1

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check if there's a completion today or yesterday (streak is active)
  const mostRecent = sorted[0]
  if (!mostRecent) {
    return { current: 0, longest: 0 }
  }

  const daysSinceLastCompletion = Math.floor(
    (today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceLastCompletion <= 1) {
    currentStreak = 1

    // Count consecutive days
    for (let i = 0; i < sorted.length - 1; i++) {
      const currentDate = sorted[i]
      const nextDate = sorted[i + 1]
      if (!currentDate || !nextDate) continue

      const current = new Date(currentDate)
      const next = new Date(nextDate)
      current.setHours(0, 0, 0, 0)
      next.setHours(0, 0, 0, 0)

      const dayDiff = Math.floor(
        (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (dayDiff === 1) {
        currentStreak++
        tempStreak++
      } else if (dayDiff === 0) {
        // Same day, continue
        continue
      } else {
        break
      }

      longestStreak = Math.max(longestStreak, tempStreak)
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak)

  return { current: currentStreak, longest: longestStreak }
}

async function evaluateAchievement(
  achievement: any,
  stats: any,
  childId: string
): Promise<AchievementCheck> {
  const { id, requirement_type, requirement_value } = achievement

  let unlocked = false
  let progress = 0
  let total = requirement_value

  switch (requirement_type) {
    case 'total_tasks':
      progress = stats.total
      unlocked = stats.total >= requirement_value
      break

    case 'weekly_tasks':
      progress = stats.weeklyCount
      unlocked = stats.weeklyCount >= requirement_value
      break

    case 'monthly_tasks':
      progress = stats.monthlyCount
      unlocked = stats.monthlyCount >= requirement_value
      break

    case 'streak_days':
      progress = stats.currentStreak
      unlocked = stats.currentStreak >= requirement_value
      break

    case 'five_star_count':
      progress = stats.fiveStarCount
      unlocked = stats.fiveStarCount >= requirement_value
      break

    case 'perfect_week':
      unlocked = await checkPerfectWeek(childId)
      total = 1
      progress = unlocked ? 1 : 0
      break

    case 'perfect_month':
      unlocked = await checkPerfectMonth(childId)
      total = 1
      progress = unlocked ? 1 : 0
      break

    default:
      break
  }

  return {
    achievement_id: id,
    unlocked,
    progress,
    total
  }
}

async function checkPerfectWeek(childId: string): Promise<boolean> {
  const supabase = await createClient()

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  // Get all assigned tasks in the past week
  const { data: assignments } = await supabase
    .from('task_assignments')
    .select('task_id')
    .eq('child_id', childId)

  if (!assignments || assignments.length === 0) return false

  // Get completions in the past week
  const { data: completions } = await supabase
    .from('task_completions')
    .select('task_id')
    .eq('child_id', childId)
    .eq('status', 'completed')
    .gte('completed_at', oneWeekAgo.toISOString())

  // All assigned tasks should be completed
  return (completions?.length || 0) >= assignments.length
}

async function checkPerfectMonth(childId: string): Promise<boolean> {
  const supabase = await createClient()

  const oneMonthAgo = new Date()
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30)

  // Get all assigned tasks in the past month
  const { data: assignments } = await supabase
    .from('task_assignments')
    .select('task_id')
    .eq('child_id', childId)

  if (!assignments || assignments.length === 0) return false

  // Get completions in the past month
  const { data: completions } = await supabase
    .from('task_completions')
    .select('task_id')
    .eq('child_id', childId)
    .eq('status', 'completed')
    .gte('completed_at', oneMonthAgo.toISOString())

  // All assigned tasks should be completed
  return (completions?.length || 0) >= assignments.length
}

/**
 * Unlock achievements for a child and return newly unlocked ones
 */
export async function unlockAchievements(childId: string): Promise<string[]> {
  const supabase = await createClient()

  const checks = await checkAchievements(childId)
  const newlyUnlocked: string[] = []

  // Get currently unlocked achievements
  const { data: current } = await supabase
    .from('child_achievements')
    .select('achievement_id')
    .eq('child_id', childId)

  const currentIds = new Set(current?.map(c => c.achievement_id) || [])

  // Unlock new achievements
  for (const check of checks) {
    if (check.unlocked && !currentIds.has(check.achievement_id)) {
      const { error } = await supabase
        .from('child_achievements')
        .insert({
          child_id: childId,
          achievement_id: check.achievement_id,
          unlocked_at: new Date().toISOString()
        })

      if (!error) {
        newlyUnlocked.push(check.achievement_id)
      }
    }
  }

  return newlyUnlocked
}
