'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import Image from 'next/image'
import { MultiTaskCompletionModal } from '@/components/MultiTaskCompletionModal'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { motion } from 'framer-motion'

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

interface TaskAssignment {
  task_id: string
  tasks: {
    id: string
    title: string
    description?: string
    category: string
    priority: string
    due_date?: string
    image_url?: string
    image_alt_text?: string
    image_source?: 'library' | 'custom' | 'emoji'
  }
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
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([])
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [showMessage, setShowMessage] = useState<string | null>(null)
  const supabase = createClient()

  const childId = params.id as string

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (isMounted) {
        await fetchChildAndTasks()
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [childId])

  async function fetchChildAndTasks() {
    try {
      setLoading(true)

      // Verify user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Fetch child info with family_id for authorization
      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('id, name, age_group, profile_photo_url, family_id')
        .eq('id', childId)
        .single()

      if (childError) throw childError

      // Verify user is a member of this child's family
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', childData.family_id)
        .eq('user_id', session.user.id)
        .single()

      if (membershipError || !membership) {
        console.error('Unauthorized access attempt to child tasks page')
        router.push('/dashboard')
        return
      }

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
        .returns<TaskAssignment[]>()

      if (assignmentsError) throw assignmentsError

      // Get today's date
      const today = new Date().toISOString().split('T')[0]

      // Extract task IDs for completion check
      const taskIds = assignmentsData?.map(a => a.tasks.id).filter(Boolean) || []

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
        return {
          id: a.tasks.id,
          title: a.tasks.title,
          description: a.tasks.description,
          category: a.tasks.category,
          priority: a.tasks.priority,
          due_date: a.tasks.due_date,
          image_url: a.tasks.image_url,
          image_alt_text: a.tasks.image_alt_text,
          image_source: a.tasks.image_source,
          completed_today: completedTaskIds.has(a.tasks.id)
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

  function handleCompleteTask(task: Task) {
    setSelectedTasks([task])
    setShowCompletionModal(true)
  }

  async function handleSubmitCompletion(completions: Array<{ taskId: string, rating: number, notes: string }>) {
    try {
      // Submit all completions in parallel
      await Promise.all(
        completions.map(async ({ taskId, rating, notes }) => {
          const response = await fetch(`/api/tasks/${taskId}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              child_id: childId,
              child_rating: rating,
              child_notes: notes || undefined,
            }),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to complete task')
          }
        })
      )

      // Close modal
      setShowCompletionModal(false)
      setSelectedTasks([])

      // Show positive message
      const messages = child?.age_group === '5-8' ? POSITIVE_MESSAGES_YOUNG : POSITIVE_MESSAGES_OLDER
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      setShowMessage(randomMessage || null)

      // Hide message after 3 seconds
      setTimeout(() => setShowMessage(null), 3000)

      // Refresh tasks
      await fetchChildAndTasks()
    } catch (error) {
      console.error('Error completing tasks:', error)
      throw error // Re-throw to let modal handle the error
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
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-8">
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
      <motion.div
        className="max-w-4xl mx-auto mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button
          onClick={() => router.back()}
          className="mb-4 text-purple-600 hover:text-purple-700 font-bold flex items-center gap-2"
          whileHover={{ x: -5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          ← {t('common.back')}
        </motion.button>

        <motion.div
          className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl p-6 shadow-2xl flex items-center gap-4 text-white"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {child.profile_photo_url && (
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Image
                src={child.profile_photo_url}
                alt={child.name}
                width={80}
                height={80}
                className="rounded-full border-4 border-white shadow-lg"
              />
            </motion.div>
          )}
          <div>
            <h1 className="text-3xl font-black">{t('childTasks.title', { name: child.name })}</h1>
            <p className="text-lg text-white/90 flex items-center gap-2">
              {t('childTasks.completedToday', { completed: completedTasks.length, total: tasks.length })}
              <motion.span
                className="text-2xl"
                animate={{ rotate: [-10, 10] }}
                transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
              >
                🎯
              </motion.span>
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Tasks to Do */}
      {pendingTasks.length > 0 && (
        <div className="max-w-4xl mx-auto mb-8">
          <motion.h2
            className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t('childTasks.tasksToDo')}
          </motion.h2>
          <div className="grid gap-4">
            {pendingTasks.map((task, index) => (
              <motion.div
                key={task.id}
                className="bg-white rounded-3xl p-6 shadow-2xl hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  {/* Task Image */}
                  {task.image_url && (
                    <motion.div
                      className="flex-shrink-0"
                      animate={{ rotate: [-5, 5] }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: index * 0.2 }}
                    >
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
                    </motion.div>
                  )}

                  {/* Task Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{task.title}</h3>
                    {task.description && child.age_group === '9-12' && (
                      <p className="text-gray-600 mt-1">{task.description}</p>
                    )}
                  </div>
                </div>

                {/* Complete Button */}
                <motion.button
                  onClick={() => handleCompleteTask(task)}
                  className={`
                    w-full py-4 rounded-3xl font-black text-xl transition-all shadow-2xl
                    ${child.age_group === '5-8'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500'
                      : 'bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500'
                    }
                    text-white
                  `}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <span>✓ {child.age_group === '5-8' ? t('childTasks.iDidThis') : t('childTasks.markComplete')}</span>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-2xl font-black text-green-700 mb-4 flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              ✓
            </motion.span>
            {t('childTasks.completedTodayTitle')}
          </motion.h2>
          <div className="grid gap-4">
            {completedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                className="bg-gradient-to-br from-green-400 to-emerald-400 rounded-3xl p-6 border-2 border-green-300 shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center gap-4">
                  {task.image_url && (
                    <motion.div
                      className="flex-shrink-0"
                      animate={{ rotate: [-5, 5] }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: index * 0.2 }}
                    >
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
                    </motion.div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white">{task.title}</h3>
                    <p className="text-white/90 flex items-center gap-1">
                      {t('childTasks.greatJob')}
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        ✓
                      </motion.span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Tasks */}
      {tasks.length === 0 && (
        <motion.div
          className="max-w-4xl mx-auto text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div
            className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl shadow-2xl p-12 text-white"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [-10, 10] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            >
              📋
            </motion.div>
            <p className="text-2xl font-black">{t('childTasks.noTasksAssigned')}</p>
          </motion.div>
        </motion.div>
      )}

      {/* Task Completion Modal */}
      {child && selectedTasks.length > 0 && (
        <MultiTaskCompletionModal
          isOpen={showCompletionModal}
          onClose={() => {
            setShowCompletionModal(false)
            setSelectedTasks([])
          }}
          onSubmit={handleSubmitCompletion}
          tasks={selectedTasks}
          ageGroup={child.age_group}
        />
      )}
      </div>
    </DashboardLayout>
  )
}
