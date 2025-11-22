'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface LibraryTask {
  id: string
  title: string
  description: string | null
  category: string
  priority: string
  image_url: string | null
  image_alt_text: string | null
  image_source: string
  recommended_age_group: string | null
  tags: string[]
}

interface TaskLibraryBrowserProps {
  isOpen: boolean
  onClose: () => void
  onSelectTask: (task: LibraryTask) => void
}

export function TaskLibraryBrowser({ isOpen, onClose, onSelectTask }: TaskLibraryBrowserProps) {
  const { t } = useTranslation()
  const [libraryTasks, setLibraryTasks] = useState<LibraryTask[]>([])
  const [filteredTasks, setFilteredTasks] = useState<LibraryTask[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all')
  const supabase = createClient()

  const categories = [
    { value: 'all', label: t('tasks.all_categories') || 'All Categories' },
    { value: 'cleaning', label: t('tasks.categories.cleaning') || 'Cleaning' },
    { value: 'homework', label: t('tasks.categories.homework') || 'Homework' },
    { value: 'hygiene', label: t('tasks.categories.hygiene') || 'Hygiene' },
    { value: 'outdoor', label: t('tasks.categories.outdoor') || 'Outdoor' },
    { value: 'helping', label: t('tasks.categories.helping') || 'Helping' },
    { value: 'meals', label: t('tasks.categories.meals') || 'Meals' },
    { value: 'pets', label: t('tasks.categories.pets') || 'Pets' },
    { value: 'bedtime', label: t('tasks.categories.bedtime') || 'Bedtime' }
  ]

  const ageGroups = [
    { value: 'all', label: 'All Ages' },
    { value: '5-8', label: '5-8 years' },
    { value: '9-12', label: '9-12 years' },
    { value: 'both', label: 'Both Ages' }
  ]

  useEffect(() => {
    if (isOpen) {
      loadLibraryTasks()
    }
  }, [isOpen])

  useEffect(() => {
    filterTasks()
  }, [searchQuery, selectedCategory, selectedAgeGroup, libraryTasks])

  async function loadLibraryTasks() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('task_library')
        .select('*')
        .order('category', { ascending: true })
        .order('title', { ascending: true })

      if (error) throw error

      setLibraryTasks(data || [])
      setFilteredTasks(data || [])
    } catch (error) {
      console.error('Error loading task library:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterTasks() {
    let filtered = [...libraryTasks]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.category === selectedCategory)
    }

    // Filter by age group
    if (selectedAgeGroup !== 'all') {
      filtered = filtered.filter(task =>
        task.recommended_age_group === selectedAgeGroup ||
        task.recommended_age_group === 'both'
      )
    }

    setFilteredTasks(filtered)
  }

  function handleSelectTask(task: LibraryTask) {
    onSelectTask(task)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-8 h-8" />
              <h2 className="text-2xl font-black">Task Library</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-white/90">
            Choose from {libraryTasks.length} pre-made tasks to get started quickly!
          </p>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Category and Age Group Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Age Group
              </label>
              <select
                value={selectedAgeGroup}
                onChange={(e) => setSelectedAgeGroup(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {ageGroups.map(age => (
                  <option key={age.value} value={age.value}>{age.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-xl text-gray-500 font-medium mb-2">No tasks found</p>
              <p className="text-gray-400">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task, index) => (
                <motion.button
                  key={task.id}
                  onClick={() => handleSelectTask(task)}
                  className="text-left bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-purple-500 hover:shadow-lg transition-all group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Task Icon */}
                  <div className="flex items-start gap-3 mb-3">
                    {task.image_url && task.image_source === 'emoji' && (
                      <span className="text-3xl">{task.image_url}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Task Details */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {t(`tasks.categories.${task.category}`)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {t(`tasks.priorities.${task.priority}`)}
                    </span>
                    {task.recommended_age_group && task.recommended_age_group !== 'both' && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {task.recommended_age_group}
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredTasks.length} of {libraryTasks.length} tasks
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
