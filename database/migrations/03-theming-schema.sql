-- Sprint 1.1: Add theme preference to children table
-- This enables age-specific theming with manual override capability

-- Add theme preference column
ALTER TABLE children
ADD COLUMN theme_preference TEXT DEFAULT 'age-default'
CHECK (theme_preference IN ('age-default', 'young', 'older'));

-- Add profile photo URL for future use
ALTER TABLE children
ADD COLUMN profile_photo_url TEXT;

-- Update existing children to have age-default theme
UPDATE children
SET theme_preference = 'age-default'
WHERE theme_preference IS NULL;

-- Create index for faster theme queries
CREATE INDEX idx_children_theme ON children(theme_preference);

-- Add comment explaining the column
COMMENT ON COLUMN children.theme_preference IS
'Theme preference: age-default (auto-select based on age_group), young (5-8 style), older (9-12 style)';
