import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateTaskImageSchema } from '@/lib/schemas'
import { z } from 'zod'

/**
 * PATCH /api/tasks/[id]/image
 * Update a task's image
 * Body: { image_url, image_alt_text, image_source }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Validate UUID format
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid task ID format' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const { image_url, image_alt_text, image_source } = UpdateTaskImageSchema.parse(body)

    // Verify task exists and user has access
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('family_id')
      .eq('id', id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Verify user is member of this family
    const { data: membership, error: memberError } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', task.family_id)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only parents and admins can update task images
    if (membership.role !== 'parent' && membership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only parents and admins can update task images' },
        { status: 403 }
      )
    }

    // Update task image
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({
        image_url,
        image_alt_text,
        image_source,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating task image:', updateError)
      throw updateError
    }

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error('Error in PATCH /api/tasks/[id]/image:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update task image' },
      { status: 500 }
    )
  }
}
