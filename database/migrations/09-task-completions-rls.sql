-- Migration 09: Add RLS policies for task_completions
-- Enable secure access to task completion records
-- Created: 2025-11-18

-- ============================================================================
-- RLS Policies for task_completions
-- ============================================================================

-- Policy: Family members can view completions for their family's tasks
CREATE POLICY "Family members can view task completions"
  ON task_completions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN family_members fm ON fm.family_id = t.family_id
      WHERE t.id = task_completions.task_id
        AND fm.user_id = auth.uid()
    )
  );

-- Policy: Children can create their own completions
CREATE POLICY "Children can create their own completions"
  ON task_completions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children c
      JOIN tasks t ON t.id = task_completions.task_id
      JOIN family_members fm ON fm.family_id = c.family_id
      WHERE c.id = task_completions.child_id
        AND fm.user_id = auth.uid()
        AND fm.family_id = t.family_id
    )
  );

-- Policy: Family members can update completion status (for reviews)
CREATE POLICY "Family members can update task completions"
  ON task_completions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN family_members fm ON fm.family_id = t.family_id
      WHERE t.id = task_completions.task_id
        AND fm.user_id = auth.uid()
    )
  );

-- Policy: Admin/parent can delete completions
CREATE POLICY "Admin/parent can delete task completions"
  ON task_completions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN family_members fm ON fm.family_id = t.family_id
      WHERE t.id = task_completions.task_id
        AND fm.user_id = auth.uid()
        AND fm.role IN ('admin', 'parent')
    )
  );
