import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const CompleteTaskSchema = z.object({
  child_id: z.string().uuid(),
  child_rating: z.number().int().min(1).max(5),
  child_notes: z.string().max(500).optional(),
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
    const { child_id, child_rating, child_notes } = CompleteTaskSchema.parse(body)

    // Verify task exists and user has access
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('family_id')
      .eq('id', params.id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Verify user is member of this family
    const { data: membership } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', task.family_id)
      .eq('user_id', session.user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify child belongs to this family
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('id', child_id)
      .eq('family_id', task.family_id)
      .single()

    if (!child) {
      return NextResponse.json({ error: 'Child not found in this family' }, { status: 404 })
    }

    // Check if task was already completed today to prevent duplicates
    const today = new Date().toISOString().split('T')[0]
    const { data: existingCompletion } = await supabase
      .from('task_completions')
      .select('id')
      .eq('task_id', params.id)
      .eq('child_id', child_id)
      .gte('completed_at', `${today}T00:00:00Z`)
      .lte('completed_at', `${today}T23:59:59Z`)
      .maybeSingle()

    if (existingCompletion) {
      return NextResponse.json(
        { error: 'Task already completed today' },
        { status: 409 }
      )
    }

    // Create completion record with rating (status: pending_review)
    const { data: completion, error: completionError } = await supabase
      .from('task_completions')
      .insert({
        task_id: params.id,
        child_id,
        status: 'pending_review',
        child_rating,
        child_notes: child_notes && child_notes.trim() !== '' ? child_notes.trim() : null,
        completed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (completionError) {
      return NextResponse.json({ error: completionError.message }, { status: 500 })
    }

    return NextResponse.json(completion, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error completing task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
