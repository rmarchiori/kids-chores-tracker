import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's family membership
    const { data: memberships } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', session.user.id)

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ error: 'No family membership found' }, { status: 403 })
    }

    // Only parents and admins can review tasks
    if (!memberships.some(m => ['admin', 'parent'].includes(m.role))) {
      return NextResponse.json({ error: 'Forbidden - Only parents can review tasks' }, { status: 403 })
    }

    const familyIds = memberships.map(m => m.family_id)

    // Fetch pending reviews with all rating columns
    const { data: pendingReviews, error } = await supabase
      .from('task_completions')
      .select(`
        id,
        task_id,
        child_id,
        completed_at,
        status,
        child_rating,
        child_notes,
        tasks!inner (
          id,
          title,
          description,
          category,
          priority,
          image_url,
          image_alt_text,
          image_source,
          family_id
        ),
        children (
          id,
          name,
          age_group,
          profile_photo_url
        )
      `)
      .in('tasks.family_id', familyIds)
      .eq('status', 'pending_review')
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending reviews:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(pendingReviews || [], { status: 200 })
  } catch (error) {
    console.error('Error in pending reviews endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
