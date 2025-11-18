-- Kids Chores Tracker Database Schema
-- Sprint 0.3: Updated Architecture with family_members
-- Created: 2025-11-17
-- Updated: 2025-11-17

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table 1: families
-- ============================================================================
-- Represents a family/household
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS families_created_at_idx ON families(created_at);
CREATE INDEX IF NOT EXISTS families_updated_at_idx ON families(updated_at);

-- Enable RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Table 2: family_members (REPLACES parents table)
-- ============================================================================
-- Junction table for users and families with role-based permissions
-- Supports multiple families per user with different roles per family
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'parent', 'teen')),
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(family_id, user_id) -- User can only be in a family once
);

CREATE INDEX IF NOT EXISTS family_members_family_id_idx ON family_members(family_id);
CREATE INDEX IF NOT EXISTS family_members_user_id_idx ON family_members(user_id);
CREATE INDEX IF NOT EXISTS family_members_role_idx ON family_members(role);
CREATE INDEX IF NOT EXISTS family_members_email_idx ON family_members(email);

-- Enable RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Table 3: family_invitations
-- ============================================================================
-- Invitation system for adding members to families
CREATE TABLE IF NOT EXISTS family_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  invited_email VARCHAR(255) NOT NULL,
  invited_role VARCHAR(20) NOT NULL CHECK (invited_role IN ('parent', 'teen')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS family_invitations_family_id_idx ON family_invitations(family_id);
CREATE INDEX IF NOT EXISTS family_invitations_token_idx ON family_invitations(token);
CREATE INDEX IF NOT EXISTS family_invitations_status_idx ON family_invitations(status);
CREATE INDEX IF NOT EXISTS family_invitations_email_idx ON family_invitations(invited_email);

-- Enable RLS
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Table 4: children
-- ============================================================================
-- Child accounts in a family (no login credentials)
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age_group VARCHAR(10) NOT NULL CHECK (age_group IN ('5-8', '9-12')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS children_family_id_idx ON children(family_id);
CREATE INDEX IF NOT EXISTS children_age_group_idx ON children(age_group);

-- Enable RLS
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Table 5: tasks
-- ============================================================================
-- Chore/task definitions
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('cleaning', 'homework', 'pets', 'other')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  recurring BOOLEAN DEFAULT FALSE,
  recurring_type VARCHAR(20) CHECK (recurring_type IN ('daily', 'weekly', 'monthly')),
  recurring_skip_dates DATE[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS tasks_family_id_idx ON tasks(family_id);
CREATE INDEX IF NOT EXISTS tasks_category_idx ON tasks(category);
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON tasks(priority);
CREATE INDEX IF NOT EXISTS tasks_recurring_idx ON tasks(recurring);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Table 6: task_assignments
-- ============================================================================
-- Assignment of tasks to children
CREATE TABLE IF NOT EXISTS task_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(task_id, child_id)
);

CREATE INDEX IF NOT EXISTS task_assignments_task_id_idx ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS task_assignments_child_id_idx ON task_assignments(child_id);

-- Enable RLS
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Table 7: task_completions
-- ============================================================================
-- Track task completion by children
CREATE TABLE IF NOT EXISTS task_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pending_review', 'completed', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS task_completions_task_id_idx ON task_completions(task_id);
CREATE INDEX IF NOT EXISTS task_completions_child_id_idx ON task_completions(child_id);
CREATE INDEX IF NOT EXISTS task_completions_status_idx ON task_completions(status);
CREATE INDEX IF NOT EXISTS task_completions_completed_at_idx ON task_completions(completed_at);

-- Enable RLS
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Table 8: subtasks
-- ============================================================================
-- Breaking down tasks into smaller steps
CREATE TABLE IF NOT EXISTS subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS subtasks_task_id_idx ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS subtasks_order_idx ON subtasks(order_index);

-- Enable RLS
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Table 9: recurring_task_instances
-- ============================================================================
-- Instances of recurring tasks (for skip functionality)
CREATE TABLE IF NOT EXISTS recurring_task_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recurring_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  instance_date DATE NOT NULL,
  skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(recurring_task_id, instance_date)
);

CREATE INDEX IF NOT EXISTS recurring_task_instances_task_id_idx ON recurring_task_instances(recurring_task_id);
CREATE INDEX IF NOT EXISTS recurring_task_instances_date_idx ON recurring_task_instances(instance_date);

-- Enable RLS
ALTER TABLE recurring_task_instances ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Row-Level Security Policies
-- ============================================================================

-- FAMILIES: Open for creation, restricted for access
CREATE POLICY "Allow authenticated users to create families"
  ON families FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Family members can view their families"
  ON families FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Family admins can update their families"
  ON families FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Family admins can delete their families"
  ON families FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- FAMILY_MEMBERS: Role-based access control
CREATE POLICY "Users can view their own family memberships"
  ON family_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Family members can view other members in their families"
  ON family_members FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow family member creation during onboarding"
  ON family_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Family admins can add members to their families"
  ON family_members FOR INSERT
  TO authenticated
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Family admins can update member roles"
  ON family_members FOR UPDATE
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Family admins can remove members (except last admin)"
  ON family_members FOR DELETE
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    AND (
      -- Allow delete if not an admin OR if there are other admins
      role != 'admin' OR
      (SELECT COUNT(*) FROM family_members
       WHERE family_id = family_members.family_id AND role = 'admin') > 1
    )
  );

