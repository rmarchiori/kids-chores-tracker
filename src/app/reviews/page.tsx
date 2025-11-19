'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import Image from 'next/image'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { StarRating } from '@/components/StarRating'
import { ReviewDialog } from '@/components/ReviewDialog'
import { usePendingReviews } from '@/lib/hooks/useData'

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks to Review</h1>
          <p className="text-gray-600">
            {pendingReviews.length} task{pendingReviews.length !== 1 ? 's' : ''} waiting for your review
          </p>
        </div>

        {/* Pending Reviews List */}
        {pendingReviews.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <p className="text-xl text-gray-500">🎉 All caught up!</p>
            <p className="text-gray-400 mt-2">No tasks pending review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingReviews.map((review: PendingReview) => (
              <div
                key={review.id}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200"
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
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⏳ Pending Review
                      </span>
                    </div>

                    {/* Task Info */}
                    <div className="flex items-center gap-3 mt-3 p-3 bg-gray-50 rounded-lg">
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
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Child's Self-Rating:</p>
                      <StarRating
                        value={review.child_rating}
                        readonly
                        size="sm"
                        showLabel={false}
                      />
                      {review.child_notes && (
                        <div className="mt-3 p-3 bg-white rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Note:</span> {review.child_notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Review Button */}
                    <button
                      onClick={() => handleReview(review)}
                      className="mt-4 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                    >
                      Review Task
                    </button>
                  </div>
                </div>
              </div>
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
