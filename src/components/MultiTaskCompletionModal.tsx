'use client'

import { useState, useEffect, useRef } from 'react'
import { StarRating } from './StarRating'
import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface Task {
  id: string
  title: string
  image_url?: string
  image_alt_text?: string
  image_source?: 'library' | 'custom' | 'emoji'
}

interface TaskCompletion {
  taskId: string
  rating: number
  notes: string
}

interface MultiTaskCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (completions: TaskCompletion[]) => Promise<void>
  tasks: Task[]
  ageGroup: '5-8' | '9-12'
}

export function MultiTaskCompletionModal({
  isOpen,
  onClose,
  onSubmit,
  tasks,
  ageGroup
}: MultiTaskCompletionModalProps) {
  const { t } = useTranslation()
  const [completions, setCompletions] = useState<Map<string, { rating: number, notes: string }>>(new Map())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [useSameRating, setUseSameRating] = useState(false)
  const [globalRating, setGlobalRating] = useState(0)
  const modalRef = useRef<HTMLDivElement>(null)

  // Initialize completions for all tasks
  useEffect(() => {
    if (isOpen && tasks.length > 0) {
      const newCompletions = new Map()
      tasks.forEach(task => {
        newCompletions.set(task.id, { rating: 0, notes: '' })
      })
      setCompletions(newCompletions)
      setCurrentTaskIndex(0)
      setUseSameRating(tasks.length > 1)
      setGlobalRating(0)
    }
  }, [isOpen, tasks])

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

  const currentTask = tasks[currentTaskIndex]

  const handleRatingChange = (rating: number) => {
    if (useSameRating) {
      setGlobalRating(rating)
      // Apply to all tasks
      const newCompletions = new Map(completions)
      tasks.forEach(task => {
        const existing = newCompletions.get(task.id) || { rating: 0, notes: '' }
        newCompletions.set(task.id, { ...existing, rating })
      })
      setCompletions(newCompletions)
    } else if (currentTask) {
      const newCompletions = new Map(completions)
      const existing = newCompletions.get(currentTask.id) || { rating: 0, notes: '' }
      newCompletions.set(currentTask.id, { ...existing, rating })
      setCompletions(newCompletions)
    }
  }

  const handleNotesChange = (notes: string) => {
    if (!currentTask) return
    const newCompletions = new Map(completions)
    const existing = newCompletions.get(currentTask.id) || { rating: 0, notes: '' }
    newCompletions.set(currentTask.id, { ...existing, notes })
    setCompletions(newCompletions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all tasks have ratings
    const invalidTasks = tasks.filter(task => {
      const completion = completions.get(task.id)
      return !completion || completion.rating === 0
    })

    if (invalidTasks.length > 0) {
      setError('Please rate all tasks before submitting')
      return
    }

    // Validate notes length
    for (const task of tasks) {
      const completion = completions.get(task.id)
      if (completion && completion.notes.length > 500) {
        setError('Notes must be 500 characters or less')
        return
      }
    }

    try {
      setSubmitting(true)
      setError('')

      const completionArray = tasks.map(task => {
        const completion = completions.get(task.id)!
        return {
          taskId: task.id,
          rating: completion.rating,
          notes: completion.notes
        }
      })

      await onSubmit(completionArray)

      // Reset
      setCompletions(new Map())
      setUseSameRating(false)
      setGlobalRating(0)
      setCurrentTaskIndex(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setCompletions(new Map())
      setUseSameRating(false)
      setGlobalRating(0)
      setCurrentTaskIndex(0)
      setError('')
      onClose()
    }
  }

  const goToNextTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1)
    }
  }

  const goToPreviousTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1)
    }
  }

  if (!isOpen || !currentTask) return null

  const currentCompletion = completions.get(currentTask.id) || { rating: 0, notes: '' }
  const allRated = tasks.every(task => {
    const completion = completions.get(task.id)
    return completion && completion.rating > 0
  })

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
      <motion.div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex justify-between items-start">
            <div className="flex-1">
              <h2
                id="modal-title"
                className={`
                  font-bold mb-2
                  ${ageGroup === '5-8' ? 'text-2xl text-purple-600' : 'text-xl text-gray-900'}
                `}
              >
                {tasks.length === 1
                  ? (ageGroup === '5-8' ? '🎉 Great job!' : 'Task Completed!')
                  : `Complete ${tasks.length} Tasks!`
                }
              </h2>
              {tasks.length > 1 && (
                <p className="text-sm text-gray-600">
                  Task {currentTaskIndex + 1} of {tasks.length}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Task Progress Indicators (for multiple tasks) */}
          {tasks.length > 1 && (
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {tasks.map((task, index) => {
                const completion = completions.get(task.id)
                const isCompleted = completion && completion.rating > 0
                const isCurrent = index === currentTaskIndex

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => setCurrentTaskIndex(index)}
                    className={`
                      flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all
                      ${isCurrent
                        ? ageGroup === '5-8'
                          ? 'bg-purple-500 text-white'
                          : 'bg-blue-500 text-white'
                        : isCompleted
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-center gap-1">
                      {isCompleted && <CheckIcon className="w-3 h-3" />}
                      <span className="truncate max-w-[100px]">{task.title}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Current Task Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              {currentTask.image_url && (
                <div className="flex-shrink-0">
                  {currentTask.image_source === 'emoji' ? (
                    <span className="text-4xl">{currentTask.image_url}</span>
                  ) : (
                    <Image
                      src={currentTask.image_url}
                      alt={currentTask.image_alt_text || currentTask.title}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  )}
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg text-gray-900">{currentTask.title}</h3>
              </div>
            </div>
          </div>

          {/* Same Rating for All (multiple tasks only) */}
          {tasks.length > 1 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSameRating}
                  onChange={(e) => setUseSameRating(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-blue-900">
                  Use same rating for all tasks
                </span>
              </label>
            </div>
          )}

          {/* Rating Section */}
          <div className="mb-6">
            <label className={`
              block mb-3 font-semibold
              ${ageGroup === '5-8' ? 'text-lg' : 'text-base'}
            `}>
              {ageGroup === '5-8' ? 'How did you do? ⭐' : 'Rate your effort:'}
            </label>
            <StarRating
              value={useSameRating ? globalRating : currentCompletion.rating}
              onChange={handleRatingChange}
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
              value={currentCompletion.notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder={ageGroup === '5-8'
                ? 'Tell us about it...'
                : 'How did it go? Any challenges?'
              }
              maxLength={500}
              rows={3}
              className={`
                w-full px-4 py-3 border-2 rounded-xl resize-none
                focus:outline-none focus:ring-2
                ${ageGroup === '5-8'
                  ? 'border-purple-200 focus:ring-purple-400 text-base'
                  : 'border-gray-300 focus:ring-blue-500 text-sm'
                }
              `}
            />
            <p className="text-xs text-gray-500 mt-1">
              {currentCompletion.notes.length}/500 characters
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
            {tasks.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goToPreviousTask}
                  disabled={currentTaskIndex === 0}
                  className="px-4 py-2 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {currentTaskIndex < tasks.length - 1 ? (
                  <button
                    type="button"
                    onClick={goToNextTask}
                    className={`
                      flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all
                      ${ageGroup === '5-8'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        : 'bg-blue-600 hover:bg-blue-700'
                      }
                    `}
                  >
                    Next Task →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting || !allRated}
                    className={`
                      flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${ageGroup === '5-8'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        : 'bg-blue-600 hover:bg-blue-700'
                      }
                      ${allRated ? 'shadow-lg hover:shadow-xl' : ''}
                    `}
                  >
                    {submitting ? t('common.saving') : (ageGroup === '5-8' ? '✨ Done!' : `Complete ${tasks.length} ${tasks.length === 1 ? 'Task' : 'Tasks'}`)}
                  </button>
                )}
              </>
            )}
            {tasks.length === 1 && (
              <>
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
                  disabled={submitting || currentCompletion.rating === 0}
                  className={`
                    flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${ageGroup === '5-8'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                      : 'bg-blue-600 hover:bg-blue-700'
                    }
                    ${currentCompletion.rating > 0 ? 'shadow-lg hover:shadow-xl' : ''}
                  `}
                >
                  {submitting ? t('common.saving') : (ageGroup === '5-8' ? '✨ Done!' : 'Submit')}
                </button>
              </>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  )
}
