'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { TaskCard } from '@/components/tasks/TaskCard'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/hooks/useTranslation'

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{t('tasks.title')}</h1>
            <button
              onClick={() => router.push('/tasks/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label={t('tasks.new_task')}
            >
              <PlusIcon className="w-5 h-5" aria-hidden="true" />
              {t('tasks.new_task')}
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            {/* Category Filter */}
            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                {t('tasks.category')}
              </label>
              <select
                id="category-filter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-1">
                {t('tasks.priority')}
              </label>
              <select
                id="priority-filter"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={t('tasks.priority')}
              >
                <option value="all">{t('tasks.all_priorities')}</option>
                <option value="low">{t('tasks.priorities.low')}</option>
                <option value="medium">{t('tasks.priorities.medium')}</option>
                <option value="high">{t('tasks.priorities.high')}</option>
              </select>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
              {t('tasks.messages.error_loading')}
            </div>
          )}

          {/* Empty State */}
          {tasks.length === 0 && !error ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600 mb-4">{t('tasks.no_tasks')}</p>
              <button
                onClick={() => router.push('/tasks/new')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                aria-label={t('tasks.add_first_task')}
              >
                <PlusIcon className="w-5 h-5" aria-hidden="true" />
                {t('tasks.add_first_task')}
              </button>
            </div>
          ) : (
            /* Tasks Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => (
                <div key={task.id} className="relative group">
                  <TaskCard
                    task={task}
                    onClick={() => handleTaskClick(task.id)}
                  />

                  {/* Delete Button (appears on hover) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(task.id, task.title)
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                    aria-label={`${t('tasks.delete_task')} ${task.title}`}
                  >
                    {t('common.delete')}
                  </button>

                  {/* Assignment Info */}
                  {task.task_assignments && task.task_assignments.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {t('tasks.assign_to')}: {task.task_assignments.map(a => a.children.name).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
