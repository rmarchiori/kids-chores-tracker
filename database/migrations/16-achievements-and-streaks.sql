-- Migration: Achievement Badges and Streaks
-- Sprint 2.2: Achievement Badges & Streaks
-- Created: 2025-11-19

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'first_task', 'week_warrior'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  badge_icon VARCHAR(50), -- emoji or icon name
  unlock_criteria JSONB, -- flexible criteria definition
  category VARCHAR(50), -- 'starter', 'consistency', 'streak', 'quality', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS achievements_code_idx ON achievements(code);
CREATE INDEX IF NOT EXISTS achievements_category_idx ON achievements(category);

-- Create child_achievements table (unlocked badges)
CREATE TABLE IF NOT EXISTS child_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(child_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS child_achievements_child_id_idx ON child_achievements(child_id);
CREATE INDEX IF NOT EXISTS child_achievements_achievement_id_idx ON child_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS child_achievements_unlocked_at_idx ON child_achievements(unlocked_at);

-- Add streak columns to children table
ALTER TABLE children ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE children ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE children ADD COLUMN IF NOT EXISTS last_completion_date DATE;
ALTER TABLE children ADD COLUMN IF NOT EXISTS streak_freezes_available INTEGER DEFAULT 1;

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Family members can view child achievements"
  ON child_achievements FOR SELECT
  TO authenticated
  USING (
    child_id IN (
      SELECT c.id FROM children c
      INNER JOIN family_members fm ON c.family_id = fm.family_id
      WHERE fm.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create child achievements"
  ON child_achievements FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Will be controlled by application logic

-- Seed initial achievements
INSERT INTO achievements (code, name, description, badge_icon, category, unlock_criteria) VALUES
  ('first_task', 'First Task', 'Complete your first task', '🎯', 'starter', '{"tasks_completed": 1}'),
  ('first_week', 'First Week', 'Complete 7+ tasks in your first week', '📅', 'starter', '{"tasks_in_week": 7}'),
  ('helpful_helper', 'Helpful Helper', 'Complete 25 tasks total', '🌟', 'starter', '{"total_tasks": 25}'),
  ('week_warrior', 'Week Warrior', '7+ tasks completed in one week', '⚔️', 'consistency', '{"tasks_in_week": 7}'),
  ('month_champion', 'Month Champion', '30+ tasks completed in one month', '🏆', 'consistency', '{"tasks_in_month": 30}'),
  ('perfect_week', 'Perfect Week', '100% completion rate for one week', '💯', 'consistency', '{"perfect_week": true}'),
  ('perfect_month', 'Perfect Month', '100% completion rate for one month', '🎖️', 'consistency', '{"perfect_month": true}'),
  ('streak_starter', 'Streak Starter', '3-day completion streak', '🔥', 'streak', '{"streak_days": 3}'),
  ('streak_champion', 'Streak Champion', '14-day completion streak', '🔥🔥', 'streak', '{"streak_days": 14}'),
  ('streak_legend', 'Streak Legend', '30-day completion streak', '🔥🔥🔥', 'streak', '{"streak_days": 30}'),
  ('quality_master', 'Quality Master', 'All ratings 5⭐ for one week', '⭐', 'quality', '{"perfect_ratings_week": true}'),
  ('excellence_award', 'Excellence Award', 'All ratings 5⭐ for one month', '🌟', 'quality', '{"perfect_ratings_month": true}'),
  ('above_beyond', 'Above & Beyond', '50 tasks with 5⭐ rating', '💫', 'quality', '{"five_star_count": 50}')
ON CONFLICT (code) DO NOTHING;
