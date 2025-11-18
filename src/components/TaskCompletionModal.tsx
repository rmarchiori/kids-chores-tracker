'use client'

import { useState, useEffect, useRef } from 'react'
import { StarRating } from './StarRating'
import { useTranslation } from '@/hooks/useTranslation'

interface TaskCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, notes: string) => Promise<void>
  taskTitle: string
  ageGroup: '5-8' | '9-12'
}

export function TaskCompletionModal({
  isOpen,
  onClose,
  onSubmit,
  taskTitle,
  ageGroup
}: TaskCompletionModalProps) {
  const { t } = useTranslation()
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, submitting])

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }

      document.addEventListener('keydown', handleTab)
      firstElement?.focus()

      return () => document.removeEventListener('keydown', handleTab)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError('Please select a star rating')
      return
    }

    if (notes.length > 500) {
      setError('Notes must be 500 characters or less')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      await onSubmit(rating, notes)
      // Reset form
      setRating(0)
      setNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setRating(0)
      setNotes('')
      setError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          handleClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h2
              id="modal-title"
              className={`
                font-bold mb-2
                ${ageGroup === '5-8' ? 'text-2xl text-purple-600' : 'text-xl text-gray-900'}
              `}
            >
              {ageGroup === '5-8' ? '🎉 Great job!' : 'Task Completed!'}
            </h2>
            <p className="text-gray-600 font-medium">{taskTitle}</p>
          </div>

          {/* Rating Section */}
          <div className="mb-6">
            <label className={`
              block mb-3 font-semibold
              ${ageGroup === '5-8' ? 'text-lg' : 'text-base'}
            `}>
              {ageGroup === '5-8' ? 'How did you do? ⭐' : 'Rate your effort:'}
            </label>
            <StarRating
              value={rating}
              onChange={setRating}
              size={ageGroup === '5-8' ? 'xl' : 'lg'}
              ageGroup={ageGroup}
            />
          </div>

          {/* Notes Section */}
          <div className="mb-6">
            <label htmlFor="completion-notes" className="block mb-2 font-semibold text-sm">
              {ageGroup === '5-8' ? 'Want to tell us more? (optional)' : 'Add notes (optional):'}
            </label>
            <textarea
              id="completion-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={ageGroup === '5-8'
                ? 'Tell us about it...'
                : 'How did it go? Any challenges?'
              }
              maxLength={500}
              rows={4}
              className={`
                w-full px-4 py-3 border-2 rounded-xl resize-none
                focus:outline-none focus:ring-2
                ${ageGroup === '5-8'
                  ? 'border-purple-200 focus:ring-purple-400 text-lg'
                  : 'border-gray-300 focus:ring-blue-500'
                }
              `}
            />
            <p className="text-xs text-gray-500 mt-1">
              {notes.length}/500 characters
            </p>
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
              disabled={submitting || rating === 0}
              className={`
                flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                ${ageGroup === '5-8'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  : 'bg-blue-600 hover:bg-blue-700'
                }
                ${rating > 0 ? 'shadow-lg hover:shadow-xl' : ''}
              `}
            >
              {submitting ? t('common.saving') : (ageGroup === '5-8' ? '✨ Done!' : 'Submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
