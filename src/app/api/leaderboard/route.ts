import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's family
    const { data: familyMember, error: memberError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (memberError || !familyMember) {
      return NextResponse.json(
        { error: 'Not a family member' },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get('timeframe') || 'weekly' // daily, weekly, monthly

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (timeframe) {
      case 'daily':
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'weekly':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break
      case 'monthly':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 30)
        break
      default:
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
    }

    // Get all children in the family with their completion counts
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('id, name, points, current_streak')
      .eq('family_id', familyMember.family_id)
      .order('name')

    if (childrenError) {
      throw childrenError
    }

    // Get completion counts for each child within the timeframe
    const leaderboardData = await Promise.all(
      (children || []).map(async (child) => {
        const { data: completions } = await supabase
          .from('task_completions')
          .select('id, completed_at, parent_rating')
          .eq('child_id', child.id)
          .eq('status', 'completed')
          .gte('completed_at', startDate.toISOString())

        const completionCount = completions?.length || 0
        const avgRating = completions && completions.length > 0
          ? completions.reduce((sum, c) => sum + (c.parent_rating || 0), 0) / completions.length
          : 0

        return {
          child_id: child.id,
          name: child.name,
          points: child.points || 0,
          current_streak: child.current_streak || 0,
          completion_count: completionCount,
          avg_rating: Math.round(avgRating * 10) / 10
        }
      })
    )

    // Sort by completion count (primary) and points (secondary)
    leaderboardData.sort((a, b) => {
      if (b.completion_count !== a.completion_count) {
        return b.completion_count - a.completion_count
      }
      return b.points - a.points
    })

    // Add rank
    const rankedData = leaderboardData.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))

    return NextResponse.json({
      timeframe,
      data: rankedData
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