CREATE POLICY "Users can remove themselves from families (except last admin)"
  ON family_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND (
      -- Allow self-removal if not an admin OR if there are other admins
      role != 'admin' OR
      (SELECT COUNT(*) FROM family_members
       WHERE family_id = family_members.family_id AND role = 'admin') > 1
    )
  );

-- FAMILY_INVITATIONS: Invitation management
CREATE POLICY "Family admins can create invitations"
  ON family_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Family admins can view their family's invitations"
  ON family_invitations FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Invited users can view their invitations by token"
  ON family_invitations FOR SELECT
  TO authenticated
  USING (invited_email = auth.email() OR invited_email IN (
    SELECT email FROM family_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Invited users can update invitation status"
  ON family_invitations FOR UPDATE
  TO authenticated
  USING (invited_email = auth.email() OR invited_email IN (
    SELECT email FROM family_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family admins can delete invitations"
  ON family_invitations FOR DELETE
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- CHILDREN: Family members (admin/parent) can manage children
CREATE POLICY "Family members can view family children"
  ON children FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family admins and parents can create children"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
    )
  );

CREATE POLICY "Family admins and parents can update children"
  ON children FOR UPDATE
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
    )
  );

CREATE POLICY "Family admins and parents can delete children"
  ON children FOR DELETE
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
    )
  );

-- TASKS: Family members can view, admins/parents can manage
CREATE POLICY "Family members can view family tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family admins and parents can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
    )
  );

CREATE POLICY "Family admins and parents can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
    )
  );

CREATE POLICY "Family admins and parents can delete tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
    )
  );

-- TASK_ASSIGNMENTS: Link tasks to children
CREATE POLICY "Family members can view task assignments"
  ON task_assignments FOR SELECT
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family admins and parents can create assignments"
  ON task_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    task_id IN (
      SELECT id FROM tasks WHERE family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
      )
    )
  );

CREATE POLICY "Family admins and parents can update assignments"
  ON task_assignments FOR UPDATE
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
      )
    )
  );

CREATE POLICY "Family admins and parents can delete assignments"
  ON task_assignments FOR DELETE
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
      )
    )
  );

-- TASK_COMPLETIONS: Track and review completions
CREATE POLICY "Family members can view task completions"
  ON task_completions FOR SELECT
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family admins and parents can create completions"
  ON task_completions FOR INSERT
  TO authenticated
  WITH CHECK (
    task_id IN (
      SELECT id FROM tasks WHERE family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
      )
    )
  );

CREATE POLICY "Family admins and parents can update completions"
  ON task_completions FOR UPDATE
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
      )
    )
  );

CREATE POLICY "Family admins and parents can delete completions"
  ON task_completions FOR DELETE
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
      )
    )
  );

-- SUBTASKS: Part of task management
CREATE POLICY "Family members can view subtasks"
  ON subtasks FOR SELECT
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family admins and parents can create subtasks"
  ON subtasks FOR INSERT
  TO authenticated
  WITH CHECK (
    task_id IN (
      SELECT id FROM tasks WHERE family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
      )
    )
  );

CREATE POLICY "Family admins and parents can update subtasks"
  ON subtasks FOR UPDATE
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
      )
    )
  );

CREATE POLICY "Family admins and parents can delete subtasks"
  ON subtasks FOR DELETE
  TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
      )
    )
  );

-- RECURRING_TASK_INSTANCES: Skip functionality
CREATE POLICY "Family members can view recurring instances"
  ON recurring_task_instances FOR SELECT
  TO authenticated
  USING (
    recurring_task_id IN (
      SELECT id FROM tasks WHERE family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family admins and parents can create recurring instances"
  ON recurring_task_instances FOR INSERT
  TO authenticated
  WITH CHECK (
    recurring_task_id IN (
      SELECT id FROM tasks WHERE family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
      )
    )
  );

CREATE POLICY "Family admins and parents can update recurring instances"
  ON recurring_task_instances FOR UPDATE
  TO authenticated
  USING (
    recurring_task_id IN (
      SELECT id FROM tasks WHERE family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
      )
    )
  );

CREATE POLICY "Family admins and parents can delete recurring instances"
  ON recurring_task_instances FOR DELETE
  TO authenticated
  USING (
    recurring_task_id IN (
      SELECT id FROM tasks WHERE family_id IN (
        SELECT family_id FROM family_members
        WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
      )
    )
  );

-- ============================================================================
-- Functions for automated tasks
-- ============================================================================

-- Function to prevent last admin from leaving
CREATE OR REPLACE FUNCTION prevent_last_admin_removal()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role = 'admin' THEN
    IF (SELECT COUNT(*) FROM family_members
        WHERE family_id = OLD.family_id AND role = 'admin') = 1 THEN
      RAISE EXCEPTION 'Cannot remove the last admin from a family. Promote another member to admin first.';
    END IF;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent last admin removal
CREATE TRIGGER prevent_last_admin_removal_trigger
  BEFORE DELETE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION prevent_last_admin_removal();

-- Function to auto-expire invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE family_invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Updated_at Trigger Function
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_invitations_updated_at BEFORE UPDATE ON family_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subtasks_updated_at BEFORE UPDATE ON subtasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
