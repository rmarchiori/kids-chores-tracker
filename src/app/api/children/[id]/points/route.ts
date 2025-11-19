import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      .select('id, name, points, family_id')
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

    // Get transaction history
    const { data: transactions, error: transactionsError } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (transactionsError) {
      throw transactionsError
    }

    return NextResponse.json({
      child: {
        id: child.id,
        name: child.name,
        points: child.points || 0
      },
      transactions: transactions || []
    })
  } catch (error) {
    console.error('Error fetching child points:', error)
    return NextResponse.json(
      { error: 'Failed to fetch points data' },
      { status: 500 }
    )
  }
}
