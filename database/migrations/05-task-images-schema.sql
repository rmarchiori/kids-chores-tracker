-- Sprint 1.2: Task Image Library System
-- Add image support to tasks table and create task image library
-- Created: 2025-11-18

-- ============================================================================
-- Add image columns to tasks table
-- ============================================================================
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_alt_text TEXT,
ADD COLUMN IF NOT EXISTS image_source VARCHAR(20) DEFAULT 'emoji'
  CHECK (image_source IN ('library', 'custom', 'emoji'));

-- ============================================================================
-- Table: task_image_library
-- ============================================================================
-- Curated library of 40-50 task illustrations for visual task identification
CREATE TABLE IF NOT EXISTS task_image_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'cleaning', 'homework', 'hygiene', 'outdoor',
    'helping', 'meals', 'pets', 'bedtime'
  )),
  name VARCHAR(100) NOT NULL,
  file_path TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  keywords TEXT[], -- For search functionality
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster filtering and search
CREATE INDEX IF NOT EXISTS idx_task_images_category ON task_image_library(category);
CREATE INDEX IF NOT EXISTS idx_task_images_keywords ON task_image_library USING GIN(keywords);

-- Enable RLS
ALTER TABLE task_image_library ENABLE ROW LEVEL SECURITY;

-- RLS policy: Authenticated users can read image library
CREATE POLICY "Authenticated users can read image library"
  ON task_image_library
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- Seed image library with 47 task illustrations
-- ============================================================================
-- Note: Image paths point to Supabase Storage bucket: task-images/library/{category}/

-- Cleaning (8 images)
INSERT INTO task_image_library (category, name, file_path, alt_text, keywords) VALUES
('cleaning', 'Make Bed', '/images/tasks/cleaning/make-bed.svg', 'Child making bed with colorful blanket', ARRAY['bed', 'bedroom', 'morning', 'tidy', 'make']),
('cleaning', 'Clean Room', '/images/tasks/cleaning/clean-room.svg', 'Child organizing toys in room', ARRAY['room', 'tidy', 'organize', 'toys', 'clean']),
('cleaning', 'Vacuum', '/images/tasks/cleaning/vacuum.svg', 'Child using vacuum cleaner', ARRAY['vacuum', 'floor', 'clean', 'sweep']),
('cleaning', 'Dust Furniture', '/images/tasks/cleaning/dust.svg', 'Child dusting furniture with cloth', ARRAY['dust', 'furniture', 'clean', 'wipe']),
('cleaning', 'Take Out Trash', '/images/tasks/cleaning/trash.svg', 'Child taking trash bag to bin', ARRAY['trash', 'garbage', 'waste', 'bin']),
('cleaning', 'Organize Toys', '/images/tasks/cleaning/organize-toys.svg', 'Child sorting toys into bins', ARRAY['toys', 'organize', 'tidy', 'sort', 'put away']),
('cleaning', 'Put Away Laundry', '/images/tasks/cleaning/laundry.svg', 'Child folding and putting away clothes', ARRAY['laundry', 'clothes', 'fold', 'put away']),
('cleaning', 'Wipe Surfaces', '/images/tasks/cleaning/wipe.svg', 'Child wiping counter or table', ARRAY['wipe', 'clean', 'counter', 'table', 'surface']);

-- Homework & Learning (6 images)
INSERT INTO task_image_library (category, name, file_path, alt_text, keywords) VALUES
('homework', 'Math Homework', '/images/tasks/homework/math.svg', 'Child working on math problems', ARRAY['math', 'homework', 'study', 'numbers', 'calculate']),
('homework', 'Reading Time', '/images/tasks/homework/reading.svg', 'Child reading a book', ARRAY['reading', 'book', 'study', 'read']),
('homework', 'Writing Practice', '/images/tasks/homework/writing.svg', 'Child writing in notebook', ARRAY['writing', 'homework', 'practice', 'write']),
('homework', 'Study', '/images/tasks/homework/study.svg', 'Child studying at desk', ARRAY['study', 'homework', 'school', 'learn']),
('homework', 'School Project', '/images/tasks/homework/project.svg', 'Child working on project', ARRAY['project', 'school', 'homework', 'build']),
('homework', 'Practice Instrument', '/images/tasks/homework/music.svg', 'Child practicing musical instrument', ARRAY['music', 'practice', 'instrument', 'play']);

