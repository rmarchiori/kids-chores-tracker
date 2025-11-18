'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import Image from 'next/image'

interface Task {
  id: string
  title: string
  description?: string
  category: string
  priority: string
  due_date?: string
  image_url?: string
  image_alt_text?: string
  image_source?: 'library' | 'custom' | 'emoji'
  completed_today: boolean
}

interface Child {
  id: string
  name: string
  age_group: '5-8' | '9-12'
  profile_photo_url?: string
}

const POSITIVE_MESSAGES_YOUNG = [
  '🌟 Amazing job!',
  '🎉 You did it!',
  '⭐ Super star!',
  '🏆 Way to go!',
  '💪 You rock!',
  '🎊 Fantastic!',
  '✨ Wow! Great work!',
  '🌈 Awesome!',
]

const POSITIVE_MESSAGES_OLDER = [
  'Great work!',
  'Well done!',
  'Nicely done!',
  'Excellent effort!',
  'Keep it up!',
  'You\'re doing great!',
  'Nice job!',
  'Good work!',
]

export default function ChildTasksPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useTranslation()
  const [child, setChild] = useState<Child | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)
  const [showMessage, setShowMessage] = useState<string | null>(null)
  const supabase = createClient()

  const childId = params.id as string

  useEffect(() => {
    fetchChildAndTasks()
  }, [childId])

  async function fetchChildAndTasks() {
    try {
      setLoading(true)

      // Fetch child info
      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('id, name, age_group, profile_photo_url')
        .eq('id', childId)
        .single()

      if (childError) throw childError
      setChild(childData)

      // Fetch tasks assigned to this child
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('task_assignments')
        .select(`
          task_id,
          tasks!inner (
            id,
            title,
            description,
            category,
            priority,
            due_date,
            image_url,
            image_alt_text,
            image_source
          )
        `)
        .eq('child_id', childId)

      if (assignmentsError) throw assignmentsError

      // Get today's date
      const today = new Date().toISOString().split('T')[0]

      // Extract task IDs for completion check
      const taskIds = assignmentsData?.map(a => (a.tasks as any).id).filter(Boolean) || []

      const { data: completionsData } = await supabase
        .from('task_completions')
        .select('task_id')
        .eq('child_id', childId)
        .gte('completed_at', `${today}T00:00:00Z`)
        .lte('completed_at', `${today}T23:59:59Z`)
        .in('task_id', taskIds)

      const completedTaskIds = new Set(completionsData?.map(c => c.task_id) || [])

      // Map tasks with completion status
      const tasksWithStatus: Task[] = (assignmentsData || []).map(a => {
        const taskData = a.tasks as any
        return {
          id: taskData.id,
          title: taskData.title,
          description: taskData.description,
          category: taskData.category,
          priority: taskData.priority,
          due_date: taskData.due_date,
          image_url: taskData.image_url,
          image_alt_text: taskData.image_alt_text,
          image_source: taskData.image_source,
          completed_today: completedTaskIds.has(taskData.id)
        }
      })

      setTasks(tasksWithStatus)
    } catch (error) {
      console.error('Error fetching data:', error)
      alert(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  async function handleCompleteTask(taskId: string) {
    try {
      setCompletingTaskId(taskId)

      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: childId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to complete task')
      }

      // Show positive message
      const messages = child?.age_group === '5-8' ? POSITIVE_MESSAGES_YOUNG : POSITIVE_MESSAGES_OLDER
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      setShowMessage(randomMessage || null)

      // Hide message after 3 seconds
      setTimeout(() => setShowMessage(null), 3000)

      // Refresh tasks
      await fetchChildAndTasks()
    } catch (error) {
      console.error('Error completing task:', error)
      alert(error instanceof Error ? error.message : t('errors.generic'))
    } finally {
      setCompletingTaskId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">{t('common.loading')}</p>
      </div>
    )
  }

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">{t('errors.notFound')}</p>
      </div>
    )
  }

  const pendingTasks = tasks.filter(t => !t.completed_today)
  const completedTasks = tasks.filter(t => t.completed_today)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      {/* Positive Message Overlay */}
      {showMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-12 text-center shadow-2xl transform animate-bounce">
            <p className={`${child.age_group === '5-8' ? 'text-6xl' : 'text-4xl'} font-bold text-blue-600`}>
              {showMessage}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← {t('common.back')}
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center gap-4">
          {child.profile_photo_url && (
            <Image
              src={child.profile_photo_url}
              alt={child.name}
              width={80}
              height={80}
              className="rounded-full"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{child.name}'s Tasks</h1>
            <p className="text-lg text-gray-600">
              {completedTasks.length} of {tasks.length} tasks completed today! 🎯
            </p>
          </div>
        </div>
      </div>

      {/* Tasks to Do */}
      {pendingTasks.length > 0 && (
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tasks To Do</h2>
          <div className="grid gap-4">
            {pendingTasks.map(task => (
              <div
                key={task.id}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  {/* Task Image */}
                  {task.image_url && (
                    <div className="flex-shrink-0">
                      {task.image_source === 'emoji' ? (
                        <span className="text-5xl">{task.image_url}</span>
                      ) : (
                        <Image
                          src={task.image_url}
                          alt={task.image_alt_text || task.title}
                          width={64}
                          height={64}
                          className="object-contain"
                        />
                      )}
                    </div>
                  )}

                  {/* Task Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">{task.title}</h3>
                    {task.description && child.age_group === '9-12' && (
                      <p className="text-gray-600 mt-1">{task.description}</p>
                    )}
                  </div>
                </div>

                {/* Complete Button */}
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  disabled={completingTaskId === task.id}
                  className={`
                    w-full py-4 rounded-xl font-bold text-xl transition-all
                    ${child.age_group === '5-8'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500'
                      : 'bg-blue-600 hover:bg-blue-700'
                    }
                    text-white shadow-lg hover:shadow-xl transform hover:scale-105
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                  `}
                >
                  {completingTaskId === task.id ? (
                    <span>{t('common.saving')}</span>
                  ) : (
                    <span>✓ {child.age_group === '5-8' ? 'I Did This!' : 'Mark Complete'}</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-green-700 mb-4">✓ Completed Today!</h2>
          <div className="grid gap-4">
            {completedTasks.map(task => (
              <div
                key={task.id}
                className="bg-green-50 rounded-xl p-6 border-2 border-green-200"
              >
                <div className="flex items-center gap-4">
                  {task.image_url && (
                    <div className="flex-shrink-0 opacity-70">
                      {task.image_source === 'emoji' ? (
                        <span className="text-4xl">{task.image_url}</span>
                      ) : (
                        <Image
                          src={task.image_url}
                          alt={task.image_alt_text || task.title}
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-green-800">{task.title}</h3>
                    <p className="text-green-600">Great job! ✓</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Tasks */}
      {tasks.length === 0 && (
        <div className="max-w-4xl mx-auto text-center py-16">
          <p className="text-2xl text-gray-500">No tasks assigned yet!</p>
        </div>
      )}
    </div>
  )
}
