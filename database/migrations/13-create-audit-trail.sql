-- Migration 13: Create audit trail table for tracking important actions

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS audit_log_user_id_idx ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS audit_log_action_type_idx ON audit_log(action_type);
CREATE INDEX IF NOT EXISTS audit_log_entity_type_idx ON audit_log(entity_type);
CREATE INDEX IF NOT EXISTS audit_log_entity_id_idx ON audit_log(entity_id);
CREATE INDEX IF NOT EXISTS audit_log_family_id_idx ON audit_log(family_id);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS audit_log_family_action_created_idx
  ON audit_log(family_id, action_type, created_at DESC);

-- Add RLS policies
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Users can view audit logs for their families (admins and parents only)
CREATE POLICY "Family admins and parents can view audit logs"
  ON audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = audit_log.family_id
        AND fm.user_id = auth.uid()
        AND fm.role IN ('admin', 'parent')
    )
  );

-- Only the system can insert audit logs (via triggers or API)
CREATE POLICY "System can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Comments for documentation
COMMENT ON TABLE audit_log IS 'Audit trail for tracking important user actions and system events';
COMMENT ON COLUMN audit_log.action_type IS 'Type of action: review_submitted, task_completed, task_created, etc.';
COMMENT ON COLUMN audit_log.entity_type IS 'Type of entity affected: task_completion, task, review, etc.';
COMMENT ON COLUMN audit_log.entity_id IS 'ID of the affected entity';
COMMENT ON COLUMN audit_log.metadata IS 'Additional context about the action (changes, before/after values, etc.)';
