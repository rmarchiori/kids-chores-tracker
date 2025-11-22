'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import Image from 'next/image'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { StarRating } from '@/components/StarRating'
import { useCompletions } from '@/lib/hooks/useData'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export default function CompletionsPage() {
  const { t } = useTranslation()
  const [filterChild, setFilterChild] = useState<string>('all')
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([])
  const [childrenLoading, setChildrenLoading] = useState(true)
  const supabase = createClient()

  // Use SWR hook for completions with filter
  const { data: completions = [], isLoading: completionsLoading } = useCompletions(
    filterChild !== 'all' ? filterChild : undefined,
    undefined,
    100
  )

  // Fetch children list for filter dropdown
  useEffect(() => {
    let isMounted = true

    const loadChildren = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data: membership } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('user_id', session.user.id)
          .single()

        if (!membership || !isMounted) return

        const { data: childrenData } = await supabase
          .from('children')
          .select('id, name')
          .eq('family_id', membership.family_id)
          .order('name')

        if (isMounted) {
          setChildren(childrenData || [])
          setChildrenLoading(false)
        }
      } catch (error) {
        console.error('Error fetching children:', error)
        if (isMounted) setChildrenLoading(false)
      }
    }

    loadChildren()

    return () => {
      isMounted = false
    }
  }, [])

  const loading = childrenLoading || completionsLoading

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
        <motion.div
          className="mb-8 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-3xl shadow-2xl p-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.01, y: -2 }}
        >
          <motion.div
            className="text-6xl mb-4 inline-block"
            animate={{ rotate: [-5, 5] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          >
            📊
          </motion.div>
          <h1 className="text-4xl font-black mb-2">{t('completions.title')}</h1>
          <p className="text-white/90 text-lg">{t('completions.description')}</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="mb-6 flex gap-4 items-center bg-gradient-to-br from-cyan-50 to-teal-50 p-6 rounded-3xl shadow-2xl border-2 border-cyan-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <label htmlFor="filter-child" className="text-sm font-black text-gray-700">
            {t('completions.filterByChild')}
          </label>
          <select
            id="filter-child"
            value={filterChild}
            onChange={(e) => setFilterChild(e.target.value)}
            className="px-4 py-2 border-2 border-cyan-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold"
          >
            <option value="all">{t('completions.allChildren')}</option>
            {children.map(child => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
          </select>
        </motion.div>

        {/* Completions List */}
        {completions.length === 0 ? (
          <motion.div
            className="text-center py-16 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-3xl shadow-2xl text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <motion.div
              className="text-6xl mb-4 inline-block"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📋
            </motion.div>
            <p className="text-2xl font-black">{t('completions.noCompletions')}</p>
            <p className="text-white/90 mt-2 text-lg">{t('completions.noCompletionsDescription')}</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {completions.map((completion: any, index: number) => (
              <motion.div
                key={completion.id}
                className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-cyan-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -5 }}
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
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-cyan-400 to-teal-400 text-white shadow-lg">
                        ✓ Completed
                      </span>
                    </div>

                    {/* Task Info */}
                    <div className="flex items-center gap-3 mt-3 p-3 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-3xl border border-cyan-200">
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

                    {/* Child Rating & Notes */}
                    {completion.child_rating && (
                      <div className="mt-3 p-3 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-3xl border-2 border-cyan-200">
                        <p className="text-xs font-black text-gray-700 mb-2">Child's Rating:</p>
                        <StarRating
                          value={completion.child_rating}
                          readonly
                          size="sm"
                          showLabel={false}
                        />
                        {completion.child_notes && (
                          <div className="mt-2 text-sm text-gray-700 italic font-medium">
                            "{completion.child_notes}"
                          </div>
                        )}
                      </div>
                    )}

                    {/* Parent Review */}
                    {completion.status === 'completed' && completion.parent_feedback && (
                      <div className="mt-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-300 shadow-lg">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-xs font-black text-green-800">Parent's Review:</p>
                          {completion.parent_rating && (
                            <StarRating
                              value={completion.parent_rating}
                              readonly
                              size="sm"
                              showLabel={false}
                            />
                          )}
                        </div>
                        <p className="text-sm text-green-900 font-black">
                          {completion.parent_feedback}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
