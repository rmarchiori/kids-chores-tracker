import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateTaskSchema, TaskSchema } from '@/lib/schemas'
import { z } from 'zod'

/**
 * GET /api/tasks
 * Get all tasks for the current user's family
 * Query params:
 *  - child_id: Filter tasks by assigned child
 *  - category: Filter by category
 *  - priority: Filter by priority
 */
export async function GET(request: Request) {
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('child_id')
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')

    // Build query
    let query = supabase
      .from('tasks')
      .select(`
        *,
        task_assignments(
          id,
          child_id,
          children(id, name, age_group)
        )
      `)
      .eq('family_id', familyMember.family_id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }

    const { data: tasks, error: tasksError } = await query

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError)
      throw tasksError
    }

    // Filter by child_id if provided (post-query since it's in a relation)
    let filteredTasks = tasks
    if (childId) {
      filteredTasks = tasks.filter(task =>
        task.task_assignments?.some((assignment: any) => assignment.child_id === childId)
      )
    }

    return NextResponse.json({ tasks: filteredTasks })
  } catch (error) {
    console.error('Error in GET /api/tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tasks
 * Create a new task for the current user's family
 * Body: CreateTaskSchema
 */
export async function POST(request: Request) {
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

    // Only parents and admins can create tasks
    if (familyMember.role !== 'parent' && familyMember.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only parents and admins can create tasks' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const { assigned_children, ...taskData } = CreateTaskSchema.parse(body)

    // Create task
    const { data: task, error: createError } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        family_id: familyMember.family_id,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating task:', createError)
      throw createError
    }

    // Create task assignments if children are assigned
    if (assigned_children && assigned_children.length > 0) {
      const assignments = assigned_children.map(childId => ({
        task_id: task.id,
        child_id: childId,
      }))

      const { error: assignmentError } = await supabase
        .from('task_assignments')
        .insert(assignments)

      if (assignmentError) {
        console.error('Error creating task assignments:', assignmentError)
        // Don't fail the whole operation, task was created successfully
      }
    }

    // Fetch task with assignments
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
      .eq('id', task.id)
      .single()

    if (fetchError) {
      // Return task without assignments if fetch fails
      return NextResponse.json({ task }, { status: 201 })
    }

    return NextResponse.json({ task: taskWithAssignments }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/tasks:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
