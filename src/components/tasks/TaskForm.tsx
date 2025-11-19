'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImagePicker } from './ImagePicker'
import { CustomImageUpload } from './CustomImageUpload'
import { RecurrencePatternPicker } from './RecurrencePatternPicker'
import { CreateTaskSchema } from '@/lib/schemas'
import { useTranslation } from '@/hooks/useTranslation'

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
  submitLabel,
  availableChildren = []
}: TaskFormProps) {
  const { t } = useTranslation()
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
    mode: 'onBlur', // Validate on blur instead of onChange
    reValidateMode: 'onBlur', // Re-validate on blur
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || 'other',
      priority: initialData?.priority || 'medium',
      due_date: initialData?.due_date || '',
      recurring: initialData?.recurring || false,
      recurring_type: initialData?.recurring_type || null,
      rrule: (initialData as any)?.rrule || null,
      recurrence_pattern_description: (initialData as any)?.recurrence_pattern_description || null,
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
          {t('tasks.task_title')} *
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('tasks.title_placeholder')}
          aria-label={t('tasks.task_title')}
          aria-required="true"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.title.message}</p>
        )}
      </div>

      {/* Task Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          {t('tasks.description')}
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t('tasks.description_placeholder')}
          aria-label={t('tasks.description')}
        />
        <p className="mt-1 text-xs text-gray-500">{t('tasks.description_help')}</p>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.description.message}</p>
        )}
      </div>

      {/* Task Image Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('tasks.task_image')}
        </label>
        <p className="text-xs text-gray-500 mb-2">{t('tasks.image_help')}</p>

        {/* Current Image Preview */}
        {selectedImage.url && (
          <div className="mb-4 flex items-center gap-4">
            <div className="w-16 h-16 border-2 border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-white" aria-label={t('tasks.image_preview')}>
              {selectedImage.source === 'emoji' ? (
                <span className="text-3xl">{selectedImage.url}</span>
              ) : (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.altText || t('tasks.task_image')}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage({ url: null, altText: null, source: null })}
              className="text-sm text-red-600 hover:text-red-700"
              aria-label={t('tasks.remove_image')}
            >
              {t('tasks.remove_image')}
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
            aria-expanded={showImagePicker}
            aria-controls="image-picker"
          >
            {showImagePicker ? t('common.close') : t('tasks.choose_from_library')}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCustomUpload(!showCustomUpload)
              setShowImagePicker(false)
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            aria-expanded={showCustomUpload}
            aria-controls="custom-upload"
          >
            {showCustomUpload ? t('common.close') : t('tasks.upload_custom')}
          </button>
        </div>

        {/* Image Picker */}
        {showImagePicker && (
          <div id="image-picker" className="mt-4 border border-gray-200 rounded-lg p-4">
            <ImagePicker
              onSelect={handleImageSelect}
              currentImage={selectedImage.url || undefined}
            />
          </div>
        )}

        {/* Custom Upload */}
        {showCustomUpload && (
          <div id="custom-upload" className="mt-4">
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
            {t('tasks.category')} *
          </label>
          <select
            id="category"
            {...register('category')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('tasks.category')}
            aria-required="true"
          >
            <option value="cleaning">{t('tasks.categories.cleaning')}</option>
            <option value="homework">{t('tasks.categories.homework')}</option>
            <option value="hygiene">{t('tasks.categories.hygiene')}</option>
            <option value="outdoor">{t('tasks.categories.outdoor')}</option>
            <option value="helping">{t('tasks.categories.helping')}</option>
            <option value="meals">{t('tasks.categories.meals')}</option>
            <option value="pets">{t('tasks.categories.pets')}</option>
            <option value="bedtime">{t('tasks.categories.bedtime')}</option>
            <option value="other">{t('tasks.categories.other')}</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600" role="alert">{errors.category.message}</p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            {t('tasks.priority')} *
          </label>
          <select
            id="priority"
            {...register('priority')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('tasks.priority')}
            aria-required="true"
          >
            <option value="low">{t('tasks.priorities.low')}</option>
            <option value="medium">{t('tasks.priorities.medium')}</option>
            <option value="high">{t('tasks.priorities.high')}</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600" role="alert">{errors.priority.message}</p>
          )}
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
          {t('tasks.due_date')}
        </label>
        <input
          id="due_date"
          type="date"
          {...register('due_date')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={t('tasks.due_date')}
        />
        {errors.due_date && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.due_date.message}</p>
        )}
      </div>

      {/* Recurring Checkbox */}
      <div className="flex items-center gap-2">
        <input
          id="recurring"
          type="checkbox"
          {...register('recurring')}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          aria-describedby="recurring-help"
        />
        <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
          {t('tasks.recurring')}
        </label>
      </div>
      <p id="recurring-help" className="text-xs text-gray-500 -mt-4 ml-6">{t('tasks.recurring_help')}</p>

      {/* Recurring Pattern Picker (shown if recurring is checked) */}
      {recurring && (
        <RecurrencePatternPicker
          value={watch('rrule') || undefined}
          onChange={(rrule, description) => {
            setValue('rrule', rrule)
            setValue('recurrence_pattern_description', description)
          }}
        />
      )}

      {/* Assign to Children */}
      {availableChildren.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('tasks.assign_to')}
          </label>
          <p className="text-xs text-gray-500 mb-2">{t('tasks.assign_help')}</p>
          <div className="space-y-2" role="group" aria-label={t('tasks.select_children')}>
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
          aria-busy={submitting}
        >
          {submitting ? t('common.saving') : (submitLabel || t('tasks.create_task'))}
        </button>
      </div>
    </form>
  )
}
