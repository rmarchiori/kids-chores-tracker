import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
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

    // Get active rewards for the family
    const { data: rewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('*')
      .eq('family_id', familyMember.family_id)
      .eq('active', true)
      .order('points_cost', { ascending: true })

    if (rewardsError) {
      throw rewardsError
    }

    return NextResponse.json({ rewards: rewards || [] })
  } catch (error) {
    console.error('Error fetching rewards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    // Get user's family and verify they're a parent
    const { data: familyMember, error: memberError } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', user.id)
      .single()

    if (memberError || !familyMember) {
      return NextResponse.json(
        { error: 'Not a family member' },
        { status: 403 }
      )
    }

    if (familyMember.role !== 'admin' && familyMember.role !== 'parent') {
      return NextResponse.json(
        { error: 'Only parents can create rewards' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, points_cost, category } = body

    // Validate input
    if (!name || typeof points_cost !== 'number' || points_cost < 1) {
      return NextResponse.json(
        { error: 'Invalid reward data' },
        { status: 400 }
      )
    }

    // Create reward
    const { data: reward, error: createError } = await supabase
      .from('rewards')
      .insert({
        family_id: familyMember.family_id,
        name,
        description: description || '',
        points_cost,
        category: category || 'other',
        active: true
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return NextResponse.json({ reward }, { status: 201 })
  } catch (error) {
    console.error('Error creating reward:', error)
    return NextResponse.json(
      { error: 'Failed to create reward' },
      { status: 500 }
    )
  }
}
