-- Fix Critical RLS Policy Vulnerabilities
-- Migration 11: Security Fixes for Task Completions
-- Created: 2025-11-18

-- Drop vulnerable policies
DROP POLICY IF EXISTS "Children can create their own completions" ON task_completions;
DROP POLICY IF EXISTS "Family members can update task completions" ON task_completions;

-- Create secure policy for task completion creation
-- Only admins and parents can create completions (on behalf of children)
CREATE POLICY "Admin and parents can create completions for children"
  ON task_completions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children c
      JOIN tasks t ON t.id = task_completions.task_id
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE c.id = task_completions.child_id
        AND fm.user_id = auth.uid()
        AND fm.role IN ('admin', 'parent')  -- Enforce role requirement
        AND fm.family_id = t.family_id
    )
  );

-- Create secure policy for task completion updates
-- Only admins and parents can update (for reviews)
CREATE POLICY "Admin and parents can update task completions for reviews"
  ON task_completions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN family_members fm ON fm.family_id = t.family_id
      WHERE t.id = task_completions.task_id
        AND fm.user_id = auth.uid()
        AND fm.role IN ('admin', 'parent')  -- Restrict to authorized roles
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN family_members fm ON fm.family_id = t.family_id
      WHERE t.id = task_completions.task_id
        AND fm.user_id = auth.uid()
        AND fm.role IN ('admin', 'parent')
    )
  );

-- Add optimistic locking column for preventing race conditions
ALTER TABLE task_completions
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Add trigger to increment version on update
CREATE OR REPLACE FUNCTION increment_completion_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_completion_version_trigger
  BEFORE UPDATE ON task_completions
  FOR EACH ROW
  EXECUTE FUNCTION increment_completion_version();

-- Add constraint to prevent duplicate daily completions
-- A child can only complete the same task once per day
CREATE UNIQUE INDEX IF NOT EXISTS unique_daily_completion
  ON task_completions (task_id, child_id, DATE(completed_at));

-- Comments for documentation
COMMENT ON POLICY "Admin and parents can create completions for children" ON task_completions
  IS 'Security fix: Only admins and parents can create task completions, preventing unauthorized completion creation';

COMMENT ON POLICY "Admin and parents can update task completions for reviews" ON task_completions
  IS 'Security fix: Only admins and parents can update completions, preventing children from modifying reviews';

COMMENT ON COLUMN task_completions.version
  IS 'Optimistic locking version to prevent concurrent modification conflicts';
