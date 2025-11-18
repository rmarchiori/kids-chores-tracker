import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const QueryParamsSchema = z.object({
  child_id: z.string().uuid().optional(),
  task_id: z.string().uuid().optional(),
  status: z.enum(['pending', 'pending_review', 'completed', 'rejected']).optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
})

export async function GET(request: Request) {
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

    const familyIds = memberships.map(m => m.family_id)

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = QueryParamsSchema.safeParse({
      child_id: searchParams.get('child_id') || undefined,
      task_id: searchParams.get('task_id') || undefined,
      status: searchParams.get('status') || undefined,
      limit: searchParams.get('limit') || undefined,
    })

    if (!queryParams.success) {
      return NextResponse.json({ error: queryParams.error.errors }, { status: 400 })
    }

    const { child_id, task_id, status, limit } = queryParams.data

    // Build query
    let query = supabase
      .from('task_completions')
      .select(`
        id,
        task_id,
        child_id,
        completed_at,
        status,
        reviewed_by,
        reviewed_at,
        notes,
        tasks (
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
      .order('completed_at', { ascending: false })
      .limit(limit)

    // Filter by child_id if provided
    if (child_id) {
      query = query.eq('child_id', child_id)
    }

    // Filter by task_id if provided
    if (task_id) {
      query = query.eq('task_id', task_id)
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: completions, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter to only include completions from user's families
    const filteredCompletions = completions?.filter(c => {
      const task = c.tasks as any
      return task && !Array.isArray(task) && task.family_id && familyIds.includes(task.family_id)
    }) || []

    return NextResponse.json(filteredCompletions)
  } catch (error) {
    console.error('Error fetching completions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
