import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UpdateTaskSchema } from '@/lib/schemas'
import { z } from 'zod'

/**
 * GET /api/tasks/[id]
 * Get a specific task by ID
 */
export async function GET(
  _request: Request,
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

    // Get user's family member record
    const { data: familyMember, error: memberError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (memberError) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 })
    }

    // Get task with assignments
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(`
        *,
        task_assignments(
          id,
          child_id,
          children(id, name, age_group)
        )
      `)
      .eq('id', id)
      .eq('family_id', familyMember.family_id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/tasks/[id]
 * Update a task's information
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

    // Get user's family member record
    const { data: familyMember, error: memberError } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', user.id)
      .single()

    if (memberError) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 })
    }

    // Only parents and admins can update tasks
    if (familyMember.role !== 'parent' && familyMember.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only parents and admins can update tasks' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const { assigned_children, ...taskData } = UpdateTaskSchema.parse(body)

    // Update task
    const { data: task, error: updateError } = await supabase
      .from('tasks')
      .update({
        ...taskData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('family_id', familyMember.family_id)
      .select()
      .single()

    if (updateError || !task) {
      return NextResponse.json(
        { error: 'Task not found or update failed' },
        { status: 404 }
      )
    }

    // Handle assignment updates if provided
    if (assigned_children !== undefined) {
      if (assigned_children.length > 0) {
        // Security: Validate that all assigned children belong to the user's family
        const { data: validChildren, error: childError } = await supabase
          .from('children')
          .select('id')
          .eq('family_id', familyMember.family_id)
          .in('id', assigned_children)

        if (childError || !validChildren || validChildren.length !== assigned_children.length) {
          return NextResponse.json(
            { error: 'Invalid child assignments: One or more children do not belong to your family' },
            { status: 400 }
          )
        }
      }

      // Delete existing assignments
      await supabase
        .from('task_assignments')
        .delete()
        .eq('task_id', id)

      // Create new assignments
      if (assigned_children.length > 0) {
        const assignments = assigned_children.map(childId => ({
          task_id: id,
          child_id: childId,
        }))

        await supabase
          .from('task_assignments')
          .insert(assignments)
      }
    }

    // Fetch task with updated assignments
    const { data: taskWithAssignments, error: fetchError } = await supabase
      .from('tasks')
      .select(`
        *,
        task_assignments(
          id,
          child_id,
          children(id, name, age_group)
        )
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      // Return task without assignments if fetch fails
      return NextResponse.json({ task })
    }

    return NextResponse.json({ task: taskWithAssignments })
  } catch (error) {
    console.error('Error updating task:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task (cascade deletes assignments and completions)
 */
export async function DELETE(
  _request: Request,
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

    // Get user's family member record
    const { data: familyMember, error: memberError } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', user.id)
      .single()

    if (memberError) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 })
    }

    // Only parents and admins can delete tasks
    if (familyMember.role !== 'parent' && familyMember.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only parents and admins can delete tasks' },
        { status: 403 }
      )
    }

    // Delete task (cascade will handle assignments and completions)
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('family_id', familyMember.family_id)

    if (deleteError) {
      console.error('Error deleting task:', deleteError)
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/tasks/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
