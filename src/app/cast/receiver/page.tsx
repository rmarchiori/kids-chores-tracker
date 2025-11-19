'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'

/**
 * Cast Receiver Page
 *
 * Displays a TV-optimized dashboard that shows:
 * - Family member profiles
 * - Pending tasks for today
 * - Recent completions
 * - Weekly progress charts
 *
 * Features:
 * - Auto-rotates between family members every 10 seconds
 * - TV-optimized layout (large text, high contrast)
 * - Real-time updates via Supabase subscriptions
 * - No interaction required (read-only display)
 */

interface Child {
  id: string
  name: string
  age_group: '5-8' | '9-12'
  profile_photo_url?: string
}

interface Task {
  id: string
  title: string
  category: string
  image_url?: string
  image_source?: 'library' | 'custom' | 'emoji'
  points: number
}

interface Completion {
  id: string
  task_id: string
  child_id: string
  completed_at: string
  child_rating: number
  parent_rating?: number
  tasks: {
    title: string
    category: string
    image_url?: string
    image_source?: 'library' | 'custom' | 'emoji'
  }
  children: {
    name: string
  }
}

export default function CastReceiverPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [currentChildIndex, setCurrentChildIndex] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [loading, setLoading] = useState(true)
  const [familyId, setFamilyId] = useState<string | null>(null)

  const supabase = createClient()

  // Load family data
  useEffect(() => {
    async function loadData() {
      try {
        // Get current user's family
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.error('No user found')
          return
        }

        const { data: familyMember } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('user_id', user.id)
          .single()

        if (!familyMember) {
          console.error('No family found')
          return
        }

        setFamilyId(familyMember.family_id)

        // Load children
        const { data: childrenData } = await supabase
          .from('children')
          .select('*')
          .eq('family_id', familyMember.family_id)
          .order('created_at')

        if (childrenData) {
          setChildren(childrenData)
        }

        setLoading(false)
      } catch (err) {
        console.error('Error loading data:', err)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Load tasks and completions for current child
  const loadChildData = useCallback(async (childId: string) => {
    if (!familyId) return

    try {
      const today = format(new Date(), 'yyyy-MM-dd')

      // Load today's tasks for this child
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('family_id', familyId)
        .eq('assigned_to', childId)
        .eq('status', 'active')
        .order('created_at')

      if (tasksData) {
        setTasks(tasksData)
      }

      // Load recent completions for this child
      const { data: completionsData } = await supabase
        .from('task_completions')
        .select(`
          id,
          task_id,
          child_id,
          completed_at,
          child_rating,
          parent_rating,
          tasks (
            title,
            category,
            image_url,
            image_source
          ),
          children (
            name
          )
        `)
        .eq('child_id', childId)
        .gte('completed_at', today)
        .order('completed_at', { ascending: false })
        .limit(5)

      if (completionsData) {
        setCompletions(completionsData as any)
      }
    } catch (err) {
      console.error('Error loading child data:', err)
    }
  }, [familyId])

  // Auto-rotate between children
  useEffect(() => {
    if (children.length === 0) return

    const interval = setInterval(() => {
      setCurrentChildIndex((prev) => (prev + 1) % children.length)
    }, 10000) // Rotate every 10 seconds

    return () => clearInterval(interval)
  }, [children.length])

  // Load data when current child changes
  useEffect(() => {
    if (children[currentChildIndex]) {
      loadChildData(children[currentChildIndex].id)
    }
  }, [currentChildIndex, children, loadChildData])

  // Set up real-time subscription for updates
  useEffect(() => {
    if (!familyId) return

    const channel = supabase
      .channel('cast-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_completions',
          filter: `family_id=eq.${familyId}`
        },
        () => {
          // Reload data when completions change
          if (children[currentChildIndex]) {
            loadChildData(children[currentChildIndex].id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [familyId, currentChildIndex, children, loadChildData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-3xl font-bold">Loading Family Dashboard...</p>
        </div>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <p className="text-3xl font-bold">No children found</p>
          <p className="text-xl mt-2">Add children to get started</p>
        </div>
      </div>
    )
  }

  const currentChild = children[currentChildIndex]

  if (!currentChild) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header with Child Info */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-6xl">
                {currentChild.profile_photo_url ? (
                  <img
                    src={currentChild.profile_photo_url}
                    alt={currentChild.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  '👤'
                )}
              </div>
              <div className="text-white">
                <h1 className="text-6xl font-bold mb-2">{currentChild.name}'s Dashboard</h1>
                <p className="text-3xl opacity-90">
                  Age Group: {currentChild.age_group === '5-8' ? '5-8 years' : '9-12 years'}
                </p>
              </div>
            </div>
            <div className="text-white text-right">
              <p className="text-2xl opacity-75">{format(new Date(), 'EEEE')}</p>
              <p className="text-4xl font-bold">{format(new Date(), 'MMM dd, yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8">
          <h2 className="text-white text-4xl font-bold mb-6">📋 Today's Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-white/70 text-3xl text-center py-12">
              🎉 All caught up! No pending tasks.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {tasks.slice(0, 6).map((task) => (
                <div
                  key={task.id}
                  className="bg-white/20 rounded-2xl p-6 flex items-center gap-4"
                >
                  <div className="text-6xl">
                    {task.image_source === 'emoji' ? (
                      task.image_url
                    ) : task.image_url ? (
                      <img
                        src={task.image_url}
                        alt={task.title}
                        className="w-16 h-16 object-contain"
                      />
                    ) : (
                      '✅'
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-2xl font-bold">{task.title}</h3>
                    <p className="text-white/70 text-xl capitalize">{task.category}</p>
                  </div>
                  <div className="text-yellow-400 text-3xl font-bold">
                    {task.points} ⭐
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Completions */}
        {completions.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8">
            <h2 className="text-white text-4xl font-bold mb-6">🎯 Today's Achievements</h2>
            <div className="space-y-4">
              {completions.map((completion) => (
                <div
                  key={completion.id}
                  className="bg-white/20 rounded-2xl p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">
                      {completion.tasks.image_source === 'emoji' ? (
                        completion.tasks.image_url
                      ) : completion.tasks.image_url ? (
                        <img
                          src={completion.tasks.image_url}
                          alt={completion.tasks.title}
                          className="w-16 h-16 object-contain"
                        />
                      ) : (
                        '✅'
                      )}
                    </div>
                    <div>
                      <h3 className="text-white text-2xl font-bold">
                        {completion.tasks.title}
                      </h3>
                      <p className="text-white/70 text-xl">
                        {format(parseISO(completion.completed_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-white/70 text-lg mb-1">Self Rating:</p>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-3xl ${
                              i < completion.child_rating ? 'text-yellow-400' : 'text-white/30'
                            }`}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                    {completion.parent_rating && (
                      <div>
                        <p className="text-white/70 text-lg mb-1">Parent Rating:</p>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-3xl ${
                                i < completion.parent_rating! ? 'text-yellow-400' : 'text-white/30'
                              }`}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rotation Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {children.map((_, index) => (
            <div
              key={index}
              className={`h-3 rounded-full transition-all ${
                index === currentChildIndex
                  ? 'w-12 bg-white'
                  : 'w-3 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