-- Hygiene & Self-Care (8 images)
INSERT INTO task_image_library (category, name, file_path, alt_text, keywords) VALUES
('hygiene', 'Brush Teeth', '/images/tasks/hygiene/brush-teeth.svg', 'Child brushing teeth', ARRAY['teeth', 'brush', 'morning', 'night', 'hygiene', 'dental']),
('hygiene', 'Take Shower', '/images/tasks/hygiene/shower.svg', 'Child taking shower', ARRAY['shower', 'bath', 'clean', 'hygiene', 'wash']),
('hygiene', 'Wash Hands', '/images/tasks/hygiene/wash-hands.svg', 'Child washing hands with soap', ARRAY['hands', 'wash', 'clean', 'hygiene', 'soap']),
('hygiene', 'Comb Hair', '/images/tasks/hygiene/comb-hair.svg', 'Child combing hair', ARRAY['hair', 'comb', 'brush', 'groom']),
('hygiene', 'Clip Nails', '/images/tasks/hygiene/nails.svg', 'Child clipping fingernails', ARRAY['nails', 'clip', 'trim', 'hygiene', 'cut']),
('hygiene', 'Apply Sunscreen', '/images/tasks/hygiene/sunscreen.svg', 'Child applying sunscreen', ARRAY['sunscreen', 'sun', 'protect', 'lotion']),
('hygiene', 'Change Clothes', '/images/tasks/hygiene/clothes.svg', 'Child changing clothes', ARRAY['clothes', 'change', 'dress', 'get dressed']),
('hygiene', 'Wash Face', '/images/tasks/hygiene/wash-face.svg', 'Child washing face', ARRAY['face', 'wash', 'clean', 'hygiene']);

-- Outdoor & Plants (5 images)
INSERT INTO task_image_library (category, name, file_path, alt_text, keywords) VALUES
('outdoor', 'Water Plants', '/images/tasks/outdoor/water-plants.svg', 'Child watering plants with watering can', ARRAY['plants', 'water', 'garden', 'flowers']),
('outdoor', 'Rake Leaves', '/images/tasks/outdoor/rake-leaves.svg', 'Child raking autumn leaves', ARRAY['leaves', 'rake', 'yard', 'fall', 'autumn']),
('outdoor', 'Shovel Snow', '/images/tasks/outdoor/shovel-snow.svg', 'Child shoveling snow', ARRAY['snow', 'shovel', 'winter', 'clear']),
('outdoor', 'Mow Lawn', '/images/tasks/outdoor/mow-lawn.svg', 'Child pushing lawn mower', ARRAY['lawn', 'mow', 'grass', 'yard', 'cut']),
('outdoor', 'Garden Work', '/images/tasks/outdoor/garden.svg', 'Child gardening with tools', ARRAY['garden', 'plant', 'outdoor', 'dig']);

