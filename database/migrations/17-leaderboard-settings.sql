-- Migration: Leaderboard Settings
-- Sprint 2.3: Leaderboard & Family Competition
-- Created: 2025-11-19

-- Add leaderboard settings to families table
ALTER TABLE families ADD COLUMN IF NOT EXISTS leaderboard_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE families ADD COLUMN IF NOT EXISTS leaderboard_visibility VARCHAR(50) DEFAULT 'show_all';
  -- Options: 'show_all', 'individual', 'parents_only'
ALTER TABLE families ADD COLUMN IF NOT EXISTS leaderboard_mode VARCHAR(50) DEFAULT 'competitive';
  -- Options: 'competitive', 'collaborative'

-- Create index for leaderboard queries
CREATE INDEX IF NOT EXISTS families_leaderboard_enabled_idx ON families(leaderboard_enabled);

-- Add comment explaining leaderboard visibility options
COMMENT ON COLUMN families.leaderboard_visibility IS
  'show_all: All children see full leaderboard, individual: Each child sees only their own stats, parents_only: Only parents see leaderboard';

COMMENT ON COLUMN families.leaderboard_mode IS
  'competitive: Children compete for ranking, collaborative: Family works together toward team goal';
