'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { MagnifyingGlassIcon, PhotoIcon, FaceSmileIcon } from '@heroicons/react/24/outline'
import { TaskImage } from '@/lib/schemas'

interface ImagePickerProps {
  onSelect: (imageUrl: string, altText: string, source: 'library' | 'emoji') => void
  currentImage?: string | null
}

const EMOJI_OPTIONS = [
  { emoji: '🛏️', name: 'Bed', keywords: ['bed', 'sleep'] },
  { emoji: '🧹', name: 'Broom', keywords: ['clean', 'sweep'] },
  { emoji: '🪥', name: 'Toothbrush', keywords: ['teeth', 'brush'] },
  { emoji: '📚', name: 'Books', keywords: ['read', 'study', 'homework'] },
  { emoji: '🍽️', name: 'Plate', keywords: ['eat', 'meal', 'dinner'] },
  { emoji: '🐕', name: 'Dog', keywords: ['pet', 'dog', 'walk'] },
  { emoji: '🌱', name: 'Plant', keywords: ['water', 'garden'] },
  { emoji: '🧸', name: 'Toy', keywords: ['toys', 'organize'] },
  { emoji: '👕', name: 'Clothes', keywords: ['laundry', 'clothes'] },
  { emoji: '🚿', name: 'Shower', keywords: ['shower', 'bath'] },
]

export function ImagePicker({ onSelect, currentImage }: ImagePickerProps) {
  const [images, setImages] = useState<TaskImage[]>([])
  const [filteredImages, setFilteredImages] = useState<TaskImage[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'library' | 'emoji'>('library')

  const categories = ['all', 'cleaning', 'homework', 'hygiene', 'outdoor', 'helping', 'meals', 'pets', 'bedtime']

  // Fetch image library
  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch('/api/task-images')
        if (!response.ok) {
          throw new Error('Failed to fetch images')
        }
        const data = await response.json()
        setImages(data)
        setFilteredImages(data)
      } catch (error) {
        console.error('Failed to fetch task images:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchImages()
  }, [])

  // Filter images by category and search
  useEffect(() => {
    let filtered = images

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(img => img.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(img =>
        img.name.toLowerCase().includes(query) ||
        img.keywords.some(keyword => keyword.toLowerCase().includes(query))
      )
    }

    setFilteredImages(filtered)
  }, [selectedCategory, searchQuery, images])

  return (
    <div className="space-y-4">
      {/* Tab Selector */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('library')}
          className={`
            px-4 py-2 font-medium transition-colors flex items-center gap-2
            ${activeTab === 'library'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          <PhotoIcon className="w-5 h-5" />
          Image Library
        </button>
        <button
          onClick={() => setActiveTab('emoji')}
          className={`
            px-4 py-2 font-medium transition-colors flex items-center gap-2
            ${activeTab === 'emoji'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          <FaceSmileIcon className="w-5 h-5" />
          Emojis
        </button>
      </div>

      {activeTab === 'library' ? (
        <>
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Image Grid */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading images...</div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No images found. Try a different search or category.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-96 overflow-y-auto p-2">
              {filteredImages.map(image => (
                <button
                  key={image.id}
                  onClick={() => onSelect(image.file_path, image.alt_text, 'library')}
                  className={`
                    relative aspect-square rounded-lg border-2 overflow-hidden
                    transition-all hover:scale-105 bg-white
                    ${currentImage === image.file_path
                      ? 'border-blue-600 ring-2 ring-blue-600'
                      : 'border-gray-200 hover:border-blue-400'}
                  `}
                  title={image.name}
                >
                  <Image
                    src={image.file_path}
                    alt={image.alt_text}
                    fill
                    className="object-contain p-2"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center truncate">
                    {image.name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Emoji Grid */
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 max-h-96 overflow-y-auto p-2">
          {EMOJI_OPTIONS.map(option => (
            <button
              key={option.emoji}
              onClick={() => onSelect(option.emoji, option.name, 'emoji')}
              className={`
                aspect-square rounded-lg border-2 flex items-center justify-center
                text-4xl transition-all hover:scale-110 bg-white
                ${currentImage === option.emoji
                  ? 'border-blue-600 ring-2 ring-blue-600'
                  : 'border-gray-200 hover:border-blue-400'}
              `}
              title={option.name}
            >
              {option.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
