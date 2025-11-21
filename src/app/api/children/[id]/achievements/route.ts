import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAchievements, unlockAchievements } from '@/lib/utils/achievement-checker'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  _request: Request,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient()
    const { id: childId } = await params

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get child and verify access
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, name, family_id')
      .eq('id', childId)
      .single()

    if (childError || !child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      )
    }

    // Verify user has access to this family
    const { data: familyMember, error: memberError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .eq('family_id', child.family_id)
      .single()

    if (memberError || !familyMember) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get all unlocked achievements for this child
    const { data: unlockedAchievements, error: unlockedError } = await supabase
      .from('child_achievements')
      .select(`
        achievement_id,
        unlocked_at,
        achievements (*)
      `)
      .eq('child_id', childId)

    if (unlockedError) {
      throw unlockedError
    }

    // Get achievement progress
    const checks = await checkAchievements(childId)

    // Combine unlocked achievements with their full details
    const unlocked = unlockedAchievements?.map(ua => ({
      ...(ua.achievements as any),
      unlocked_at: ua.unlocked_at
    })) || []

    return NextResponse.json({
      unlocked,
      progress: checks
    })
  } catch (error) {
    console.error('Error fetching child achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}

export async function POST(
  _request: Request,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient()
    const { id: childId } = await params

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get child and verify access
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, family_id')
      .eq('id', childId)
      .single()

    if (childError || !child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      )
    }

    // Verify user has access to this family
    const { data: familyMember, error: memberError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .eq('family_id', child.family_id)
      .single()

    if (memberError || !familyMember) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check and unlock new achievements
    const newlyUnlocked = await unlockAchievements(childId)

    return NextResponse.json({
      newly_unlocked: newlyUnlocked,
      count: newlyUnlocked.length
    })
  } catch (error) {
    console.error('Error checking achievements:', error)
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    )
  }
}
