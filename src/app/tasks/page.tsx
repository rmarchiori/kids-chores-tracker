'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { TaskCard } from '@/components/tasks/TaskCard'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Task {
  id: string
  title: string
  description: string | null
  category: string
  priority: string
  due_date: string | null
  recurring: boolean
  recurring_type: string | null
  image_url: string | null
  image_alt_text: string | null
  image_source: 'library' | 'custom' | 'emoji' | null
  family_id: string
  created_at: string
  task_assignments?: Array<{
    id: string
    child_id: string
    children: {
      id: string
      name: string
      age_group: string
    }
  }>
}

export default function TasksPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  // Build query params for API
  const params = new URLSearchParams()
  if (filterCategory !== 'all') {
    params.append('category', filterCategory)
  }
  if (filterPriority !== 'all') {
    params.append('priority', filterPriority)
  }
  const apiUrl = `/api/tasks?${params.toString()}`

  // Fetch tasks with SWR caching
  const { data, error, isLoading: loading, mutate } = useSWR<{ tasks: Task[] }>(
    apiUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  )

  const tasks = data?.tasks || []

  async function handleDelete(taskId: string, _taskTitle: string) {
    if (!confirm(t('tasks.delete_confirm'))) {
      return
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      // Revalidate cache
      mutate()
    } catch (err) {
      console.error('Error deleting task:', err)
      alert(t('tasks.messages.error_deleting'))
    }
  }

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}/edit`)
  }

  if (loading) {
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
      <div className="min-h-screen bg-gradient-to-br from-pink-600 via-rose-600 to-pink-800 py-8 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          {/* Header */}
          <motion.div
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-black text-white">{t('tasks.title')}</h1>
            <motion.button
              onClick={() => router.push('/tasks/new')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-3xl shadow-2xl hover:from-pink-500 hover:to-rose-500 transition-colors"
              aria-label={t('tasks.new_task')}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <PlusIcon className="w-5 h-5" aria-hidden="true" />
              {t('tasks.new_task')}
            </motion.button>
          </motion.div>

          {/* Filters */}
          <motion.div
            className="mb-6 flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Category Filter */}
            <div>
              <label htmlFor="category-filter" className="block text-sm font-bold text-white mb-1">
                {t('tasks.category')}
              </label>
              <select
                id="category-filter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-lg"
                aria-label={t('tasks.category')}
              >
                <option value="all">{t('tasks.all_categories')}</option>
                <option value="cleaning">{t('tasks.categories.cleaning')}</option>
                <option value="homework">{t('tasks.categories.homework')}</option>
                <option value="hygiene">{t('tasks.categories.hygiene')}</option>
                <option value="outdoor">{t('tasks.categories.outdoor')}</option>
                <option value="helping">{t('tasks.categories.helping')}</option>
                <option value="meals">{t('tasks.categories.meals')}</option>
                <option value="pets">{t('tasks.categories.pets')}</option>
                <option value="bedtime">{t('tasks.categories.bedtime')}</option>
                <option value="other">{t('tasks.categories.other')}</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label htmlFor="priority-filter" className="block text-sm font-bold text-white mb-1">
                {t('tasks.priority')}
              </label>
              <select
                id="priority-filter"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-lg"
                aria-label={t('tasks.priority')}
              >
                <option value="all">{t('tasks.all_priorities')}</option>
                <option value="low">{t('tasks.priorities.low')}</option>
                <option value="medium">{t('tasks.priorities.medium')}</option>
                <option value="high">{t('tasks.priorities.high')}</option>
              </select>
            </div>
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-3xl shadow-2xl mb-6"
              role="alert"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t('tasks.messages.error_loading')}
            </motion.div>
          )}

          {/* Empty State */}
          {tasks.length === 0 && !error ? (
            <motion.div
              className="text-center py-12 bg-white rounded-3xl shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.p
                className="text-gray-600 mb-4 text-xl"
                animate={{ rotate: [-5, 5] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              >
                {t('tasks.no_tasks')}
              </motion.p>
              <motion.button
                onClick={() => router.push('/tasks/new')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-3xl shadow-2xl hover:from-pink-500 hover:to-rose-500 transition-colors"
                aria-label={t('tasks.add_first_task')}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <PlusIcon className="w-5 h-5" aria-hidden="true" />
                {t('tasks.add_first_task')}
              </motion.button>
            </motion.div>
          ) : (
            /* Tasks Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <TaskCard
                    task={task}
                    onClick={() => handleTaskClick(task.id)}
                  />

                  {/* Delete Button (appears on hover) */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(task.id, task.title)
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white px-3 py-1 rounded-3xl text-sm hover:bg-red-700 shadow-2xl"
                    aria-label={`${t('tasks.delete_task')} ${task.title}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t('common.delete')}
                  </motion.button>

                  {/* Assignment Info */}
                  {task.task_assignments && task.task_assignments.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {t('tasks.assign_to')}: {task.task_assignments.map(a => a.children.name).join(', ')}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
