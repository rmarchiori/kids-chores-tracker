'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '@/lib/image-utils'

interface ImageCropModalProps {
  imageSrc: string
  onCropComplete: (croppedImageBlob: Blob) => void
  onCancel: () => void
}

export function ImageCropModal({
  imageSrc,
  onCropComplete,
  onCancel
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onCropCompleteCallback = useCallback(
    (
      _croppedArea: any,
      croppedAreaPixels: { x: number; y: number; width: number; height: number }
    ) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleSave = async () => {
    if (!croppedAreaPixels) return

    try {
      setProcessing(true)
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, 400, 0.85)
      onCropComplete(croppedImage)
    } catch (error) {
      console.error('Error cropping image:', error)
      alert('Failed to crop image. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Crop Profile Photo</h3>
          <p className="text-sm text-gray-600 mt-1">
            Adjust the image position and zoom to frame the photo perfectly
          </p>
        </div>

        {/* Cropper */}
        <div className="relative h-96 bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
            restrictPosition={false}
            zoomSpeed={0.1}
            minZoom={1}
            maxZoom={3}
          />
        </div>

        {/* Controls */}
        <div className="px-6 py-4 border-b border-gray-200 space-y-4">
          {/* Zoom Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1x</span>
              <span>2x</span>
              <span>3x</span>
            </div>
          </div>

          {/* Position Controls */}
          <div className="grid grid-cols-2 gap-4">
            {/* Horizontal Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horizontal
              </label>
              <input
                type="range"
                min={-100}
                max={100}
                step={1}
                value={crop.x}
                onChange={(e) => setCrop(prev => ({ ...prev, x: Number(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>←</span>
                <span>Center</span>
                <span>→</span>
              </div>
            </div>

            {/* Vertical Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vertical
              </label>
              <input
                type="range"
                min={-100}
                max={100}
                step={1}
                value={crop.y}
                onChange={(e) => setCrop(prev => ({ ...prev, y: Number(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>↑</span>
                <span>Center</span>
                <span>↓</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <p className="text-xs text-gray-500 text-center pt-2">
            💡 Tip: You can also drag the image directly or use the sliders above
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={processing}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={processing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 min-w-[100px]"
          >
            {processing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </div>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
