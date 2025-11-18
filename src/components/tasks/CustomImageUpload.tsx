'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'

interface CustomImageUploadProps {
  familyId: string
  taskId?: string
  onUploadComplete: (url: string, altText: string) => void
}

export function CustomImageUpload({
  familyId,
  taskId = 'new',
  onUploadComplete
}: CustomImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setError(null)

      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, WebP, or SVG)')
        return
      }

      // Validate file size (1MB max)
      if (file.size > 1024 * 1024) {
        setError('Image must be less than 1MB')
        return
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `custom/${familyId}/${taskId}/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('task-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('task-images')
        .getPublicUrl(filePath)

      onUploadComplete(publicUrl, file.name)
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block">
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${uploading
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-gray-400 hover:border-blue-500 hover:bg-blue-50'}
          `}
        >
          <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            {uploading ? 'Uploading...' : 'Click to upload custom image'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            JPEG, PNG, WebP, or SVG • Max 1MB
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </div>
      </label>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
