-- Migration 18: Fix RLS Policies for Security
-- Date: 2025-11-19
-- Purpose: Fix incomplete RLS policies on rewards and child_achievements tables

-- ============================================================================
-- 1. FIX REWARDS TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "rewards_select_policy" ON rewards;
DROP POLICY IF EXISTS "rewards_insert_policy" ON rewards;
DROP POLICY IF EXISTS "rewards_update_policy" ON rewards;
DROP POLICY IF EXISTS "rewards_delete_policy" ON rewards;

-- Rewards SELECT policy: All family members can view rewards
CREATE POLICY "rewards_select_policy" ON rewards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = rewards.family_id
      AND family_members.user_id = auth.uid()
    )
  );

-- Rewards INSERT policy: Only admins and parents can create rewards
CREATE POLICY "rewards_insert_policy" ON rewards
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = rewards.family_id
      AND family_members.user_id = auth.uid()
      AND family_members.role IN ('admin', 'parent')
    )
  );

-- Rewards UPDATE policy: Only admins and parents can update rewards
CREATE POLICY "rewards_update_policy" ON rewards
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = rewards.family_id
      AND family_members.user_id = auth.uid()
      AND family_members.role IN ('admin', 'parent')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = rewards.family_id
      AND family_members.user_id = auth.uid()
      AND family_members.role IN ('admin', 'parent')
    )
  );

-- Rewards DELETE policy: Only admins and parents can delete rewards
CREATE POLICY "rewards_delete_policy" ON rewards
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = rewards.family_id
      AND family_members.user_id = auth.uid()
      AND family_members.role IN ('admin', 'parent')
    )
  );

-- ============================================================================
-- 2. FIX CHILD_ACHIEVEMENTS TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "child_achievements_select_policy" ON child_achievements;
DROP POLICY IF EXISTS "child_achievements_insert_policy" ON child_achievements;

-- Child Achievements SELECT policy: All family members can view achievements
CREATE POLICY "child_achievements_select_policy" ON child_achievements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      INNER JOIN family_members ON family_members.family_id = children.family_id
      WHERE children.id = child_achievements.child_id
      AND family_members.user_id = auth.uid()
    )
  );

-- Child Achievements INSERT policy: System can create when achievements unlocked
-- Note: This should be called by a backend function, not directly from client
-- For now, we allow insert if the user is a family member (for manual testing)
-- In production, this should be restricted to service role only
CREATE POLICY "child_achievements_insert_policy" ON child_achievements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      INNER JOIN family_members ON family_members.family_id = children.family_id
      WHERE children.id = child_achievements.child_id
      AND family_members.user_id = auth.uid()
      AND family_members.role IN ('admin', 'parent')
    )
  );

-- ============================================================================
-- 3. FIX POINT_TRANSACTIONS TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "point_transactions_select_policy" ON point_transactions;
DROP POLICY IF EXISTS "point_transactions_insert_policy" ON point_transactions;

-- Point Transactions SELECT policy: All family members can view
CREATE POLICY "point_transactions_select_policy" ON point_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = point_transactions.family_id
      AND family_members.user_id = auth.uid()
    )
  );

-- Point Transactions INSERT policy: Only admins and parents can create
-- (Points should be awarded by parents/admins, not children)
CREATE POLICY "point_transactions_insert_policy" ON point_transactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = point_transactions.family_id
      AND family_members.user_id = auth.uid()
      AND family_members.role IN ('admin', 'parent')
    )
  );

-- ============================================================================
-- 4. ADD MISSING POLICIES FOR SUBTASKS (if not already present)
-- ============================================================================

-- Check if subtasks table exists and add policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subtasks') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "subtasks_select_policy" ON subtasks;
    DROP POLICY IF EXISTS "subtasks_insert_policy" ON subtasks;
    DROP POLICY IF EXISTS "subtasks_update_policy" ON subtasks;
    DROP POLICY IF EXISTS "subtasks_delete_policy" ON subtasks;

    -- Subtasks SELECT policy: Family members can view subtasks of their family's tasks
    CREATE POLICY "subtasks_select_policy" ON subtasks
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM tasks
          INNER JOIN family_members ON family_members.family_id = tasks.family_id
          WHERE tasks.id = subtasks.task_id
          AND family_members.user_id = auth.uid()
        )
      );

    -- Subtasks INSERT policy: Family members can create subtasks
    CREATE POLICY "subtasks_insert_policy" ON subtasks
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM tasks
          INNER JOIN family_members ON family_members.family_id = tasks.family_id
          WHERE tasks.id = subtasks.task_id
          AND family_members.user_id = auth.uid()
        )
      );

    -- Subtasks UPDATE policy: Family members can update subtasks
    CREATE POLICY "subtasks_update_policy" ON subtasks
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM tasks
          INNER JOIN family_members ON family_members.family_id = tasks.family_id
          WHERE tasks.id = subtasks.task_id
          AND family_members.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM tasks
          INNER JOIN family_members ON family_members.family_id = tasks.family_id
          WHERE tasks.id = subtasks.task_id
          AND family_members.user_id = auth.uid()
        )
      );

    -- Subtasks DELETE policy: Family members can delete subtasks
    CREATE POLICY "subtasks_delete_policy" ON subtasks
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM tasks
          INNER JOIN family_members ON family_members.family_id = tasks.family_id
          WHERE tasks.id = subtasks.task_id
          AND family_members.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all policies are in place
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Count policies for rewards table
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'rewards';

  IF policy_count < 4 THEN
    RAISE EXCEPTION 'Rewards table policies incomplete. Expected 4, found %', policy_count;
  END IF;

  RAISE NOTICE 'Migration 18 completed successfully. All RLS policies updated.';
END $$;
