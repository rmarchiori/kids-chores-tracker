import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const SubtaskCreateSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  order_index: z.number().int().min(0).optional()
})

/**
 * GET /api/tasks/[id]/subtasks
 * Get all subtasks for a task
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const taskId = params.id

    // Verify user has access to this task
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch subtasks
    const { data: subtasks, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching subtasks:', error)
      throw error
    }

    return NextResponse.json({ subtasks })
  } catch (error) {
    console.error('Error in GET /api/tasks/[id]/subtasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subtasks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tasks/[id]/subtasks
 * Create a new subtask for a task
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const taskId = params.id

    // Verify user has access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = SubtaskCreateSchema.parse(body)

    // Get next order_index if not provided
    let orderIndex = validatedData.order_index ?? 0
    if (validatedData.order_index === undefined) {
      const { data: existingSubtasks } = await supabase
        .from('subtasks')
        .select('order_index')
        .eq('task_id', taskId)
        .order('order_index', { ascending: false })
        .limit(1)

      if (existingSubtasks && existingSubtasks.length > 0) {
        orderIndex = (existingSubtasks[0].order_index || 0) + 1
      }
    }

    // Create subtask
    const { data: subtask, error } = await supabase
      .from('subtasks')
      .insert({
        task_id: taskId,
        title: validatedData.title,
        description: validatedData.description,
        order_index: orderIndex,
        completed: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating subtask:', error)
      throw error
    }

    return NextResponse.json({ subtask }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/tasks/[id]/subtasks:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create subtask' },
      { status: 500 }
    )
  }
}
