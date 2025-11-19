-- Migration: Points and Rewards System
-- Sprint 2.1: Points & Reward System
-- Created: 2025-11-19

-- Add points column to task_completions table
ALTER TABLE task_completions ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  category VARCHAR(50),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS rewards_family_id_idx ON rewards(family_id);
CREATE INDEX IF NOT EXISTS rewards_active_idx ON rewards(active);

-- Create point_transactions table (audit trail)
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for earning, negative for spending
  transaction_type VARCHAR(50) NOT NULL, -- 'task_completion', 'bonus', 'redemption', 'manual'
  reference_id UUID, -- task_completion_id or reward_id
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS point_transactions_child_id_idx ON point_transactions(child_id);
CREATE INDEX IF NOT EXISTS point_transactions_family_id_idx ON point_transactions(family_id);
CREATE INDEX IF NOT EXISTS point_transactions_type_idx ON point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS point_transactions_created_at_idx ON point_transactions(created_at);

-- Enable RLS
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rewards
CREATE POLICY "Family members can view rewards"
  ON rewards FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family admins and parents can manage rewards"
  ON rewards FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
    )
  );

-- RLS Policies for point_transactions
CREATE POLICY "Family members can view point transactions"
  ON point_transactions FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family admins and parents can create point transactions"
  ON point_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'parent')
    )
  );

-- Trigger for rewards updated_at
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON rewards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
