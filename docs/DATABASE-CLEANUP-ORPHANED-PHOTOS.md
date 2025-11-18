# Cleanup Orphaned Photos from Supabase Storage

This guide provides tools to clean up profile photos in the `profile-photos` bucket that are not referenced by any child records.

## Problem

When users upload a photo and then cancel the crop operation, the uploaded file remains in Supabase Storage but is not associated with any child record. Over time, these orphaned files can accumulate and waste storage space.

## ✅ Automated Solution (RECOMMENDED)

A cleanup script has been created at `scripts/cleanup-orphaned-photos.mjs` that automatically identifies and deletes orphaned photos.

### Usage

**Preview what would be deleted (dry-run mode):**
```bash
node scripts/cleanup-orphaned-photos.mjs --dry-run
```

**Actually delete orphaned files:**
```bash
node scripts/cleanup-orphaned-photos.mjs
```

The script will:
1. Fetch all children records with profile photos
2. List all files in the profile-photos bucket (including nested folders)
3. Compare and identify orphaned files
4. Delete orphaned files and report freed storage space

### Example Output
```
🔍 Starting orphaned photos cleanup...

📋 Step 1: Fetching children records...
   Found 2 children total
   2 have real photo URLs (not data: URLs)
   Referenced files:
      - user-id/profile-1763440151870.jpg
      - user-id/profile-1763441271471.jpg

📁 Step 2: Listing all files in bucket...
   Found 9 total files in bucket

🔎 Step 3: Identifying orphaned files...
   Found 7 orphaned file(s)

🗑️  Step 4: Deleting orphaned files...
   ✅ Successfully deleted 7 orphaned file(s)
   💾 Freed up 0.16 MB of storage
```

## Manual Solutions

Since Supabase Storage doesn't directly support SQL JOINs between storage files and database tables, manual cleanup requires multiple steps:

### Option 1: SQL Query to Find Orphaned Photos (Manual Cleanup)

**Step 1: Get all profile photo URLs from children table**

```sql
SELECT profile_photo_url
FROM children
WHERE profile_photo_url IS NOT NULL
  AND profile_photo_url NOT LIKE 'data:%'; -- Exclude data URLs (avatars)
```

**Step 2: List all files in the profile-photos bucket**

Use the Supabase Dashboard:
1. Go to Storage → profile-photos bucket
2. Export the list of files

**Step 3: Compare and identify orphaned files**

Files in the bucket that are NOT in the list from Step 1 are orphaned and can be deleted.

### Option 2: SQL Function to Find Orphaned URLs (More Automated)

Create this SQL function in your Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION find_orphaned_photo_urls()
RETURNS TABLE(photo_url TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT c.profile_photo_url::TEXT
  FROM children c
  WHERE c.profile_photo_url IS NOT NULL
    AND c.profile_photo_url NOT LIKE 'data:%';
END;
$$ LANGUAGE plpgsql;
```

Then use this function to get referenced URLs:

```sql
SELECT * FROM find_orphaned_photo_urls();
```

Compare this result with the files in your bucket to identify orphans.

### Option 3: Schedule Regular Cleanup

The cleanup script can be run on a schedule to prevent orphaned files from accumulating.

### Option 4: Scheduled Cleanup (Recommended for Production)

Add this as a scheduled cron job or Supabase Edge Function that runs weekly:

```sql
-- Create a log table for cleanup operations
CREATE TABLE IF NOT EXISTS storage_cleanup_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleanup_date TIMESTAMPTZ DEFAULT NOW(),
  files_deleted INTEGER,
  details JSONB
);

-- This would be called by your scheduled function
-- (Storage cleanup must be done via API, not pure SQL)
```

Then schedule the Node.js script above to run weekly using:
- **Vercel Cron Jobs** if deployed on Vercel
- **GitHub Actions** with scheduled workflows
- **Supabase Edge Functions** with cron triggers

## Prevention

The ImageUpload component has been updated to automatically delete uploaded files if the user cancels the crop operation. This should prevent new orphaned files from being created.

## Manual Cleanup via Dashboard

1. Go to Supabase Dashboard → Storage → profile-photos
2. For each file, check if it's referenced in the children table:
   ```sql
   SELECT id, name, profile_photo_url
   FROM children
   WHERE profile_photo_url LIKE '%FILENAME%';
   ```
3. If no results, the file is orphaned and can be safely deleted

## Recommended Maintenance Schedule

- **Initial cleanup**: Run Option 3 script once to clean existing orphans
- **Ongoing**: Set up Option 4 scheduled cleanup to run weekly or monthly
- **Monitoring**: Check the cleanup logs periodically to ensure the issue is under control

## Notes

- Always backup your storage bucket before running bulk delete operations
- The programmatic cleanup (Option 3) is the most reliable and safest method
- Consider implementing storage quotas and alerts to monitor bucket size
- Profile photos are relatively small (max 5MB compressed), so orphaned files may not be a critical issue unless you have thousands of users
