'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { MagnifyingGlassIcon, PhotoIcon, FaceSmileIcon } from '@heroicons/react/24/outline'
import { TaskImage } from '@/lib/schemas'
import { useTranslation } from '@/hooks/useTranslation'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

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
  const { t } = useTranslation()
  const [filteredImages, setFilteredImages] = useState<TaskImage[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'library' | 'emoji'>('library')

  const categories = ['all', 'cleaning', 'homework', 'hygiene', 'outdoor', 'helping', 'meals', 'pets', 'bedtime']

  // Fetch image library with SWR caching
  const { data: images = [], error, isLoading: loading } = useSWR<TaskImage[]>(
    '/api/task-images',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  )

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
      <div className="flex gap-2 border-b border-gray-200" role="tablist" aria-label={t('tasks.image_picker.title')}>
        <button
          type="button"
          onClick={() => setActiveTab('library')}
          role="tab"
          aria-selected={activeTab === 'library'}
          aria-controls="library-panel"
          className={`
            px-4 py-2 font-medium transition-colors flex items-center gap-2
            ${activeTab === 'library'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          <PhotoIcon className="w-5 h-5" aria-hidden="true" />
          {t('tasks.image_picker.library_tab')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('emoji')}
          role="tab"
          aria-selected={activeTab === 'emoji'}
          aria-controls="emoji-panel"
          className={`
            px-4 py-2 font-medium transition-colors flex items-center gap-2
            ${activeTab === 'emoji'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          <FaceSmileIcon className="w-5 h-5" aria-hidden="true" />
          {t('tasks.image_picker.emoji_tab')}
        </button>
      </div>

      {activeTab === 'library' ? (
        <div id="library-panel" role="tabpanel" aria-labelledby="library-tab">
          {/* Search Bar */}
          <div className="relative">
            <label htmlFor="image-search" className="sr-only">
              {t('tasks.image_picker.search_label')}
            </label>
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              id="image-search"
              type="text"
              placeholder={t('tasks.image_picker.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={t('tasks.image_picker.search_label')}
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('tasks.image_picker.category_filter')}>
            {categories.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
                aria-pressed={selectedCategory === category}
              >
                {category === 'all'
                  ? t('tasks.image_picker.all_categories')
                  : t(`tasks.categories.${category}`)}
              </button>
            ))}
          </div>

          {/* Image Grid */}
          {loading ? (
            <div className="text-center py-8 text-gray-500" role="status" aria-live="polite">
              {t('tasks.image_picker.loading')}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600" role="alert">
              {t('tasks.messages.error_loading')}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500" role="status">
              {t('tasks.image_picker.no_results')}
            </div>
          ) : (
            <div
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-96 overflow-y-auto p-2"
              role="grid"
              aria-label={t('tasks.image_picker.title')}
            >
              {filteredImages.map(image => {
                // Generate translation key from image name (e.g., "Make Bed" -> "make_bed")
                const translationKey = image.name.toLowerCase().replace(/\s+/g, '_')
                const nameKey = `tasks.images.${translationKey}`
                const altKey = `tasks.images.${translationKey}_alt`
                // If translation returns the key itself, use the fallback (database value)
                const translatedName = t(nameKey) !== nameKey ? t(nameKey) : image.name
                const translatedAlt = t(altKey) !== altKey ? t(altKey) : image.alt_text

                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => onSelect(image.file_path, translatedAlt, 'library')}
                    role="gridcell"
                    className={`
                      relative aspect-square rounded-lg border-2 overflow-hidden
                      transition-all hover:scale-105 bg-white
                      ${currentImage === image.file_path
                        ? 'border-blue-600 ring-2 ring-blue-600'
                        : 'border-gray-200 hover:border-blue-400'}
                    `}
                    aria-label={translatedName}
                    aria-pressed={currentImage === image.file_path}
                  >
                    <Image
                      src={image.file_path}
                      alt={translatedAlt}
                      fill
                      className="object-contain p-2"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center truncate">
                      {translatedName}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* Emoji Grid */
        <div
          id="emoji-panel"
          role="tabpanel"
          aria-labelledby="emoji-tab"
          className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 max-h-96 overflow-y-auto p-2"
        >
          {EMOJI_OPTIONS.map(option => {
            const translationKey = option.name.toLowerCase().replace(/\s+/g, '_')
            const emojiKey = `tasks.emojis.${translationKey}`
            const translatedName = t(emojiKey) !== emojiKey ? t(emojiKey) : option.name

            return (
              <button
                key={option.emoji}
                type="button"
                onClick={() => onSelect(option.emoji, translatedName, 'emoji')}
                className={`
                  aspect-square rounded-lg border-2 flex items-center justify-center
                  text-4xl transition-all hover:scale-110 bg-white
                  ${currentImage === option.emoji
                    ? 'border-blue-600 ring-2 ring-blue-600'
                    : 'border-gray-200 hover:border-blue-400'}
                `}
                aria-label={translatedName}
                aria-pressed={currentImage === option.emoji}
              >
                {option.emoji}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
