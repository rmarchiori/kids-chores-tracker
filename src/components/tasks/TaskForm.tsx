'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImagePicker } from './ImagePicker'
import { CustomImageUpload } from './CustomImageUpload'
import { CreateTaskSchema } from '@/lib/schemas'

type TaskFormData = z.infer<typeof CreateTaskSchema>

interface TaskFormProps {
  familyId: string
  taskId?: string
  initialData?: Partial<TaskFormData> & {
    image_url?: string | null
    image_alt_text?: string | null
    image_source?: 'library' | 'custom' | 'emoji' | null
  }
  onSubmit: (data: TaskFormData) => Promise<void>
  submitLabel?: string
  availableChildren?: Array<{ id: string; name: string }>
}

export function TaskForm({
  familyId,
  taskId,
  initialData,
  onSubmit,
  submitLabel = 'Create Task',
  availableChildren = []
}: TaskFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [showCustomUpload, setShowCustomUpload] = useState(false)
  const [selectedImage, setSelectedImage] = useState({
    url: initialData?.image_url || null,
    altText: initialData?.image_alt_text || null,
    source: initialData?.image_source || null
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<TaskFormData>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || 'other',
      priority: initialData?.priority || 'medium',
      due_date: initialData?.due_date || '',
      recurring: initialData?.recurring || false,
      recurring_type: initialData?.recurring_type || null,
      image_url: initialData?.image_url || null,
      image_alt_text: initialData?.image_alt_text || null,
      image_source: initialData?.image_source || null,
      assigned_children: initialData?.assigned_children || []
    }
  })

  const recurring = watch('recurring')

  // Update form values when image is selected
  useEffect(() => {
    if (selectedImage.url) {
      setValue('image_url', selectedImage.url)
      setValue('image_alt_text', selectedImage.altText || '')
      setValue('image_source', selectedImage.source as any)
    }
  }, [selectedImage, setValue])

  const handleImageSelect = (url: string, altText: string, source: 'library' | 'emoji') => {
    setSelectedImage({ url, altText, source })
    setShowImagePicker(false)
  }

  const handleCustomUploadComplete = (url: string, altText: string) => {
    setSelectedImage({ url, altText, source: 'custom' })
    setShowCustomUpload(false)
  }

  const onFormSubmit = async (data: TaskFormData) => {
    try {
      setSubmitting(true)
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Task Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Task Title *
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Make your bed"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Task Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Additional details about the task..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Task Image Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task Image (optional)
        </label>

        {/* Current Image Preview */}
        {selectedImage.url && (
          <div className="mb-4 flex items-center gap-4">
            <div className="w-16 h-16 border-2 border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-white">
              {selectedImage.source === 'emoji' ? (
                <span className="text-3xl">{selectedImage.url}</span>
              ) : (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.altText || ''}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage({ url: null, altText: null, source: null })}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove Image
            </button>
          </div>
        )}

        {/* Image Selection Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setShowImagePicker(!showImagePicker)
              setShowCustomUpload(false)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showImagePicker ? 'Hide' : 'Choose'} from Library
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCustomUpload(!showCustomUpload)
              setShowImagePicker(false)
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {showCustomUpload ? 'Hide' : 'Upload'} Custom Image
          </button>
        </div>

        {/* Image Picker */}
        {showImagePicker && (
          <div className="mt-4 border border-gray-200 rounded-lg p-4">
            <ImagePicker
              onSelect={handleImageSelect}
              currentImage={selectedImage.url || undefined}
            />
          </div>
        )}

        {/* Custom Upload */}
        {showCustomUpload && (
          <div className="mt-4">
            <CustomImageUpload
              familyId={familyId}
              taskId={taskId}
              onUploadComplete={handleCustomUploadComplete}
            />
          </div>
        )}
      </div>

      {/* Category and Priority Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            {...register('category')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="cleaning">Cleaning</option>
            <option value="homework">Homework</option>
            <option value="pets">Pets</option>
            <option value="other">Other</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority *
          </label>
          <select
            id="priority"
            {...register('priority')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
          Due Date (optional)
        </label>
        <input
          id="due_date"
          type="date"
          {...register('due_date')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.due_date && (
          <p className="mt-1 text-sm text-red-600">{errors.due_date.message}</p>
        )}
      </div>

      {/* Recurring Checkbox */}
      <div className="flex items-center gap-2">
        <input
          id="recurring"
          type="checkbox"
          {...register('recurring')}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
          Recurring Task
        </label>
      </div>

      {/* Recurring Type (shown if recurring is checked) */}
      {recurring && (
        <div>
          <label htmlFor="recurring_type" className="block text-sm font-medium text-gray-700 mb-1">
            Recurring Type
          </label>
          <select
            id="recurring_type"
            {...register('recurring_type')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select frequency...</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          {errors.recurring_type && (
            <p className="mt-1 text-sm text-red-600">{errors.recurring_type.message}</p>
          )}
        </div>
      )}

      {/* Assign to Children */}
      {availableChildren.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign to Children (optional)
          </label>
          <div className="space-y-2">
            {availableChildren.map(child => (
              <div key={child.id} className="flex items-center gap-2">
                <input
                  id={`child-${child.id}`}
                  type="checkbox"
                  value={child.id}
                  {...register('assigned_children')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor={`child-${child.id}`} className="text-sm text-gray-700">
                  {child.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={submitting}
          className={`
            flex-1 px-6 py-3 rounded-lg font-medium transition-colors
            ${
              submitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
