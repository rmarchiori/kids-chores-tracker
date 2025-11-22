import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(
  request: Request,
  { params }: RouteParams
) {
  try {
    const supabase = createClient()
    const { id: rewardId } = await params
    const body = await request.json()
    const { child_id } = body

    if (!child_id) {
      return NextResponse.json(
        { error: 'child_id is required' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get reward details
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('*, family_id')
      .eq('id', rewardId)
      .eq('active', true)
      .single()

    if (rewardError || !reward) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      )
    }

    // Verify user has access to this family
    const { data: familyMember, error: memberError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .eq('family_id', reward.family_id)
      .single()

    if (memberError || !familyMember) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get child and verify they belong to this family
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, points, family_id')
      .eq('id', child_id)
      .eq('family_id', reward.family_id)
      .single()

    if (childError || !child) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      )
    }

    // Check if child has enough points
    const currentPoints = child.points || 0
    if (currentPoints < reward.points_cost) {
      return NextResponse.json(
        { error: 'Insufficient points' },
        { status: 400 }
      )
    }

    // Deduct points
    const newPoints = currentPoints - reward.points_cost
    const { error: updateError } = await supabase
      .from('children')
      .update({ points: newPoints })
      .eq('id', child_id)

    if (updateError) {
      throw updateError
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from('point_transactions')
      .insert({
        child_id: child_id,
        points: -reward.points_cost,
        reason: `Redeemed: ${reward.name}`,
        type: 'redemption',
        related_id: rewardId
      })

    if (transactionError) {
      throw transactionError
    }

    return NextResponse.json({
      success: true,
      new_points: newPoints,
      redeemed_reward: reward.name
    })
  } catch (error) {
    console.error('Error redeeming reward:', error)
    return NextResponse.json(
      { error: 'Failed to redeem reward' },
      { status: 500 }
    )
  }
}
