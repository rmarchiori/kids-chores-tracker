import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const ReviewSchema = z.object({
  parent_rating: z.number().int().min(1).max(5),
  parent_feedback: z.string().min(1).max(1000).transform(val => val.trim()),
})

interface CompletionWithTask {
  id: string
  task_id: string
  status: string
  version: number
  tasks: {
    id: string
    family_id: string
  }[]
}

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

    // Verify completion exists and user has access (get version for optimistic locking)
    const { data: completion, error: completionError } = await supabase
      .from('task_completions')
      .select(`
        id,
        task_id,
        status,
        version,
        tasks!inner (
          id,
          family_id
        )
      `)
      .eq('id', params.id)
      .returns<CompletionWithTask>()
      .single()

    if (completionError || !completion) {
      return NextResponse.json({ error: 'Resource not found or access denied' }, { status: 404 })
    }

    // Type assertion for completion with tasks relation
    const typedCompletion = completion as CompletionWithTask

    // Verify user is member of this family with admin or parent role
    const { data: membership } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', typedCompletion.tasks[0]?.family_id)
      .eq('user_id', session.user.id)
      .single()

    if (!membership || !['admin', 'parent'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify completion is pending review
    if (typedCompletion.status !== 'pending_review') {
      return NextResponse.json(
        { error: 'This task has already been reviewed' },
        { status: 409 }
      )
    }

    // Update completion with parent review using optimistic locking
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
      .eq('status', 'pending_review')  // Only update if still pending review
      .select('*, child_id')
      .single()

    if (updateError || !updatedCompletion) {
      return NextResponse.json(
        { error: 'Review conflict - task may have been reviewed by another parent' },
        { status: 409 }
      )
    }

    // Award points to the child
    try {
      // Get task priority
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('priority')
        .eq('id', updatedCompletion.task_id)
        .single()

      if (!taskError && task) {
        // Calculate base points by priority
        const basePoints: Record<string, number> = {
          low: 10,
          medium: 15,
          high: 20
        }
        const points = basePoints[task.priority] || 10

        // Quality bonus: avg rating >= 4.5 = +5 pts, >= 4.0 = +3 pts
        const avgRating = (parent_rating + (updatedCompletion as any).child_rating) / 2
        const qualityBonus = avgRating >= 4.5 ? 5 : avgRating >= 4.0 ? 3 : 0
        const totalPoints = points + qualityBonus

        // Get current child points
        const { data: child } = await supabase
          .from('children')
          .select('points')
          .eq('id', updatedCompletion.child_id)
          .single()

        const currentPoints = child?.points || 0

        // Update child points
        await supabase
          .from('children')
          .update({ points: currentPoints + totalPoints })
          .eq('id', updatedCompletion.child_id)

        // Record transaction
        await supabase
          .from('point_transactions')
          .insert({
            child_id: updatedCompletion.child_id,
            points: totalPoints,
            reason: `Completed task (${task.priority} priority, ${avgRating.toFixed(1)}⭐)`,
            type: 'task_completion',
            related_id: updatedCompletion.id
          })
      }
    } catch (pointsError) {
      // Log error but don't fail the review
      console.error('Error awarding points:', pointsError)
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
