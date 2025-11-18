import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateTaskSchema } from '@/lib/schemas'
import { z } from 'zod'

// Type definitions for task with assignments
interface TaskAssignment {
  id: string
  child_id: string
  children: {
    id: string
    name: string
    age_group: string
  }
}

interface TaskWithAssignments {
  id: string
  title: string
  description?: string
  category: string
  priority: string
  due_date?: string
  recurring: boolean
  recurring_type?: string
  image_url?: string
  image_alt_text?: string
  image_source?: string
  family_id: string
  created_at: string
  updated_at?: string
  task_assignments?: TaskAssignment[]
}

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

    // Parse and validate query params
    const { searchParams } = new URL(request.url)
    const QueryParamsSchema = z.object({
      child_id: z.string().uuid().optional(),
      category: z.enum(['cleaning', 'homework', 'hygiene', 'outdoor', 'helping', 'meals', 'pets', 'bedtime', 'other']).optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
    })

    const queryParams = QueryParamsSchema.safeParse({
      child_id: searchParams.get('child_id') || undefined,
      category: searchParams.get('category') || undefined,
      priority: searchParams.get('priority') || undefined,
    })

    if (!queryParams.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryParams.error.errors },
        { status: 400 }
      )
    }

    const { child_id: childId, category, priority } = queryParams.data

    // Build query - optimize child filtering at database level
    let query = supabase
      .from('tasks')
      .select(`
        *,
        task_assignments!inner(
          id,
          child_id,
          children(id, name, age_group)
        )
      `)
      .eq('family_id', familyMember.family_id)
      .order('created_at', { ascending: false })

    // Apply filters at database level for better performance
    if (category) {
      query = query.eq('category', category)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }
    if (childId) {
      // Filter by child at database level using the inner join
      query = query.eq('task_assignments.child_id', childId)
    }

    const { data: tasks, error: tasksError } = await query

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError)
      throw tasksError
    }

    return NextResponse.json({ tasks: tasks as TaskWithAssignments[] })
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
      // Security: Validate that all assigned children belong to the user's family
      const { data: validChildren, error: childError } = await supabase
        .from('children')
        .select('id')
        .eq('family_id', familyMember.family_id)
        .in('id', assigned_children)

      if (childError || !validChildren || validChildren.length !== assigned_children.length) {
        // Delete the task since validation failed
        await supabase.from('tasks').delete().eq('id', task.id)
        return NextResponse.json(
          { error: 'Invalid child assignments: One or more children do not belong to your family' },
          { status: 400 }
        )
      }

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
