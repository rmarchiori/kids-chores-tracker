'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { TaskCard } from '@/components/tasks/TaskCard'
import { PlusIcon } from '@heroicons/react/24/outline'

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
  const router = useRouter()
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  useEffect(() => {
    loadTasks()
  }, [filterCategory, filterPriority])

  async function loadTasks() {
    try {
      setLoading(true)
      setError(null)

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        router.push('/auth/login')
        return
      }

      // Build query params
      const params = new URLSearchParams()
      if (filterCategory !== 'all') {
        params.append('category', filterCategory)
      }
      if (filterPriority !== 'all') {
        params.append('priority', filterPriority)
      }

      // Fetch tasks
      const response = await fetch(`/api/tasks?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }

      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (err) {
      console.error('Error loading tasks:', err)
      setError('Failed to load tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(taskId: string, taskTitle: string) {
    if (!confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      // Reload tasks list
      await loadTasks()
    } catch (err) {
      console.error('Error deleting task:', err)
      alert('Failed to delete task. Please try again.')
    }
  }

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}/edit`)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tasks...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <button
              onClick={() => router.push('/tasks/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              New Task
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            {/* Category Filter */}
            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category-filter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="cleaning">Cleaning</option>
                <option value="homework">Homework</option>
                <option value="pets">Pets</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority-filter"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Empty State */}
          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600 mb-4">No tasks found.</p>
              <button
                onClick={() => router.push('/tasks/new')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Create Your First Task
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
                  >
                    Delete
                  </button>

                  {/* Assignment Info */}
                  {task.task_assignments && task.task_assignments.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Assigned to: {task.task_assignments.map(a => a.children.name).join(', ')}
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
