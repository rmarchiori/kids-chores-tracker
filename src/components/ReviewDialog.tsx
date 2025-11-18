'use client'

import { useState, useEffect } from 'react'
import { StarRating } from './StarRating'
import { useTranslation } from '@/hooks/useTranslation'
import Image from 'next/image'

interface ReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (parentRating: number, parentFeedback: string) => Promise<void>
  completionData: {
    taskTitle: string
    taskImage?: string
    taskImageAlt?: string
    taskImageSource?: 'library' | 'custom' | 'emoji'
    childName: string
    childRating: number
    childNotes?: string
    childAgeGroup: '5-8' | '9-12'
  }
}

export function ReviewDialog({
  isOpen,
  onClose,
  onSubmit,
  completionData
}: ReviewDialogProps) {
  const { t } = useTranslation()
  const [parentRating, setParentRating] = useState(0)
  const [parentFeedback, setParentFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Initialize parent rating with child's rating
  useEffect(() => {
    if (isOpen) {
      setParentRating(completionData.childRating)
      setParentFeedback('')
      setError('')
    }
  }, [isOpen, completionData.childRating])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (parentRating === 0) {
      setError('Please select a rating')
      return
    }

    if (parentFeedback.trim().length === 0) {
      setError('Please add some encouragement for your child')
      return
    }

    if (parentFeedback.length > 1000) {
      setError('Feedback must be 1000 characters or less')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      await onSubmit(parentRating, parentFeedback)
      // Reset form
      setParentRating(0)
      setParentFeedback('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setParentRating(completionData.childRating)
      setParentFeedback('')
      setError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Task</h2>
            <p className="text-gray-600">
              Provide feedback and adjust the rating if needed
            </p>
          </div>

          {/* Task & Child Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              {completionData.taskImage && (
                <div className="flex-shrink-0">
                  {completionData.taskImageSource === 'emoji' ? (
                    <span className="text-4xl">{completionData.taskImage}</span>
                  ) : (
                    <Image
                      src={completionData.taskImage}
                      alt={completionData.taskImageAlt || completionData.taskTitle}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  )}
                </div>
              )}
              <div>
                <p className="font-bold text-lg text-gray-900">{completionData.taskTitle}</p>
                <p className="text-sm text-gray-600">Completed by {completionData.childName}</p>
              </div>
            </div>

            {/* Child's Rating */}
            <div className="mt-4 p-3 bg-white rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                {completionData.childName}'s Self-Rating:
              </p>
              <StarRating
                value={completionData.childRating}
                readonly
                size="sm"
                showLabel={true}
              />
              {completionData.childNotes && (
                <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-gray-700 italic">
                  "{completionData.childNotes}"
                </div>
              )}
            </div>
          </div>

          {/* Parent Rating */}
          <div className="mb-6">
            <label className="block mb-3 font-semibold text-base">
              Your Rating:
            </label>
            <StarRating
              value={parentRating}
              onChange={setParentRating}
              size="lg"
              showLabel={true}
            />
            <p className="text-xs text-gray-500 mt-2">
              Adjust the rating if you think it should be different
            </p>
          </div>

          {/* Parent Feedback */}
          <div className="mb-6">
            <label htmlFor="parent-feedback" className="block mb-2 font-semibold text-base">
              Your Feedback: <span className="text-red-500">*</span>
            </label>
            <textarea
              id="parent-feedback"
              value={parentFeedback}
              onChange={(e) => setParentFeedback(e.target.value)}
              placeholder={
                completionData.childAgeGroup === '5-8'
                  ? 'Write an encouraging message for your child...'
                  : 'Provide constructive feedback and encouragement...'
              }
              maxLength={1000}
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {parentFeedback.length}/1000 characters
            </p>
          </div>

          {/* Feedback Suggestions */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-semibold text-green-800 mb-2">💡 Tips for great feedback:</p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Be specific about what they did well</li>
              <li>• Acknowledge their effort and improvement</li>
              <li>• Suggest one thing to focus on next time (if needed)</li>
              <li>• End with encouragement and positivity</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting || parentRating === 0 || parentFeedback.trim().length === 0}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t('common.saving') : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
