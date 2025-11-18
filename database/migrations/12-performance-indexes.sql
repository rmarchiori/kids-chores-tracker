-- Performance Optimization: Add Missing Indexes
-- Migration 12: Add indexes for rating system queries
-- Created: 2025-11-18

-- Index on reviewed_by for filtering reviews by parent
CREATE INDEX IF NOT EXISTS task_completions_reviewed_by_idx
  ON task_completions(reviewed_by)
  WHERE reviewed_by IS NOT NULL;

-- Composite index for the common join pattern in reviews
-- Covers task_id + status + completed_at for efficient queries
CREATE INDEX IF NOT EXISTS task_completions_task_status_completed_idx
  ON task_completions(task_id, status, completed_at DESC);

-- Index for child-specific queries with status filtering
CREATE INDEX IF NOT EXISTS task_completions_child_status_completed_idx
  ON task_completions(child_id, status, completed_at DESC);

-- Index for family-level queries (through tasks join)
CREATE INDEX IF NOT EXISTS tasks_family_id_idx
  ON tasks(family_id)
  WHERE family_id IS NOT NULL;

-- Composite index for task_assignments queries
CREATE INDEX IF NOT EXISTS task_assignments_child_task_idx
  ON task_assignments(child_id, task_id);

-- Comments for documentation
COMMENT ON INDEX task_completions_reviewed_by_idx
  IS 'Performance: Index for filtering completions by reviewer';

COMMENT ON INDEX task_completions_task_status_completed_idx
  IS 'Performance: Covering index for common review query pattern';

COMMENT ON INDEX task_completions_child_status_completed_idx
  IS 'Performance: Covering index for child-specific completion queries';
