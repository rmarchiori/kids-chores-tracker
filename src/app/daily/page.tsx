'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import Image from 'next/image'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface TaskAssignment {
  task_id: string
  child_id: string
  task: {
    id: string
    title: string
    description?: string
    category: string
    priority: string
    image_url?: string
    image_alt_text?: string
    image_source?: 'library' | 'custom' | 'emoji'
  }
  child: {
    id: string
    name: string
    age_group: '5-8' | '9-12'
    profile_photo_url?: string
  }
  completion_status: 'not_started' | 'pending_review' | 'completed'
  completion_id?: string
}

interface TaskAssignmentQuery {
  task_id: string
  child_id: string
  tasks: {
    id: string
    title: string
    description?: string
    category: string
    priority: string
    image_url?: string
    image_alt_text?: string
    image_source?: 'library' | 'custom' | 'emoji'
    family_id: string
  }
  children: {
    id: string
    name: string
    age_group: '5-8' | '9-12'
    profile_photo_url?: string
    family_id: string
  }
}

interface ChildProgress {
  id: string
  name: string
  profile_photo_url?: string
  total_tasks: number
  completed_tasks: number
  pending_review_tasks: number
  not_started_tasks: number
}

interface GroupedTask {
  task: TaskAssignment['task']
  assignments: Array<{
    child: TaskAssignment['child']
    completion_status: TaskAssignment['completion_status']
    completion_id?: string
  }>
}

