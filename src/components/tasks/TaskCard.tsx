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
    task_assignments?: Array<{
      id: string
      child_id: string
      children: {
        id: string
        name: string
        age_group: string
        profile_photo_url?: string | null
      }
    }>
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

        {/* Assigned Children - Show if present */}
        {task.task_assignments && task.task_assignments.length > 0 && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">{t('tasks.assign_to')}:</span>
            <div className="flex -space-x-2">
              {task.task_assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="relative group/avatar"
                  title={assignment.children.name}
                >
                  {assignment.children.profile_photo_url ? (
                    <Image
                      src={assignment.children.profile_photo_url}
                      alt={assignment.children.name}
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-white shadow-md bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {assignment.children.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-gray-900 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
                      {assignment.children.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges: Status, Category, Priority */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Badge */}
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

          {/* Category Badge */}
          <span
            className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200"
            aria-label={`${t('tasks.category')}: ${t(`tasks.categories.${task.category}`)}`}
          >
            {t(`tasks.categories.${task.category}`)}
          </span>

          {/* Priority Badge */}
          <span
            className={`
              px-3 py-1 rounded-full text-xs font-medium border
              ${
                task.priority === 'high'
                  ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
                  : task.priority === 'medium'
                  ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300'
              }
            `}
            aria-label={`${t('tasks.priority')}: ${t(`tasks.priorities.${task.priority}`)}`}
          >
            {task.priority === 'high' ? '🔴 ' : task.priority === 'medium' ? '🟡 ' : '⚪ '}
            {t(`tasks.priorities.${task.priority}`)}
          </span>
        </div>
      </button>
    </ThemeCard>
  )
}
