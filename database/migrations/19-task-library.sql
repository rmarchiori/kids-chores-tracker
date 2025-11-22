-- Sprint 2.1: Task Library System
-- Create independent task library with common pre-defined tasks
-- Created: 2025-11-22

-- ============================================================================
-- Table: task_library
-- ============================================================================
-- Curated library of common tasks that users can copy to their family
-- These tasks are independent and not editable by users
CREATE TABLE IF NOT EXISTS task_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'cleaning', 'homework', 'hygiene', 'outdoor',
    'helping', 'meals', 'pets', 'bedtime'
  )),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  image_url TEXT,
  image_alt_text TEXT,
  image_source VARCHAR(20) DEFAULT 'emoji' CHECK (image_source IN ('library', 'custom', 'emoji')),
  recommended_age_group VARCHAR(10) CHECK (recommended_age_group IN ('5-8', '9-12', 'both')),
  tags TEXT[], -- For easier searching and filtering
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster filtering and search
CREATE INDEX IF NOT EXISTS idx_task_library_category ON task_library(category);
CREATE INDEX IF NOT EXISTS idx_task_library_priority ON task_library(priority);
CREATE INDEX IF NOT EXISTS idx_task_library_age_group ON task_library(recommended_age_group);
CREATE INDEX IF NOT EXISTS idx_task_library_tags ON task_library USING GIN(tags);

-- Enable RLS
ALTER TABLE task_library ENABLE ROW LEVEL SECURITY;

-- RLS policy: Authenticated users can read task library (but not modify)
CREATE POLICY "Authenticated users can read task library"
  ON task_library
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- Seed task library with common tasks
-- ============================================================================

-- Cleaning Tasks
INSERT INTO task_library (title, description, category, priority, image_url, image_source, recommended_age_group, tags) VALUES
('Make Your Bed', 'Pull up covers and arrange pillows neatly', 'cleaning', 'medium', '🛏️', 'emoji', 'both', ARRAY['morning', 'bedroom', 'daily']),
('Clean Your Room', 'Put toys away, organize desk, make it tidy', 'cleaning', 'medium', '🧹', 'emoji', 'both', ARRAY['bedroom', 'organize', 'weekly']),
('Vacuum Living Room', 'Use the vacuum to clean carpets and floors', 'cleaning', 'medium', '🧹', 'emoji', '9-12', ARRAY['floor', 'weekly']),
('Dust Furniture', 'Wipe dust from tables, shelves, and surfaces', 'cleaning', 'low', '🪣', 'emoji', 'both', ARRAY['furniture', 'weekly']),
('Take Out Trash', 'Empty trash bins and take to outdoor bin', 'cleaning', 'medium', '🗑️', 'emoji', 'both', ARRAY['garbage', 'daily', 'waste']),
('Put Away Toys', 'Organize toys in bins and shelves', 'cleaning', 'high', '🧸', 'emoji', '5-8', ARRAY['toys', 'organize', 'daily']),
('Put Away Laundry', 'Fold clothes and put in drawers', 'cleaning', 'medium', '👕', 'emoji', 'both', ARRAY['clothes', 'weekly']),
('Wipe Kitchen Table', 'Clean table after meals with cloth', 'cleaning', 'high', '🧽', 'emoji', 'both', ARRAY['kitchen', 'after meals']);

-- Homework & Learning Tasks
INSERT INTO task_library (title, description, category, priority, image_url, image_source, recommended_age_group, tags) VALUES
('Math Homework', 'Complete math assignments from school', 'homework', 'high', '📐', 'emoji', 'both', ARRAY['school', 'daily', 'math']),
('Reading Time', 'Read for 20 minutes', 'homework', 'high', '📚', 'emoji', 'both', ARRAY['reading', 'daily', 'books']),
('Writing Practice', 'Practice handwriting or journaling', 'homework', 'medium', '✏️', 'emoji', '5-8', ARRAY['writing', 'practice']),
('Study Session', 'Review notes and study for tests', 'homework', 'high', '📖', 'emoji', '9-12', ARRAY['study', 'test prep']),
('Work on School Project', 'Make progress on current school project', 'homework', 'high', '🎨', 'emoji', 'both', ARRAY['project', 'school']),
('Practice Musical Instrument', 'Practice piano, guitar, or other instrument', 'homework', 'medium', '🎵', 'emoji', 'both', ARRAY['music', 'practice']);

-- Hygiene & Self-Care Tasks
INSERT INTO task_library (title, description, category, priority, image_url, image_source, recommended_age_group, tags) VALUES
('Brush Teeth - Morning', 'Brush teeth after breakfast', 'hygiene', 'high', '🦷', 'emoji', 'both', ARRAY['teeth', 'morning', 'daily']),
('Brush Teeth - Night', 'Brush teeth before bed', 'hygiene', 'high', '🦷', 'emoji', 'both', ARRAY['teeth', 'bedtime', 'daily']),
('Take a Shower', 'Wash hair and body with soap', 'hygiene', 'high', '🚿', 'emoji', 'both', ARRAY['shower', 'bath', 'clean']),
('Wash Hands', 'Wash hands with soap before meals', 'hygiene', 'high', '🧼', 'emoji', 'both', ARRAY['hands', 'hygiene', 'before meals']),
('Comb Hair', 'Brush or comb hair neatly', 'hygiene', 'medium', '💇', 'emoji', 'both', ARRAY['hair', 'grooming', 'morning']),
('Change into Clean Clothes', 'Put on fresh clothes for the day', 'hygiene', 'high', '👔', 'emoji', 'both', ARRAY['clothes', 'morning', 'daily']);

