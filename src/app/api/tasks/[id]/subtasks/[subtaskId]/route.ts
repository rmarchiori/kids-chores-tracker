import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{
    id: string
    subtaskId: string
  }>
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient()
    const { id: taskId, subtaskId } = await params

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user has access to this task's family
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('family_id')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    const { data: familyMember, error: memberError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .eq('family_id', task.family_id)
      .single()

    if (memberError || !familyMember) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete the subtask
    const { error: deleteError } = await supabase
      .from('task_subtasks')
      .delete()
      .eq('id', subtaskId)
      .eq('task_id', taskId)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting subtask:', error)
    return NextResponse.json(
      { error: 'Failed to delete subtask' },
      { status: 500 }
    )
  }
}
