'use client'

import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  labels?: string[]
  showLabel?: boolean
  ageGroup?: '5-8' | '9-12'
}

const STAR_LABELS_DEFAULT = [
  'I gave it a try',
  'I did okay',
  'I did good',
  'I did great',
  'I did my best!'
]

const SIZE_CLASSES = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-4xl',
  xl: 'text-5xl'
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  labels = STAR_LABELS_DEFAULT,
  showLabel = true,
  ageGroup = '9-12'
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating)
    }
  }

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, rating: number) => {
    if (!readonly && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      handleClick(rating)
    }
  }

  const displayValue = hoverValue || value
  const currentLabel = displayValue > 0 && displayValue <= labels.length
    ? labels[displayValue - 1]
    : ''

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Stars */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleClick(rating)}
            onKeyDown={(e) => handleKeyDown(e, rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`
              ${SIZE_CLASSES[size]}
              transition-all duration-150
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
              ${rating <= displayValue ? 'text-yellow-400' : 'text-gray-300'}
              ${!readonly && rating <= hoverValue ? 'animate-pulse' : ''}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
            `}
            aria-label={`${rating} star${rating > 1 ? 's' : ''}`}
          >
            {rating <= displayValue ? '⭐' : '☆'}
          </button>
        ))}
      </div>

      {/* Label */}
      {showLabel && displayValue > 0 && (
        <div className={`
          text-center px-4 py-2 rounded-lg transition-all
          ${ageGroup === '5-8'
            ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 font-bold text-lg'
            : 'bg-blue-50 text-blue-800 font-medium'
          }
        `}>
          {currentLabel}
        </div>
      )}

      {/* Rating out of 5 */}
      {readonly && value > 0 && (
        <p className="text-sm text-gray-600">
          {value}/5 stars
        </p>
      )}
    </div>
  )
}
