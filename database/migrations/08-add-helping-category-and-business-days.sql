-- Migration 08: Add 'helping' category and 'business_days' recurring type
-- Add support for helping category and business days recurring option
-- Created: 2025-11-18

-- ============================================================================
-- Update tasks table category constraint
-- ============================================================================
-- Drop the old constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_category_check;

-- Add new constraint with all categories
ALTER TABLE tasks ADD CONSTRAINT tasks_category_check
  CHECK (category IN ('cleaning', 'homework', 'hygiene', 'outdoor', 'helping', 'meals', 'pets', 'bedtime', 'other'));

-- ============================================================================
-- Update tasks table recurring_type constraint
-- ============================================================================
-- Drop the old constraint if it exists
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_recurring_type_check;

-- Add new constraint with 'business_days' option
ALTER TABLE tasks ADD CONSTRAINT tasks_recurring_type_check
  CHECK (recurring_type IN ('daily', 'weekly', 'monthly', 'business_days') OR recurring_type IS NULL);
