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

export default function NewTaskPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const supabase = createClient()
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFamilyData()
  }, [])

  async function loadFamilyData() {
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
      console.error('Error loading family data:', err)
      alert(t('errors.generic'))
      router.push('/tasks')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(data: any, subtasks: any[]) {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        // Extract user-friendly error message
        let errorMessage = t('tasks.messages.error_creating')
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

      const result = await response.json()
      const taskId = result.task?.id

      // Save subtasks if any
      if (taskId && subtasks.length > 0) {
        for (const subtask of subtasks) {
          await fetch(`/api/tasks/${taskId}/subtasks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: subtask.title,
              description: subtask.description,
              order_index: subtask.order_index
            }),
          })
        }
      }

      // Navigate back to tasks list
      router.push('/tasks')
    } catch (error) {
      console.error('Error creating task:', error)
      alert(error instanceof Error ? error.message : t('tasks.messages.error_creating'))
      throw error
    }
  }

  if (loading || !familyId) {
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 py-8">
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
            <h1 className="text-3xl font-black bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 bg-clip-text text-transparent">{t('tasks.new_task')}</h1>
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
              onSubmit={handleSubmit}
              submitLabel={t('tasks.create_task')}
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
