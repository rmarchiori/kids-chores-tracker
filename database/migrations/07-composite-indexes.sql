-- Sprint 1.2: Performance - Composite Indexes
-- Add composite indexes for common query patterns
-- Created: 2025-11-18

-- ============================================================================
-- Composite Indexes for Performance
-- ============================================================================

-- Index for filtering tasks by family + category (common query pattern)
CREATE INDEX IF NOT EXISTS idx_tasks_family_category
  ON tasks(family_id, category);

-- Index for filtering tasks by family + priority (common query pattern)
CREATE INDEX IF NOT EXISTS idx_tasks_family_priority
  ON tasks(family_id, priority);

-- Index for filtering tasks by family + due date (for upcoming tasks)
CREATE INDEX IF NOT EXISTS idx_tasks_family_due_date
  ON tasks(family_id, due_date)
  WHERE due_date IS NOT NULL;

-- Index for recurring tasks lookup
CREATE INDEX IF NOT EXISTS idx_tasks_family_recurring
  ON tasks(family_id, recurring)
  WHERE recurring = true;

-- Composite index for task_assignments - child + task lookups
CREATE INDEX IF NOT EXISTS idx_task_assignments_child_task
  ON task_assignments(child_id, task_id);

-- Index for task_completions by task + status (for filtering completed tasks)
CREATE INDEX IF NOT EXISTS idx_task_completions_task_status
  ON task_completions(task_id, status);

-- Index for task_completions by child + completed_at (for child activity tracking)
CREATE INDEX IF NOT EXISTS idx_task_completions_child_date
  ON task_completions(child_id, completed_at DESC);

-- ============================================================================
-- Query Optimization Notes
-- ============================================================================
-- These indexes optimize the following common queries:
--
-- 1. GET /api/tasks?category=cleaning
--    Uses: idx_tasks_family_category
--
-- 2. GET /api/tasks?priority=high
--    Uses: idx_tasks_family_priority
--
-- 3. Tasks with upcoming due dates
--    Uses: idx_tasks_family_due_date
--
-- 4. Get all recurring tasks
--    Uses: idx_tasks_family_recurring
--
-- 5. Get tasks assigned to a specific child
--    Uses: idx_task_assignments_child_task
--
-- 6. Get completed/pending tasks
--    Uses: idx_task_completions_task_status
--
-- 7. Get child's completion history
--    Uses: idx_task_completions_child_date
