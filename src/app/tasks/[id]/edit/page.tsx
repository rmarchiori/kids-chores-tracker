'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { TaskForm } from '@/components/tasks/TaskForm'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/hooks/useTranslation'
import type { Child } from '@/lib/schemas'
import { motion } from 'framer-motion'

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
        // Extract user-friendly error message
        let errorMessage = t('tasks.messages.error_updating')
        if (error.error) {
          errorMessage = error.error
        }
        if (error.details && Array.isArray(error.details)) {
          // Zod validation errors
          const fieldErrors = error.details.map((d: any) => `${d.path.join('.')}: ${d.message}`).join(', ')
          errorMessage = `${t('errors.validation')}\n${fieldErrors}`
        }
        throw new Error(errorMessage)
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              onClick={() => router.push('/tasks')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              aria-label={`${t('common.back')} ${t('tasks.title')}`}
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <ArrowLeftIcon className="w-5 h-5" aria-hidden="true" />
              {t('common.back')}
            </motion.button>
            <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">{t('tasks.edit_task')}</h1>
            <p className="text-gray-600 mt-2">
              {t('tasks.assign_help')}
            </p>
          </motion.div>

          {/* Task Form */}
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.01, y: -2 }}
          >
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
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