-- Outdoor & Yard Work Tasks
INSERT INTO task_library (title, description, category, priority, image_url, image_source, recommended_age_group, tags) VALUES
('Water the Plants', 'Water indoor and outdoor plants', 'outdoor', 'medium', '🌱', 'emoji', 'both', ARRAY['plants', 'garden', 'watering']),
('Rake Leaves', 'Gather fallen leaves in yard', 'outdoor', 'medium', '🍂', 'emoji', '9-12', ARRAY['yard', 'fall', 'leaves']),
('Help with Yard Work', 'Assist with outdoor chores', 'outdoor', 'medium', '🌳', 'emoji', '9-12', ARRAY['yard', 'outdoor', 'garden']),
('Sweep Porch/Patio', 'Sweep outdoor living areas', 'outdoor', 'low', '🧹', 'emoji', 'both', ARRAY['outdoor', 'sweeping', 'porch']);

-- Helping Family Tasks
INSERT INTO task_library (title, description, category, priority, image_url, image_source, recommended_age_group, tags) VALUES
('Set the Table', 'Put plates, utensils, and napkins on table', 'helping', 'medium', '🍽️', 'emoji', 'both', ARRAY['dinner', 'meals', 'table']),
('Clear the Table', 'Remove dishes from table after meals', 'helping', 'medium', '🧽', 'emoji', 'both', ARRAY['dinner', 'meals', 'cleanup']),
('Help Make Dinner', 'Assist with meal preparation', 'helping', 'medium', '👨‍🍳', 'emoji', '9-12', ARRAY['cooking', 'dinner', 'kitchen']),
('Help Younger Sibling', 'Assist brother or sister with tasks', 'helping', 'medium', '👦', 'emoji', '9-12', ARRAY['sibling', 'help', 'family']),
('Fold Laundry', 'Fold clean clothes from dryer', 'helping', 'medium', '🧺', 'emoji', 'both', ARRAY['laundry', 'clothes', 'folding']),
('Load Dishwasher', 'Put dirty dishes in dishwasher', 'helping', 'medium', '🍴', 'emoji', 'both', ARRAY['dishes', 'kitchen', 'cleanup']),
('Unload Dishwasher', 'Put clean dishes away', 'helping', 'medium', '🍽️', 'emoji', 'both', ARRAY['dishes', 'kitchen', 'cleanup']);

-- Meals Tasks
INSERT INTO task_library (title, description, category, priority, image_url, image_source, recommended_age_group, tags) VALUES
('Eat Breakfast', 'Finish your morning meal', 'meals', 'high', '🥞', 'emoji', 'both', ARRAY['breakfast', 'morning', 'nutrition']),
('Eat Lunch', 'Finish your afternoon meal', 'meals', 'high', '🥗', 'emoji', 'both', ARRAY['lunch', 'afternoon', 'nutrition']),
('Eat Dinner', 'Finish your evening meal', 'meals', 'high', '🍝', 'emoji', 'both', ARRAY['dinner', 'evening', 'nutrition']),
('Drink Water', 'Drink at least 4 glasses of water', 'meals', 'medium', '💧', 'emoji', 'both', ARRAY['water', 'hydration', 'healthy']);

-- Pet Care Tasks
INSERT INTO task_library (title, description, category, priority, image_url, image_source, recommended_age_group, tags) VALUES
('Feed the Pet', 'Give food to dog, cat, or other pet', 'pets', 'high', '🐕', 'emoji', 'both', ARRAY['pet', 'feeding', 'daily']),
('Walk the Dog', 'Take dog for a walk outside', 'pets', 'high', '🦮', 'emoji', '9-12', ARRAY['dog', 'walk', 'exercise']),
('Clean Litter Box', 'Clean and refill cat litter box', 'pets', 'medium', '🐈', 'emoji', '9-12', ARRAY['cat', 'litter', 'cleaning']),
('Fill Pet Water Bowl', 'Refill pet''s water dish', 'pets', 'high', '💧', 'emoji', 'both', ARRAY['pet', 'water', 'daily']),
('Play with Pet', 'Spend time playing with pet', 'pets', 'low', '🎾', 'emoji', 'both', ARRAY['pet', 'play', 'fun']);

-- Bedtime & Morning Routine Tasks
INSERT INTO task_library (title, description, category, priority, image_url, image_source, recommended_age_group, tags) VALUES
('Put On Pajamas', 'Change into pajamas for bed', 'bedtime', 'high', '🌙', 'emoji', 'both', ARRAY['bedtime', 'pajamas', 'nighttime']),
('Bedtime Story', 'Read or listen to a bedtime story', 'bedtime', 'medium', '📕', 'emoji', '5-8', ARRAY['bedtime', 'reading', 'story']),
('Get Ready for Bed', 'Complete bedtime routine', 'bedtime', 'high', '😴', 'emoji', 'both', ARRAY['bedtime', 'routine', 'sleep']),
('Morning Routine', 'Get dressed, brush teeth, comb hair', 'bedtime', 'high', '☀️', 'emoji', 'both', ARRAY['morning', 'routine', 'daily']),
('Pack School Bag', 'Put books and supplies in backpack', 'bedtime', 'high', '🎒', 'emoji', 'both', ARRAY['school', 'morning', 'prepare']);

-- Create unique constraint to avoid duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_task_library_unique_title
  ON task_library(title, category);
