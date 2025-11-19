import { RRule, Frequency, rrulestr } from 'rrule'
import { format } from 'date-fns'

export type RecurrencePattern = {
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  interval?: number
  selectedDays?: number[] // 0=Sunday, 1=Monday, ..., 6=Saturday
  monthDay?: number // For monthly: 1-31
  count?: number // Number of occurrences
}

/**
 * Generates an RRULE string from a recurrence pattern
 */
export function generateRRule(pattern: RecurrencePattern, startDate?: Date): string {
  const start = startDate || new Date()

  switch (pattern.type) {
    case 'daily': {
      const rule = new RRule({
        freq: Frequency.DAILY,
        interval: pattern.interval || 1,
        dtstart: start
      })
      return rule.toString()
    }

    case 'weekly': {
      const byweekday = pattern.selectedDays?.map(day => {
        // RRule uses MO, TU, WE, TH, FR, SA, SU
        // Our array uses 0=Sun, 1=Mon, ..., 6=Sat
        // Need to convert: Sun=6 in RRule, Mon=0, Tue=1, ..., Sat=5
        const rruleDay = day === 0 ? 6 : day - 1
        return rruleDay
      })

      const rule = new RRule({
        freq: Frequency.WEEKLY,
        interval: pattern.interval || 1,
        byweekday: byweekday?.length ? byweekday : undefined,
        dtstart: start
      })
      return rule.toString()
    }

    case 'monthly': {
      const rule = new RRule({
        freq: Frequency.MONTHLY,
        interval: pattern.interval || 1,
        bymonthday: pattern.monthDay ? [pattern.monthDay] : undefined,
        dtstart: start
      })
      return rule.toString()
    }

    case 'custom': {
      // For custom patterns with every N days
      const rule = new RRule({
        freq: Frequency.DAILY,
        interval: pattern.interval || 1,
        dtstart: start
      })
      return rule.toString()
    }

    default:
      throw new Error(`Unsupported recurrence type: ${pattern.type}`)
  }
}

/**
 * Parses an RRULE string back to a RecurrencePattern
 */
export function parseRRule(rruleString: string): RecurrencePattern | null {
  try {
    const rule = rrulestr(rruleString)
    const options = rule.origOptions

    if (options.freq === Frequency.DAILY) {
      return {
        type: 'daily',
        interval: options.interval || 1
      }
    }

    if (options.freq === Frequency.WEEKLY) {
      // Convert RRule weekday format back to our format
      const selectedDays = options.byweekday?.map((day: number) => {
        // RRule: MO=0, TU=1, ..., SU=6
        // Our format: Sun=0, Mon=1, ..., Sat=6
        return day === 6 ? 0 : day + 1
      })

      return {
        type: 'weekly',
        interval: options.interval || 1,
        selectedDays: selectedDays as number[]
      }
    }

    if (options.freq === Frequency.MONTHLY) {
      return {
        type: 'monthly',
        interval: options.interval || 1,
        monthDay: options.bymonthday?.[0] as number
      }
    }

    return {
      type: 'custom',
      interval: options.interval || 1
    }
  } catch (error) {
    console.error('Failed to parse RRule:', error)
    return null
  }
}

/**
 * Gets the next N occurrences of a recurring task
 */
export function getNextOccurrences(rruleString: string, count: number = 5): Date[] {
  try {
    const rule = rrulestr(rruleString)
    return rule.all((date, i) => i < count)
  } catch (error) {
    console.error('Failed to get occurrences:', error)
    return []
  }
}

/**
 * Generates a human-readable description of a recurrence pattern
 */
export function describeRecurrencePattern(pattern: RecurrencePattern): string {
  switch (pattern.type) {
    case 'daily': {
      const interval = pattern.interval || 1
      if (interval === 1) return 'Every day'
      return `Every ${interval} days`
    }

    case 'weekly': {
      const interval = pattern.interval || 1
      const days = pattern.selectedDays || []

      if (days.length === 0) {
        return interval === 1 ? 'Every week' : `Every ${interval} weeks`
      }

      if (days.length === 7) {
        return 'Every day of the week'
      }

      if (days.length === 5 && !days.includes(0) && !days.includes(6)) {
        return interval === 1 ? 'Every weekday' : `Every ${interval} weeks on weekdays`
      }

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const selectedDayNames = days.map(d => dayNames[d]).join(', ')

      if (interval === 1) {
        return `Every ${selectedDayNames}`
      }
      return `Every ${interval} weeks on ${selectedDayNames}`
    }

    case 'monthly': {
      const interval = pattern.interval || 1
      const day = pattern.monthDay

      if (!day) {
        return interval === 1 ? 'Every month' : `Every ${interval} months`
      }

      const suffix = getOrdinalSuffix(day)
      if (interval === 1) {
        return `Every month on the ${day}${suffix}`
      }
      return `Every ${interval} months on the ${day}${suffix}`
    }

    case 'custom': {
      const interval = pattern.interval || 1
      return `Every ${interval} day${interval > 1 ? 's' : ''}`
    }

    default:
      return 'Custom recurrence'
  }
}

/**
 * Helper to get ordinal suffix (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(num: number): string {
  if (num >= 11 && num <= 13) return 'th'

  switch (num % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

/**
 * Formats occurrence dates for preview
 */
export function formatOccurrencesPreview(dates: Date[]): string[] {
  return dates.map(date => format(date, 'MMM d, yyyy'))
}

/**
 * Converts legacy recurring_type to RecurrencePattern
 */
export function legacyTypeToPattern(recurringType: string): RecurrencePattern {
  switch (recurringType) {
    case 'daily':
      return { type: 'daily', interval: 1 }
    case 'weekly':
      return { type: 'weekly', interval: 1 }
    case 'monthly':
      return { type: 'monthly', interval: 1 }
    case 'business_days':
      return {
        type: 'weekly',
        interval: 1,
        selectedDays: [1, 2, 3, 4, 5] // Mon-Fri
      }
    default:
      return { type: 'daily', interval: 1 }
  }
}

/**
 * Checks if a recurring task occurs on a specific date based on its RRULE
 * @param rruleString - The RRULE string from the task
 * @param targetDate - The date to check
 * @param taskCreatedAt - When the task was created (used as dtstart if not in RRULE)
 * @returns true if the task occurs on the target date
 */
export function doesTaskOccurOnDate(
  rruleString: string | null | undefined,
  targetDate: Date,
  taskCreatedAt?: Date
): boolean {
  if (!rruleString) return false

  try {
    const rule = rrulestr(rruleString)

    // Get all occurrences between start of target date and end of target date
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Check if this date falls on one of the rule's occurrences
    const occurrencesOnDate = rule.between(startOfDay, endOfDay, true)

    return occurrencesOnDate.length > 0
  } catch (error) {
    console.error('Error checking task occurrence on date:', error)
    return false
  }
}
