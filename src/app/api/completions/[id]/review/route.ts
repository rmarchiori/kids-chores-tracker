import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const ReviewSchema = z.object({
  parent_rating: z.number().int().min(1).max(5),
  parent_feedback: z.string().min(1).max(1000),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const { parent_rating, parent_feedback } = ReviewSchema.parse(body)

    // Verify completion exists and user has access
    const { data: completion, error: completionError } = await supabase
      .from('task_completions')
      .select(`
        id,
        task_id,
        status,
        tasks!inner (
          id,
          family_id
        )
      `)
      .eq('id', params.id)
      .single()

    if (completionError || !completion) {
      return NextResponse.json({ error: 'Completion not found' }, { status: 404 })
    }

    // Verify user is member of this family with admin or parent role
    const { data: membership } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', (completion.tasks as any).family_id)
      .eq('user_id', session.user.id)
      .single()

    if (!membership || !['admin', 'parent'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify completion is pending review
    if (completion.status !== 'pending_review') {
      return NextResponse.json({ error: 'Completion is not pending review' }, { status: 400 })
    }

    // Update completion with parent review
    const { data: updatedCompletion, error: updateError } = await supabase
      .from('task_completions')
      .update({
        parent_rating,
        parent_feedback,
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString(),
        status: 'completed'
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updatedCompletion, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error reviewing completion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
