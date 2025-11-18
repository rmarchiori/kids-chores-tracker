-- Sprint 2.1: Add Rating System to Task Completions
-- Created: 2025-11-18
-- Purpose: Add child self-rating and parent review functionality

-- Add rating columns to task_completions table
ALTER TABLE task_completions
  ADD COLUMN IF NOT EXISTS child_rating INTEGER CHECK (child_rating >= 1 AND child_rating <= 5),
  ADD COLUMN IF NOT EXISTS child_notes TEXT,
  ADD COLUMN IF NOT EXISTS parent_rating INTEGER CHECK (parent_rating >= 1 AND parent_rating <= 5),
  ADD COLUMN IF NOT EXISTS parent_feedback TEXT;

-- Add constraint to ensure child_notes length limit (500 chars)
ALTER TABLE task_completions
  ADD CONSTRAINT child_notes_length_check CHECK (char_length(child_notes) <= 500);

-- Add constraint to ensure parent_feedback length limit (1000 chars)
ALTER TABLE task_completions
  ADD CONSTRAINT parent_feedback_length_check CHECK (char_length(parent_feedback) <= 1000);

-- Add index for status filtering (optimization for review dashboard)
CREATE INDEX IF NOT EXISTS task_completions_status_date_idx ON task_completions(status, completed_at DESC);

-- Add index for child filtering (optimization for child's completion history)
CREATE INDEX IF NOT EXISTS task_completions_child_status_idx ON task_completions(child_id, status);

-- Comments for documentation
COMMENT ON COLUMN task_completions.child_rating IS 'Child self-rating (1-5 stars): 1=I gave it a try, 5=I did my best';
COMMENT ON COLUMN task_completions.child_notes IS 'Optional notes from child about the task (max 500 chars)';
COMMENT ON COLUMN task_completions.parent_rating IS 'Parent rating after review (1-5 stars)';
COMMENT ON COLUMN task_completions.parent_feedback IS 'Parent encouragement message after review (max 1000 chars)';
