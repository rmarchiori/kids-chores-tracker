'use client'

import { useState, useEffect } from 'react'
import {
  RecurrencePattern,
  generateRRule,
  describeRecurrencePattern,
  getNextOccurrences,
  formatOccurrencesPreview,
  parseRRule
} from '@/lib/utils/rrule-generator'

interface RecurrencePatternPickerProps {
  value?: string // RRULE string
  onChange: (rrule: string, description: string) => void
  className?: string
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAY_FULL_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function RecurrencePatternPicker({
  value,
  onChange,
  className = ''
}: RecurrencePatternPickerProps) {
  // Parse existing RRULE or default to daily
  const initialPattern = value ? parseRRule(value) : { type: 'daily' as const, interval: 1 }

  const [pattern, setPattern] = useState<RecurrencePattern>(initialPattern || { type: 'daily', interval: 1 })
  const [showPreview, setShowPreview] = useState(false)

  // Update parent when pattern changes
  useEffect(() => {
    try {
      const rrule = generateRRule(pattern)
      const description = describeRecurrencePattern(pattern)
      onChange(rrule, description)
    } catch (error) {
      console.error('Failed to generate RRULE:', error)
    }
  }, [pattern, onChange])

  const handleTypeChange = (type: 'daily' | 'weekly' | 'monthly' | 'custom') => {
    setPattern({
      type,
      interval: 1,
      selectedDays: type === 'weekly' ? [1, 2, 3, 4, 5] : undefined, // Default to weekdays
      monthDay: type === 'monthly' ? 1 : undefined
    })
  }

  const handleIntervalChange = (interval: number) => {
    setPattern(prev => ({ ...prev, interval }))
  }

  const handleDayToggle = (day: number) => {
    setPattern(prev => {
      const currentDays = prev.selectedDays || []
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day].sort((a, b) => a - b)

      return { ...prev, selectedDays: newDays }
    })
  }

  const handleMonthDayChange = (day: number) => {
    setPattern(prev => ({ ...prev, monthDay: day }))
  }

  const currentRRule = generateRRule(pattern)
  const description = describeRecurrencePattern(pattern)
  const nextOccurrences = getNextOccurrences(currentRRule, 5)
  const formattedDates = formatOccurrencesPreview(nextOccurrences)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Pattern Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recurrence Pattern
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange('daily')}
            className={`
              px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors
              ${pattern.type === 'daily'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('weekly')}
            className={`
              px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors
              ${pattern.type === 'weekly'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('monthly')}
            className={`
              px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors
              ${pattern.type === 'monthly'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('custom')}
            className={`
              px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors
              ${pattern.type === 'custom'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Pattern-Specific Options */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        {/* Daily Options */}
        {pattern.type === 'daily' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repeat every
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="30"
                value={pattern.interval || 1}
                onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">day(s)</span>
            </div>
          </div>
        )}

        {/* Weekly Options */}
        {pattern.type === 'weekly' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repeat every
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={pattern.interval || 1}
                  onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">week(s)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                On these days
              </label>
              <div className="grid grid-cols-7 gap-2">
                {WEEKDAY_NAMES.map((day, index) => {
                  const isSelected = pattern.selectedDays?.includes(index) || false
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(index)}
                      className={`
                        px-2 py-2 rounded-lg border-2 text-xs font-medium transition-colors
                        ${isSelected
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }
                      `}
                      title={WEEKDAY_FULL_NAMES[index]}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Select the days of the week for this task
              </p>
            </div>
          </div>
        )}

        {/* Monthly Options */}
        {pattern.type === 'monthly' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repeat every
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={pattern.interval || 1}
                  onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">month(s)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                On day of month
              </label>
              <select
                value={pattern.monthDay || 1}
                onChange={(e) => handleMonthDayChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>
                    {day}{getOrdinalSuffix(day)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Custom Options */}
        {pattern.type === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repeat every
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="90"
                value={pattern.interval || 1}
                onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">day(s)</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Custom interval for task rotation or special schedules
            </p>
          </div>
        )}
      </div>

      {/* Description Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm font-medium text-blue-900">
          {description}
        </p>
      </div>

      {/* Pattern Preview Toggle */}
      <button
        type="button"
        onClick={() => setShowPreview(!showPreview)}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        {showPreview ? 'Hide preview' : 'Show next 5 occurrences'}
      </button>

      {/* Pattern Preview */}
      {showPreview && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Next 5 occurrences:
          </p>
          <ul className="space-y-1">
            {formattedDates.map((date, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {index + 1}
                </span>
                {date}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function getOrdinalSuffix(num: number): string {
  if (num >= 11 && num <= 13) return 'th'

  switch (num % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}