-- Helping Family (7 images)
INSERT INTO task_image_library (category, name, file_path, alt_text, keywords) VALUES
('helping', 'Set Table', '/images/tasks/helping/set-table.svg', 'Child setting dinner table', ARRAY['table', 'set', 'dinner', 'help', 'plates']),
('helping', 'Clear Dishes', '/images/tasks/helping/clear-dishes.svg', 'Child clearing dishes from table', ARRAY['dishes', 'clear', 'table', 'help', 'clean up']),
('helping', 'Help Cook', '/images/tasks/helping/cook.svg', 'Child helping with cooking', ARRAY['cook', 'help', 'kitchen', 'prepare', 'food']),
('helping', 'Help Sibling', '/images/tasks/helping/help-sibling.svg', 'Child helping younger sibling', ARRAY['sibling', 'help', 'brother', 'sister', 'assist']),
('helping', 'Fold Laundry', '/images/tasks/helping/fold-laundry.svg', 'Child folding clean laundry', ARRAY['laundry', 'fold', 'clothes', 'help']),
('helping', 'Load Dishwasher', '/images/tasks/helping/dishwasher.svg', 'Child loading dishwasher', ARRAY['dishwasher', 'dishes', 'load', 'help', 'clean']),
('helping', 'Care for Sibling', '/images/tasks/helping/babysit.svg', 'Child watching younger sibling', ARRAY['sibling', 'care', 'watch', 'help', 'babysit']);

-- Meals & Nutrition (4 images)
INSERT INTO task_image_library (category, name, file_path, alt_text, keywords) VALUES
('meals', 'Eat Breakfast', '/images/tasks/meals/breakfast.svg', 'Child eating breakfast', ARRAY['breakfast', 'eat', 'morning', 'meal', 'food']),
('meals', 'Eat Lunch', '/images/tasks/meals/lunch.svg', 'Child eating lunch', ARRAY['lunch', 'eat', 'meal', 'food']),
('meals', 'Eat Dinner', '/images/tasks/meals/dinner.svg', 'Child eating dinner', ARRAY['dinner', 'eat', 'meal', 'evening', 'food']),
('meals', 'Drink Water', '/images/tasks/meals/water.svg', 'Child drinking water', ARRAY['water', 'drink', 'hydrate', 'healthy']);

-- Pets & Animals (5 images)
INSERT INTO task_image_library (category, name, file_path, alt_text, keywords) VALUES
('pets', 'Feed Pet', '/images/tasks/pets/feed-pet.svg', 'Child feeding dog or cat', ARRAY['pet', 'feed', 'dog', 'cat', 'food', 'animal']),
('pets', 'Walk Dog', '/images/tasks/pets/walk-dog.svg', 'Child walking dog on leash', ARRAY['dog', 'walk', 'pet', 'outdoor', 'exercise']),
('pets', 'Clean Litter Box', '/images/tasks/pets/litter-box.svg', 'Child cleaning cat litter box', ARRAY['cat', 'litter', 'clean', 'pet']),
('pets', 'Groom Pet', '/images/tasks/pets/groom-pet.svg', 'Child brushing pet', ARRAY['pet', 'groom', 'brush', 'dog', 'cat']),
('pets', 'Fill Water Bowl', '/images/tasks/pets/pet-water.svg', 'Child filling pet water bowl', ARRAY['pet', 'water', 'bowl', 'fill', 'drink']);

-- Bedtime & Morning Routine (4 images)
INSERT INTO task_image_library (category, name, file_path, alt_text, keywords) VALUES
('bedtime', 'Put On Pajamas', '/images/tasks/bedtime/pajamas.svg', 'Child putting on pajamas', ARRAY['pajamas', 'bedtime', 'sleep', 'night', 'pjs']),
('bedtime', 'Story Time', '/images/tasks/bedtime/story.svg', 'Child reading bedtime story', ARRAY['story', 'bedtime', 'read', 'night', 'book']),
('bedtime', 'Lights Out', '/images/tasks/bedtime/sleep.svg', 'Child sleeping in bed', ARRAY['sleep', 'bedtime', 'night', 'rest', 'lights out']),
('bedtime', 'Morning Routine', '/images/tasks/bedtime/morning.svg', 'Child getting ready in morning', ARRAY['morning', 'routine', 'wake', 'start', 'get ready']);

-- Avoid duplicate entries
-- If this migration is run multiple times, it will skip existing entries
-- due to the UNIQUE constraint on (category, name) we should add:
CREATE UNIQUE INDEX IF NOT EXISTS idx_task_images_unique_name
  ON task_image_library(category, name);
