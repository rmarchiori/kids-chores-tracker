'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { DraggableListSkeleton } from '@/components/ui/LoadingSkeletons'

// Dynamic import for DraggableSubtaskList (only loads when editable=true)
// Saves ~200KB (@dnd-kit libraries) from initial bundle
const DraggableSubtaskList = dynamic(
  () => import('./DraggableSubtaskList').then(mod => mod.DraggableSubtaskList),
  {
    loading: () => <DraggableListSkeleton />,
    ssr: false
  }
)

interface Subtask {
  id: string
  title: string
  description?: string
  completed: boolean
  order_index: number
}

interface SubtaskListProps {
  taskId: string
  subtasks: Subtask[]
  onUpdate: (subtasks: Subtask[]) => void
  editable?: boolean
  ageGroup?: '5-8' | '9-12'
}

// Simple read-only subtask list (no drag-and-drop)
function SimpleSubtaskList({
  subtasks,
  onUpdate,
  ageGroup = '9-12'
}: {
  subtasks: Subtask[]
  onUpdate: (subtasks: Subtask[]) => void
  ageGroup?: '5-8' | '9-12'
}) {
  const [items, setItems] = useState(subtasks)

  // Sync local state with props
  useEffect(() => {
    setItems(subtasks)
  }, [subtasks])

  const handleToggle = (id: string) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    )
    setItems(newItems)
    onUpdate(newItems)
  }

  const completedCount = items.filter(item => item.completed).length
  const totalCount = items.length
  const checkboxSize = ageGroup === '5-8' ? 'w-8 h-8' : 'w-5 h-5'

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      {totalCount > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              Progress: {completedCount}/{totalCount}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round((completedCount / totalCount) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Simple Subtask List (no dragging) */}
      <div className="space-y-2">
        {items.map(subtask => (
          <div key={subtask.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              checked={subtask.completed}
              onChange={() => handleToggle(subtask.id)}
              className={`${checkboxSize} text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500`}
            />

            <div className="flex-1">
              <p className={`${subtask.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {subtask.title}
              </p>
              {subtask.description && (
                <p className="text-sm text-gray-500">{subtask.description}</p>
              )}
            </div>

            {subtask.completed && ageGroup === '5-8' && (
              <span className="text-2xl">✅🎉</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SubtaskList({ taskId, subtasks, onUpdate, editable = false, ageGroup = '9-12' }: SubtaskListProps) {
  // If editable, dynamically load the draggable version with @dnd-kit
  // Otherwise, use simple read-only list (no extra bundle size)
  if (editable) {
    return (
      <DraggableSubtaskList
        taskId={taskId}
        subtasks={subtasks}
        onUpdate={onUpdate}
        ageGroup={ageGroup}
      />
    )
  }

  return (
    <SimpleSubtaskList
      subtasks={subtasks}
      onUpdate={onUpdate}
      ageGroup={ageGroup}
    />
  )
}
