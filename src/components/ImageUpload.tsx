'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  validateImageFile,
  generatePhotoFilename,
  createPreviewUrl
} from '@/lib/image-utils'
import { useTranslation } from '@/hooks/useTranslation'
import { ImageCropModal } from './ImageCropModal'

interface ImageUploadProps {
  currentPhotoUrl?: string | null
  onPhotoUrlChange: (url: string | null) => void
}

export function ImageUpload({
  currentPhotoUrl,
  onPhotoUrlChange
}: ImageUploadProps) {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null)
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file')
      return
    }

    try {
      // Create preview for cropping
      const imageDataUrl = await createPreviewUrl(file)
      setOriginalImageSrc(imageDataUrl)
      setShowCropModal(true)
    } catch (err) {
      console.error('Error loading image:', err)
      setError(err instanceof Error ? err.message : 'Failed to load image')
    }
  }

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    try {
      setUploading(true)
      setShowCropModal(false)

      // Upload to Supabase Storage
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('User not authenticated')
      }

      const filename = generatePhotoFilename(session.user.id, 'cropped.jpg')

      const { data, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filename, croppedImageBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg',
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(data.path)

      onPhotoUrlChange(publicUrl)
      setPreviewUrl(publicUrl)
      setUploadedFilePath(null) // Clear tracking since upload completed successfully
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
      setOriginalImageSrc(null)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleCropCancel = async () => {
    setShowCropModal(false)
    setOriginalImageSrc(null)

    // Delete uploaded file if user cancels
    if (uploadedFilePath) {
      try {
        const supabase = createClient()
        await supabase.storage
          .from('profile-photos')
          .remove([uploadedFilePath])
        setUploadedFilePath(null)
      } catch (err) {
        console.error('Error deleting uploaded file:', err)
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = () => {
    setPreviewUrl(null)
    onPhotoUrlChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {t('children.profile_photo')}
      </label>

      {/* Preview */}
      <div className="flex justify-center">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
            />
            {!uploading && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                aria-label="Remove photo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex justify-center">
        <label className="cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Photo
              </>
            )}
          </span>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center">
        Upload a photo or choose a default avatar. Max size: 5MB. Formats: JPEG, PNG, WebP.
      </p>

      {/* Image Crop Modal */}
      {showCropModal && originalImageSrc && (
        <ImageCropModal
          imageSrc={originalImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}
