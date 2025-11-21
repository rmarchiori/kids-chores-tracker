'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import Image from 'next/image'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { StarRating } from '@/components/StarRating'
import { ReviewDialog } from '@/components/ReviewDialog'
import { usePendingReviews } from '@/lib/hooks/useData'
import { motion } from 'framer-motion'

interface PendingReview {
  id: string
  task_id: string
  child_id: string
  completed_at: string
  child_rating: number
  child_notes?: string
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

export default function ReviewsPage() {
  const { t } = useTranslation()
  const { data: pendingReviews = [], isLoading: loading, mutate } = usePendingReviews()
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)

  function handleReview(review: PendingReview) {
    setSelectedReview(review)
    setShowReviewDialog(true)
  }

  async function handleSubmitReview(parentRating: number, parentFeedback: string) {
    if (!selectedReview) return

    try {
      const response = await fetch(`/api/completions/${selectedReview.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_rating: parentRating,
          parent_feedback: parentFeedback,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit review')
      }

      // Close dialog
      setShowReviewDialog(false)
      setSelectedReview(null)

      // Refresh pending reviews via SWR
      await mutate()
    } catch (error) {
      console.error('Error submitting review:', error)
      throw error // Re-throw to let dialog handle the error
    }
  }

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
          className="mb-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl shadow-2xl p-8 text-white"
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
            ⭐
          </motion.div>
          <h1 className="text-4xl font-black mb-2">Tasks to Review</h1>
          <p className="text-white/90 text-lg">
            {pendingReviews.length} task{pendingReviews.length !== 1 ? 's' : ''} waiting for your review
          </p>
        </motion.div>

        {/* Pending Reviews List */}
        {pendingReviews.length === 0 ? (
          <motion.div
            className="text-center py-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl shadow-2xl text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <motion.div
              className="text-6xl mb-4 inline-block"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              🎉
            </motion.div>
            <p className="text-2xl font-black">All caught up!</p>
            <p className="text-white/90 mt-2 text-lg">No tasks pending review</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {pendingReviews.map((review: PendingReview, index: number) => (
              <motion.div
                key={review.id}
                className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-orange-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-start gap-4">
                  {/* Child Avatar */}
                  <div className="flex-shrink-0">
                    {review.children.profile_photo_url ? (
                      <Image
                        src={review.children.profile_photo_url}
                        alt={review.children.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xl font-bold text-blue-600">
                          {review.children.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{review.children.name}</p>
                        <p className="text-sm text-gray-500">{formatDate(review.completed_at)}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg">
                        ⏳ Pending Review
                      </span>
                    </div>

                    {/* Task Info */}
                    <div className="flex items-center gap-3 mt-3 p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl border border-orange-200">
                      {review.tasks.image_url && (
                        <div className="flex-shrink-0">
                          {review.tasks.image_source === 'emoji' ? (
                            <span className="text-3xl">{review.tasks.image_url}</span>
                          ) : (
                            <Image
                              src={review.tasks.image_url}
                              alt={review.tasks.image_alt_text || review.tasks.title}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{review.tasks.title}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-white rounded-full text-gray-600 border border-gray-200">
                            {review.tasks.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Child's Rating */}
                    <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl border-2 border-orange-200">
                      <p className="text-sm font-black text-gray-700 mb-2">Child's Self-Rating:</p>
                      <StarRating
                        value={review.child_rating}
                        readonly
                        size="sm"
                        showLabel={false}
                      />
                      {review.child_notes && (
                        <div className="mt-3 p-3 bg-white rounded-3xl shadow-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-black">Note:</span> {review.child_notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Review Button */}
                    <motion.button
                      onClick={() => handleReview(review)}
                      className="mt-4 w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-black rounded-3xl transition-colors shadow-2xl"
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      Review Task
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      {selectedReview && (
        <ReviewDialog
          isOpen={showReviewDialog}
          onClose={() => {
            setShowReviewDialog(false)
            setSelectedReview(null)
          }}
          onSubmit={handleSubmitReview}
          completionData={{
            taskTitle: selectedReview.tasks.title,
            taskImage: selectedReview.tasks.image_url,
            taskImageAlt: selectedReview.tasks.image_alt_text,
            taskImageSource: selectedReview.tasks.image_source,
            childName: selectedReview.children.name,
            childRating: selectedReview.child_rating,
            childNotes: selectedReview.child_notes,
            childAgeGroup: selectedReview.children.age_group,
          }}
        />
      )}
    </DashboardLayout>
  )
}