export default function DailyTasksPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [taskAssignments, setTaskAssignments] = useState<TaskAssignment[]>([])
  const [childrenProgress, setChildrenProgress] = useState<ChildProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChildren, setSelectedChildren] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const supabase = createClient()

  const CARDS_PER_PAGE = 3

  // Toggle child selection
  const toggleChildSelection = (childId: string) => {
    setSelectedChildren(prev => {
      if (prev.includes(childId)) {
        return prev.filter(id => id !== childId)
      } else {
        return [...prev, childId]
      }
    })
    // Reset to first page when filter changes
    setCurrentPage(0)
  }

  // Select all children
  const selectAllChildren = () => {
    setSelectedChildren(childrenProgress.map(child => child.id))
    setCurrentPage(0)
  }

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedChildren([])
    setCurrentPage(0)
  }

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (isMounted) {
        await fetchDailyTasks()
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  async function fetchDailyTasks() {
    try {
      setLoading(true)

      // Fetch user's family
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

      const { data: membership } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', session.user.id)
        .single()

      if (!membership) {
        return
      }

      // Get today's date range
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

      // Fetch all task assignments for this family
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('task_assignments')
        .select(`
          task_id,
          child_id,
          tasks!inner (
            id,
            title,
            description,
            category,
            priority,
            image_url,
            image_alt_text,
            image_source,
            family_id
          ),
          children!inner (
            id,
            name,
            age_group,
            profile_photo_url,
            family_id
          )
        `)
        .eq('children.family_id', membership.family_id)
        .returns<TaskAssignmentQuery[]>()

      if (assignmentsError) throw assignmentsError

      // Fetch today's completions for these assignments
      const taskIds = assignmentsData?.map(a => a.tasks.id) || []
      const childIds = assignmentsData?.map(a => a.children.id) || []

      const { data: completionsData } = await supabase
        .from('task_completions')
        .select('id, task_id, child_id, status')
        .in('task_id', taskIds)
        .in('child_id', childIds)
        .gte('completed_at', todayStart.toISOString())
        .lte('completed_at', todayEnd.toISOString())

      // Map assignments to completion status
      const completionsMap = new Map()
      completionsData?.forEach(c => {
        const key = `${c.task_id}-${c.child_id}`
        completionsMap.set(key, { id: c.id, status: c.status })
      })

      const enrichedAssignments: TaskAssignment[] = (assignmentsData || []).map(a => {
        const key = `${a.tasks.id}-${a.children.id}`
        const completion = completionsMap.get(key)

        return {
          task_id: a.tasks.id,
          child_id: a.children.id,
          task: {
            id: a.tasks.id,
            title: a.tasks.title,
            description: a.tasks.description,
            category: a.tasks.category,
            priority: a.tasks.priority,
            image_url: a.tasks.image_url,
            image_alt_text: a.tasks.image_alt_text,
            image_source: a.tasks.image_source,
          },
          child: {
            id: a.children.id,
            name: a.children.name,
            age_group: a.children.age_group,
            profile_photo_url: a.children.profile_photo_url,
          },
          completion_status: completion
            ? (completion.status === 'completed' ? 'completed' : 'pending_review')
            : 'not_started',
          completion_id: completion?.id,
        }
      })

      setTaskAssignments(enrichedAssignments)

      // Calculate progress per child
      const progressMap = new Map<string, ChildProgress>()
      enrichedAssignments.forEach(assignment => {
        const childId = assignment.child.id
        if (!progressMap.has(childId)) {
          progressMap.set(childId, {
            id: assignment.child.id,
            name: assignment.child.name,
            profile_photo_url: assignment.child.profile_photo_url,
            total_tasks: 0,
            completed_tasks: 0,
            pending_review_tasks: 0,
            not_started_tasks: 0,
          })
        }

        const progress = progressMap.get(childId)!
        progress.total_tasks++

        if (assignment.completion_status === 'completed') {
          progress.completed_tasks++
        } else if (assignment.completion_status === 'pending_review') {
          progress.pending_review_tasks++
        } else {
          progress.not_started_tasks++
        }
      })

      setChildrenProgress(Array.from(progressMap.values()))
    } catch (error) {
      console.error('Error fetching daily tasks:', error)
      alert(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  function getStatusBorder(status: TaskAssignment['completion_status']) {
    switch (status) {
      case 'completed':
        return 'border-4 border-green-500'
      case 'pending_review':
        return 'border-4 border-yellow-500'
      case 'not_started':
        return 'border-4 border-red-500'
    }
  }

  function getStatusText(status: TaskAssignment['completion_status']) {
    switch (status) {
      case 'completed':
        return { text: t('daily.status.completed'), color: 'text-green-700' }
      case 'pending_review':
        return { text: t('daily.status.pendingReview'), color: 'text-yellow-700' }
      case 'not_started':
        return { text: t('daily.status.notStarted'), color: 'text-red-700' }
    }
  }

  // Group tasks by task_id
  const groupedTasks: GroupedTask[] = []
  const taskMap = new Map<string, GroupedTask>()

  // Filter assignments based on selected children
  const filteredAssignments = selectedChildren.length === 0
    ? taskAssignments
    : taskAssignments.filter(a => selectedChildren.includes(a.child.id))

  filteredAssignments.forEach(assignment => {
    if (!taskMap.has(assignment.task_id)) {
      taskMap.set(assignment.task_id, {
        task: assignment.task,
        assignments: []
      })
    }

    const grouped = taskMap.get(assignment.task_id)!
    grouped.assignments.push({
      child: assignment.child,
      completion_status: assignment.completion_status,
      completion_id: assignment.completion_id
    })
  })

  groupedTasks.push(...Array.from(taskMap.values()))

  // Filter progress cards based on selected children
  const filteredChildrenProgress = selectedChildren.length === 0
    ? childrenProgress
    : childrenProgress.filter(child => selectedChildren.includes(child.id))

  // Pagination for children progress
  const totalPages = Math.ceil(filteredChildrenProgress.length / CARDS_PER_PAGE)
  const startIndex = currentPage * CARDS_PER_PAGE
  const endIndex = startIndex + CARDS_PER_PAGE
  const visibleChildren = filteredChildrenProgress.slice(startIndex, endIndex)

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-xl text-gray-600">{t('common.loading')}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
        </div>
        <div className="relative z-10">
        {/* Header with Kids Filter */}
        <motion.div
          className="mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.01, y: -2 }}
        >
          <motion.h1
            className="text-4xl font-black mb-2"
            animate={{ rotate: [-1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
          >
            {t('daily.title')}
          </motion.h1>
          <p className="text-xl text-white/90 mb-6">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* Kids Filter */}
          {childrenProgress.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/30">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-black">{t('daily.showTasksFor')}</p>
                <div className="flex gap-2">
                  <motion.button
                    onClick={selectAllChildren}
                    className="text-xs px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t('tasks.select_all') || 'Select All'}
                  </motion.button>
                  {selectedChildren.length > 0 && (
                    <motion.button
                      onClick={clearAllSelections}
                      className="text-xs px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {t('tasks.clear_filters') || 'Clear All'}
                    </motion.button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {childrenProgress.map((child) => {
                  const isSelected = selectedChildren.includes(child.id)
                  return (
                    <motion.button
                      key={child.id}
                      onClick={() => toggleChildSelection(child.id)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all
                        ${isSelected
                          ? 'bg-white text-purple-600 shadow-lg'
                          : 'bg-white/20 text-white hover:bg-white/30'
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {child.profile_photo_url ? (
                        <Image
                          src={child.profile_photo_url}
                          alt={child.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-white/40 flex items-center justify-center">
                          <span className="text-xs font-black">
                            {child.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span>{child.name}</span>
                      {isSelected && <span className="text-sm">✓</span>}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Progress Overview with Carousel */}
        {childrenProgress.length > 0 && (
          <div className="mb-8">
            <div className="relative">
              {/* Carousel Container */}
              <div className="w-full overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                  >
                    {visibleChildren.map((child, index) => (
                      <motion.div
                        key={child.id}
                        className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {child.profile_photo_url ? (
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Image
                                src={child.profile_photo_url}
                                alt={child.name}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            </motion.div>
                          ) : (
                            <motion.div
                              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center"
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              <span className="text-lg font-black text-white">
                                {child.name.charAt(0)}
                              </span>
                            </motion.div>
                          )}
                          <p className="font-black text-gray-900">{child.name}</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 font-medium">{t('daily.progress')}</span>
                            <span className="font-black text-gray-900">
                              {child.completed_tasks}/{child.total_tasks}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <motion.div
                              className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(child.completed_tasks / child.total_tasks) * 100}%` }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                            />
                          </div>
                        </div>

                        {/* Status Counts */}
                        <div className="flex gap-3 text-sm font-medium">
                          <span className="text-green-700">✓ {child.completed_tasks}</span>
                          <span className="text-yellow-700">⏳ {child.pending_review_tasks}</span>
                          <span className="text-gray-600">○ {child.not_started_tasks}</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Carousel Navigation */}
              {totalPages > 1 && (
                <>
                  <motion.button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed z-10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
                  </motion.button>

                  <motion.button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages - 1}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed z-10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRightIcon className="w-6 h-6 text-gray-700" />
                  </motion.button>

                  {/* Page Indicators */}
                  <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentPage
                            ? 'bg-white w-6'
                            : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Task List - Deduplicated */}
        {groupedTasks.length === 0 ? (
          <motion.div
            className="text-center py-16 bg-white rounded-3xl shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              className="text-2xl text-gray-500 font-black"
              animate={{ rotate: [-5, 5] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            >
              {t('daily.noTasks')}
            </motion.p>
            <p className="text-gray-400 mt-2">{t('daily.createTasksPrompt')}</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {groupedTasks.map((groupedTask, index) => (
              <motion.div
                key={groupedTask.task.id}
                className="bg-white rounded-3xl p-6 shadow-2xl hover:shadow-xl transition-shadow border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-start gap-4">
                  {/* Task Image */}
                  {groupedTask.task.image_url && (
                    <div className="flex-shrink-0">
                      {groupedTask.task.image_source === 'emoji' ? (
                        <motion.span
                          className="text-5xl inline-block"
                          animate={{ rotate: [-5, 5] }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                        >
                          {groupedTask.task.image_url}
                        </motion.span>
                      ) : (
                        <Image
                          src={groupedTask.task.image_url}
                          alt={groupedTask.task.image_alt_text || groupedTask.task.title}
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className="font-black text-xl text-gray-900 mb-2">{groupedTask.task.title}</h3>

                      {/* Task Details */}
                      <div className="flex gap-2">
                        <span className="text-xs px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full text-gray-600 font-medium">
                          {t(`tasks.categories.${groupedTask.task.category}`)}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          groupedTask.task.priority === 'high'
                            ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-700'
                            : groupedTask.task.priority === 'medium'
                            ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700'
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                        }`}>
                          {t(`tasks.priorities.${groupedTask.task.priority}`)}
                        </span>
                      </div>
                    </div>

                    {/* Children Assigned */}
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-3">{t('daily.assignedTo')}</p>
                      <div className="flex flex-wrap gap-4">
                        {groupedTask.assignments.map((assignment) => {
                          const status = getStatusText(assignment.completion_status)
                          return (
                            <motion.div
                              key={assignment.child.id}
                              className="flex flex-col items-center gap-2 cursor-pointer"
                              onClick={() => router.push(`/children/${assignment.child.id}/tasks`)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {/* Child Photo with Status Border */}
                              <div className="relative">
                                {assignment.child.profile_photo_url ? (
                                  <Image
                                    src={assignment.child.profile_photo_url}
                                    alt={assignment.child.name}
                                    width={56}
                                    height={56}
                                    className={`rounded-full ${getStatusBorder(assignment.completion_status)}`}
                                  />
                                ) : (
                                  <div className={`w-14 h-14 rounded-full ${getStatusBorder(assignment.completion_status)} bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center`}>
                                    <span className="text-xl font-black text-white">
                                      {assignment.child.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Child Name */}
                              <p className="text-xs font-bold text-gray-700 text-center max-w-[80px] truncate">
                                {assignment.child.name}
                              </p>

                              {/* Status Text */}
                              <p className={`text-xs font-medium ${status.color}`}>
                                {status.text}
                              </p>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </div>
      </div>
    </DashboardLayout>
  )
}
