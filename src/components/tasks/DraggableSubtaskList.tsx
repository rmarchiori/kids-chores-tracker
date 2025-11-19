'use client'

import { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TrashIcon, Bars3Icon } from '@heroicons/react/24/outline'

interface Subtask {
  id: string
  title: string
  description?: string
  completed: boolean
  order_index: number
}

interface DraggableSubtaskListProps {
  taskId: string
  subtasks: Subtask[]
  onUpdate: (subtasks: Subtask[]) => void
  ageGroup?: '5-8' | '9-12'
}

function SortableSubtaskItem({
  subtask,
  ageGroup,
  onToggle,
  onDelete
}: {
  subtask: Subtask
  ageGroup?: '5-8' | '9-12'
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: subtask.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const checkboxSize = ageGroup === '5-8' ? 'w-8 h-8' : 'w-5 h-5'

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
      <div {...attributes} {...listeners} className="cursor-grab">
        <Bars3Icon className="w-5 h-5 text-gray-400" />
      </div>

      <input
        type="checkbox"
        checked={subtask.completed}
        onChange={() => onToggle(subtask.id)}
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

      <button
        onClick={() => onDelete(subtask.id)}
        className="p-1 text-red-600 hover:bg-red-50 rounded"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  )
}

export function DraggableSubtaskList({ taskId: _taskId, subtasks, onUpdate, ageGroup = '9-12' }: DraggableSubtaskListProps) {
  const [items, setItems] = useState(subtasks)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  // Sync local state with props when subtasks change from parent
  useEffect(() => {
    setItems(subtasks)
  }, [subtasks])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order_index: index
      }))

      setItems(newItems)
      onUpdate(newItems)
    }
  }

  const handleToggle = (id: string) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    )
    setItems(newItems)
    onUpdate(newItems)
  }

  const handleDelete = (id: string) => {
    const newItems = items.filter(item => item.id !== id)
    setItems(newItems)
    onUpdate(newItems)
  }

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return

    const newSubtask: Subtask = {
      id: `temp-${Date.now()}`,
      title: newSubtaskTitle,
      completed: false,
      order_index: items.length
    }

    const newItems = [...items, newSubtask]
    setItems(newItems)
    setNewSubtaskTitle('')
    onUpdate(newItems)
  }

  const completedCount = items.filter(item => item.completed).length
  const totalCount = items.length

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

      {/* Draggable Subtask List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map(subtask => (
              <SortableSubtaskItem
                key={subtask.id}
                subtask={subtask}
                ageGroup={ageGroup}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add New Subtask */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
          placeholder="Add a subtask..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddSubtask}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add
        </button>
      </div>
    </div>
  )
}
