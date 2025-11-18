'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import Image from 'next/image'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'

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

export default function DailyTasksPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [taskAssignments, setTaskAssignments] = useState<TaskAssignment[]>([])
  const [childrenProgress, setChildrenProgress] = useState<ChildProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChild, setSelectedChild] = useState<string>('all')
  const supabase = createClient()

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

  function getStatusBadge(status: TaskAssignment['completion_status']) {
    switch (status) {
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ Completed</span>
      case 'pending_review':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⏳ Pending Review</span>
      case 'not_started':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">○ Not Started</span>
    }
  }

  const filteredAssignments = selectedChild === 'all'
    ? taskAssignments
    : taskAssignments.filter(a => a.child.id === selectedChild)

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
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Today's Tasks</h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Progress Overview */}
        {childrenProgress.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {childrenProgress.map(child => (
              <div
                key={child.id}
                className="bg-white rounded-xl p-4 shadow-md border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  {child.profile_photo_url ? (
                    <Image
                      src={child.profile_photo_url}
                      alt={child.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">
                        {child.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <p className="font-semibold text-gray-900">{child.name}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-gray-900">
                      {child.completed_tasks}/{child.total_tasks}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(child.completed_tasks / child.total_tasks) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Status Counts */}
                <div className="flex gap-2 text-xs">
                  <span className="text-green-700">✓ {child.completed_tasks}</span>
                  <span className="text-yellow-700">⏳ {child.pending_review_tasks}</span>
                  <span className="text-gray-600">○ {child.not_started_tasks}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex gap-4 items-center">
          <label htmlFor="filter-child" className="text-sm font-medium text-gray-700">
            Show tasks for:
          </label>
          <select
            id="filter-child"
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Children</option>
            {childrenProgress.map(child => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
        </div>

        {/* Task List */}
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <p className="text-xl text-gray-500">No tasks for today</p>
            <p className="text-gray-400 mt-2">Create some tasks to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map(assignment => (
              <div
                key={`${assignment.task_id}-${assignment.child_id}`}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="flex items-start gap-4">
                  {/* Task Image */}
                  {assignment.task.image_url && (
                    <div className="flex-shrink-0">
                      {assignment.task.image_source === 'emoji' ? (
                        <span className="text-4xl">{assignment.task.image_url}</span>
                      ) : (
                        <Image
                          src={assignment.task.image_url}
                          alt={assignment.task.image_alt_text || assignment.task.title}
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{assignment.task.title}</h3>
                        <p className="text-sm text-gray-600">Assigned to: {assignment.child.name}</p>
                      </div>
                      {getStatusBadge(assignment.completion_status)}
                    </div>

                    {/* Task Details */}
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                        {assignment.task.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        assignment.task.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : assignment.task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {assignment.task.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
