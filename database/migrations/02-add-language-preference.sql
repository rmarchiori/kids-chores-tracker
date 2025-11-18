-- Migration: Add language preference to family_members
-- Sprint 0.5: Multi-Language Support
-- Created: 2025-11-17

-- Add language preference column to family_members
ALTER TABLE family_members
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(10) DEFAULT 'en-CA'
CHECK (language_preference IN ('en-CA', 'pt-BR', 'fr-CA'));

-- Create index for language preference queries
CREATE INDEX IF NOT EXISTS family_members_language_preference_idx
ON family_members(language_preference);

-- Add comment for documentation
COMMENT ON COLUMN family_members.language_preference IS
'User preferred language: en-CA (English Canada), pt-BR (Portuguese Brazil), fr-CA (French Canada)';
