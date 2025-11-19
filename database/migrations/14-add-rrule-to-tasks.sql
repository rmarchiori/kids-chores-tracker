-- Migration: Add RRULE support for advanced recurring task patterns
-- Sprint 1.1: Advanced Recurring Task Patterns
-- Created: 2025-11-19

-- Add rrule column to tasks table for RFC 5545 recurrence rules
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS rrule TEXT;

-- Add index for rrule column (helps with queries filtering by rrule)
CREATE INDEX IF NOT EXISTS tasks_rrule_idx ON tasks(rrule) WHERE rrule IS NOT NULL;

-- Add column to track recurrence pattern display name (for UI)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_pattern_description TEXT;

-- Migration to convert existing daily tasks to RRULE format
-- FREQ=DAILY;INTERVAL=1
UPDATE tasks
SET
  rrule = 'FREQ=DAILY;INTERVAL=1',
  recurrence_pattern_description = 'Every day'
WHERE
  recurring = true
  AND recurring_type = 'daily'
  AND rrule IS NULL;

-- Convert existing weekly tasks to RRULE format
-- Note: Weekly tasks will default to all days of the week
-- Parents can customize specific days using the pattern picker UI
UPDATE tasks
SET
  rrule = 'FREQ=WEEKLY;INTERVAL=1',
  recurrence_pattern_description = 'Every week'
WHERE
  recurring = true
  AND recurring_type = 'weekly'
  AND rrule IS NULL;

-- Convert existing monthly tasks to RRULE format
UPDATE tasks
SET
  rrule = 'FREQ=MONTHLY;INTERVAL=1',
  recurrence_pattern_description = 'Every month'
WHERE
  recurring = true
  AND recurring_type = 'monthly'
  AND rrule IS NULL;

-- Note: Keep existing recurring_type column for backward compatibility
-- New tasks will use both rrule (for generation) and recurring_type (for simple categorization)
