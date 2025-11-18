'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import Image from 'next/image'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'

interface Completion {
  id: string
  task_id: string
  child_id: string
  completed_at: string
  status: string
  notes?: string
  tasks: {
    id: string
    title: string
    description?: string
    category: string
    priority: string
    image_url?: string
    image_alt_text?: string
    image_source?: 'library' | 'custom' | 'emoji'
  }
  children: {
    id: string
    name: string
    age_group: '5-8' | '9-12'
    profile_photo_url?: string
  }
}

export default function CompletionsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [completions, setCompletions] = useState<Completion[]>([])
  const [loading, setLoading] = useState(true)
  const [filterChild, setFilterChild] = useState<string>('all')
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([])
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)

      // Fetch family to get children list
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

      // Fetch children
      const { data: childrenData } = await supabase
        .from('children')
        .select('id, name')
        .eq('family_id', membership.family_id)
        .order('name')

      setChildren(childrenData || [])

      // Fetch completions
      await fetchCompletions()
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCompletions() {
    try {
      let url = '/api/completions?limit=100'
      if (filterChild !== 'all') {
        url += `&child_id=${filterChild}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch completions')

      const data = await response.json()
      setCompletions(data)
    } catch (error) {
      console.error('Error fetching completions:', error)
    }
  }

  useEffect(() => {
    if (!loading) {
      fetchCompletions()
    }
  }, [filterChild])

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
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
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Completion History</h1>
          <p className="text-gray-600">View all completed tasks by your children</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4 items-center">
          <label htmlFor="filter-child" className="text-sm font-medium text-gray-700">
            Filter by child:
          </label>
          <select
            id="filter-child"
            value={filterChild}
            onChange={(e) => setFilterChild(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Children</option>
            {children.map(child => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
        </div>

        {/* Completions List */}
        {completions.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <p className="text-xl text-gray-500">No completions yet</p>
            <p className="text-gray-400 mt-2">Completed tasks will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completions.map(completion => (
              <div
                key={completion.id}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="flex items-start gap-4">
                  {/* Child Avatar */}
                  <div className="flex-shrink-0">
                    {completion.children.profile_photo_url ? (
                      <Image
                        src={completion.children.profile_photo_url}
                        alt={completion.children.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xl font-bold text-blue-600">
                          {completion.children.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{completion.children.name}</p>
                        <p className="text-sm text-gray-500">{formatDate(completion.completed_at)}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Completed
                      </span>
                    </div>

                    {/* Task Info */}
                    <div className="flex items-center gap-3 mt-3 p-3 bg-gray-50 rounded-lg">
                      {completion.tasks.image_url && (
                        <div className="flex-shrink-0">
                          {completion.tasks.image_source === 'emoji' ? (
                            <span className="text-3xl">{completion.tasks.image_url}</span>
                          ) : (
                            <Image
                              src={completion.tasks.image_url}
                              alt={completion.tasks.image_alt_text || completion.tasks.title}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{completion.tasks.title}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-white rounded-full text-gray-600 border border-gray-200">
                            {completion.tasks.category}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            completion.tasks.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : completion.tasks.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {completion.tasks.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {completion.notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Note:</span> {completion.notes}
                        </p>
                      </div>
                    )}
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
