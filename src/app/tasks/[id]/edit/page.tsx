'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { TaskForm } from '@/components/tasks/TaskForm'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/hooks/useTranslation'
import type { Child } from '@/lib/schemas'

interface EditTaskPageProps {
  params: Promise<{ id: string }>
}

export default function EditTaskPage({ params }: EditTaskPageProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const supabase = createClient()
  const [taskId, setTaskId] = useState<string | null>(null)
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [taskData, setTaskData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      setTaskId(resolvedParams.id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (taskId) {
      loadTaskData()
    }
  }, [taskId])

  async function loadTaskData() {
    try {
      setLoading(true)

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        router.push('/auth/login')
        return
      }

      // Get user's family member record
      const { data: familyMember, error: memberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', session.user.id)
        .single()

      if (memberError) {
        throw memberError
      }

      setFamilyId(familyMember.family_id)

      // Get task details
      const response = await fetch(`/api/tasks/${taskId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch task')
      }

      const data = await response.json()

      // Transform task data for the form
      const task = data.task
      const assignedChildrenIds = task.task_assignments?.map((a: any) => a.child_id) || []

      setTaskData({
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        due_date: task.due_date,
        recurring: task.recurring,
        recurring_type: task.recurring_type,
        image_url: task.image_url,
        image_alt_text: task.image_alt_text,
        image_source: task.image_source,
        assigned_children: assignedChildrenIds
      })

      // Get children for this family
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', familyMember.family_id)
        .order('created_at', { ascending: true })

      if (childrenError) {
        throw childrenError
      }

      setChildren(childrenData || [])
    } catch (err) {
      console.error('Error loading task data:', err)
      alert(t('errors.generic'))
      router.push('/tasks')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(data: any) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t('tasks.messages.error_updating'))
      }

      // Navigate back to tasks list
      router.push('/tasks')
    } catch (error) {
      console.error('Error updating task:', error)
      alert(error instanceof Error ? error.message : t('tasks.messages.error_updating'))
      throw error
    }
  }

  if (loading || !familyId || !taskData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" aria-hidden="true"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/tasks')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              aria-label={`${t('common.back')} ${t('tasks.title')}`}
            >
              <ArrowLeftIcon className="w-5 h-5" aria-hidden="true" />
              {t('common.back')}
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{t('tasks.edit_task')}</h1>
            <p className="text-gray-600 mt-2">
              {t('tasks.assign_help')}
            </p>
          </div>

          {/* Task Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <TaskForm
              familyId={familyId}
              taskId={taskId || undefined}
              initialData={taskData}
              onSubmit={handleSubmit}
              submitLabel={t('tasks.update_task')}
              availableChildren={children.map(child => ({
                id: child.id,
                name: child.name
              }))}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
