'use client'

import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/lib/theme-utils'
import { ThemeCard } from '@/components/theme/ThemeCard'
import { useTranslation } from '@/hooks/useTranslation'

interface TaskCardProps {
  task: {
    id: string
    title: string
    description?: string | null
    image_url?: string | null
    image_alt_text?: string | null
    image_source?: 'library' | 'custom' | 'emoji' | null
    category: string
    priority: string
    status?: 'pending' | 'completed' | 'pending_review'
  }
  onClick?: () => void
  showDescription?: boolean
}

export function TaskCard({ task, onClick, showDescription = true }: TaskCardProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const themeClasses = getThemeClasses(theme)

  // Default status to pending if not provided
  const status = task.status || 'pending'

  // Get status label
  const getStatusLabel = (status: string) => {
    if (status === 'completed') return t('tasks.status.completed')
    if (status === 'pending_review') return t('tasks.status.in_progress')
    return t('tasks.status.pending')
  }

  return (
    <ThemeCard>
      <button
        onClick={onClick}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
        aria-label={`${task.title} - ${getStatusLabel(status)}`}
      >
        {/* Image Section - Hybrid Image + Text */}
        <div className="flex items-center gap-4 mb-3">
          {/* Task Image/Emoji */}
          <div
            className={`
              flex-shrink-0 flex items-center justify-center
              ${themeClasses.iconSize}
            `}
          >
            {task.image_url ? (
              task.image_source === 'emoji' ? (
                <span className="text-4xl">{task.image_url}</span>
              ) : (
                <Image
                  src={task.image_url}
                  alt={task.image_alt_text || task.title}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              )
            ) : (
              // Fallback: First letter of task title in colored circle
              <div
                className={`
                  ${themeClasses.iconSize}
                  rounded-full
                  ${themeClasses.primary}
                  flex items-center justify-center
                  font-bold text-white
                  ${themeClasses.textSize}
                `}
              >
                {task.title.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Task Title */}
          <h3
            className={`
              flex-1 font-semibold
              ${themeClasses.textSize}
              ${themeClasses.text}
            `}
          >
            {task.title}
          </h3>
        </div>

        {/* Description (if present and showDescription is true) */}
        {showDescription && task.description && theme === 'parent' && (
          <p className={`text-sm ${themeClasses.textSecondary} mb-2`}>
            {task.description}
          </p>
        )}

        {/* Status Badge and Category/Priority for parent view */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span
            className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${
                status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : status === 'pending_review'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }
            `}
            aria-label={`Status: ${getStatusLabel(status)}`}
          >
            {status === 'completed' ? '✓ ' : status === 'pending_review' ? '⏳ ' : ''}
            {getStatusLabel(status)}
          </span>

          {theme === 'parent' && (
            <div className="flex gap-2 text-xs text-gray-500" aria-label={`${t('tasks.category')}: ${t(`tasks.categories.${task.category}`)}, ${t('tasks.priority')}: ${t(`tasks.priorities.${task.priority}`)}`}>
              <span>{t(`tasks.categories.${task.category}`)}</span>
              <span aria-hidden="true">•</span>
              <span>{t(`tasks.priorities.${task.priority}`)}</span>
            </div>
          )}
        </div>
      </button>
    </ThemeCard>
  )
}
