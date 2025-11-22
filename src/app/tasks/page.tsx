'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { TaskCard } from '@/components/tasks/TaskCard'
import { PlusIcon, XMarkIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useTranslation } from '@/hooks/useTranslation'
import { motion, AnimatePresence } from 'framer-motion'

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
      profile_photo_url?: string | null
    }
  }>
}

export default function TasksPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false)
  const categoryRef = useRef<HTMLDivElement>(null)
  const priorityRef = useRef<HTMLDivElement>(null)

  const categories = ['cleaning', 'homework', 'hygiene', 'outdoor', 'helping', 'meals', 'pets', 'bedtime', 'other']
  const priorities = ['low', 'medium', 'high']

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const togglePriority = (priority: string) => {
    setSelectedPriorities(prev =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    )
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false)
      }
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) {
        setPriorityDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedPriorities([])
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedPriorities.length > 0

  // Build query params for API
  const params = new URLSearchParams()
  if (selectedCategories.length > 0) {
    selectedCategories.forEach(cat => params.append('category', cat))
  }
  if (selectedPriorities.length > 0) {
    selectedPriorities.forEach(pri => params.append('priority', pri))
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
            className="mb-6 bg-white rounded-3xl shadow-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">{t('tasks.filters')}</h2>
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700 font-medium"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <XMarkIcon className="w-4 h-4" />
                    {t('tasks.clear_filters')}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Category Filter */}
            <div className="mb-4" ref={categoryRef}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('tasks.category')}
              </label>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setCategoryDropdownOpen(!categoryDropdownOpen)
                  }}
                  className="w-full px-4 py-2 text-left bg-white border-2 border-gray-300 rounded-xl hover:border-pink-400 transition-colors flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700">
                    {selectedCategories.length === 0
                      ? t('tasks.all_categories')
                      : `${selectedCategories.length} ${t('tasks.selected')}`}
                  </span>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {categoryDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto"
                    >
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={(e) => {
                            e.preventDefault()
                            toggleCategory(category)
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-pink-50 flex items-center gap-2 transition-colors"
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedCategories.includes(category)
                              ? 'bg-pink-500 border-pink-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedCategories.includes(category) && (
                              <CheckIcon className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span className="text-sm text-gray-700">{t(`tasks.categories.${category}`)}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Priority Filter */}
            <div ref={priorityRef}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('tasks.priority')}
              </label>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    setPriorityDropdownOpen(!priorityDropdownOpen)
                  }}
                  className="w-full px-4 py-2 text-left bg-white border-2 border-gray-300 rounded-xl hover:border-pink-400 transition-colors flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700">
                    {selectedPriorities.length === 0
                      ? t('tasks.all_priorities')
                      : `${selectedPriorities.length} ${t('tasks.selected')}`}
                  </span>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${priorityDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {priorityDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl"
                    >
                      {priorities.map((priority) => (
                        <button
                          key={priority}
                          onClick={(e) => {
                            e.preventDefault()
                            togglePriority(priority)
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-pink-50 flex items-center gap-2 transition-colors"
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedPriorities.includes(priority)
                              ? 'bg-pink-500 border-pink-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedPriorities.includes(priority) && (
                              <CheckIcon className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span className="text-sm text-gray-700">{t(`tasks.priorities.${priority}`)}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
                  <div onClick={() => handleTaskClick(task.id)} className="cursor-pointer">
                    <TaskCard task={task} />
                  </div>

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
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
