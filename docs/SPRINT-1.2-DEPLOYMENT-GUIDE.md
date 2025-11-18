# Sprint 1.2: Task Management + Image Library - Deployment Guide

**Status**: ✅ IMPLEMENTATION COMPLETE
**Date**: 2025-11-18

## Overview

Sprint 1.2 implements a comprehensive task management system with an image library of 47 curated task illustrations to support visual task identification, especially for non-readers (ages 5-6).

---

## 🚀 What Has Been Implemented

### ✅ Backend Infrastructure
1. **Database Schema** (`database/migrations/05-task-images-schema.sql`)
   - Added image columns to tasks table: `image_url`, `image_alt_text`, `image_source`
   - Created `task_image_library` table with 47 pre-seeded task images
   - Added GIN index for keyword search
   - Row-Level Security (RLS) policies

2. **API Routes**
   - `GET /api/task-images` - Fetch image library
   - `GET /api/tasks` - List tasks with filtering
   - `POST /api/tasks` - Create new task
   - `GET /api/tasks/[id]` - Get task details
   - `PATCH /api/tasks/[id]` - Update task
   - `DELETE /api/tasks/[id]` - Delete task
   - `PATCH /api/tasks/[id]/image` - Update task image

3. **Validation Schemas** (`src/lib/schemas.ts`)
   - `TaskImageSchema` - Image library validation
   - `CreateTaskSchema` - Task creation validation
   - `UpdateTaskSchema` - Task update validation
   - `UpdateTaskImageSchema` - Image update validation

### ✅ Frontend Components
1. **Task Components** (`src/components/tasks/`)
   - `ImagePicker.tsx` - Browse image library with search and category filters
   - `CustomImageUpload.tsx` - Upload custom task images
   - `TaskCard.tsx` - Display task with hybrid image + text
   - `TaskForm.tsx` - Create/edit task form with image selection

2. **Pages** (`src/app/tasks/`)
   - `/tasks` - Task list with filtering
   - `/tasks/new` - Create new task
   - `/tasks/[id]/edit` - Edit existing task

3. **Navigation Updates**
   - Updated Sidebar navigation with Tasks link
   - Updated BottomNav with Tasks link

---

## 📋 Required Setup Steps

### Step 1: Run Database Migration

You need to manually run the migration in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open and execute: `database/migrations/05-task-images-schema.sql`
4. Verify success by checking:
   - Tasks table has new columns: `image_url`, `image_alt_text`, `image_source`
   - New table exists: `task_image_library`
   - 47 images are seeded in the library

**Important**: This migration is idempotent and safe to run multiple times.

### Step 2: Create Supabase Storage Bucket

The image library needs a storage bucket for custom images:

1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Configure:
   ```
   Bucket Name: task-images
   Public: Yes (images need to be publicly accessible)
   Allowed MIME types: image/svg+xml, image/webp, image/png, image/jpeg
   Max file size: 1 MB per file
   ```
4. Create the following folder structure:
   ```
   task-images/
   ├── library/
   │   ├── cleaning/
   │   ├── homework/
   │   ├── hygiene/
   │   ├── outdoor/
   │   ├── helping/
   │   ├── meals/
   │   ├── pets/
   │   └── bedtime/
   └── custom/
   ```

### Step 3: Upload Task Images (Optional)

The database includes 47 pre-seeded image records, but you need actual image files for the library to work. You have three options:

#### Option A: Use Emoji Fallback (Quick Start)
- The system includes emoji fallbacks for common tasks
- Users can select emojis instead of images
- No file uploads needed initially
- **Recommended for MVP testing**

#### Option B: Source Free Icons
1. Visit icon libraries:
   - [Flaticon](https://www.flaticon.com/)
   - [Freepik](https://www.freepik.com/)
   - [unDraw](https://undraw.co/)
2. Download 47 task illustrations matching the categories
3. Upload to `task-images/library/{category}/` folders
4. Update `file_path` in `task_image_library` table if needed

#### Option C: Commission Custom Illustrations
1. Hire an illustrator (Fiverr, Upwork)
2. Request 47 hand-drawn task illustrations
3. Specifications:
   - Style: Cute, friendly, child-appropriate
   - Size: 512x512px
   - Format: SVG or WebP
   - File size: <50KB each
4. Upload to storage bucket
5. Update database file paths

**Note**: The app works without uploaded images using emoji fallbacks. You can add images gradually over time.

---

## 🧪 Testing Checklist

### Database Tests
- [ ] Migration runs successfully without errors
- [ ] `task_image_library` table has 47 rows
- [ ] Search query works: `SELECT * FROM task_image_library WHERE 'clean' = ANY(keywords);`
- [ ] RLS policies allow authenticated users to read images

### Storage Tests
- [ ] Storage bucket `task-images` is created
- [ ] Bucket is public (check bucket settings)
- [ ] Can upload test image to `custom/test-family/test-task/`
- [ ] Uploaded image is publicly accessible via URL

### API Tests
```bash
# Get image library
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/task-images

# Create task
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","category":"cleaning","priority":"medium"}' \
  http://localhost:3000/api/tasks

# Get all tasks
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/tasks
```

### UI Tests
- [ ] Navigate to `/tasks` - list displays
- [ ] Click "New Task" - form opens
- [ ] Click "Choose from Library" - image picker displays
- [ ] Search for "clean" - filtered results show
- [ ] Select image - preview updates
- [ ] Fill form and submit - task created
- [ ] Click on task - edit page opens
- [ ] Update task - changes saved
- [ ] Delete task - confirmation and removal works

### Mobile Tests
- [ ] Navigation shows Tasks icon in bottom nav
- [ ] Task cards display properly on mobile
- [ ] Image picker works on touch devices
- [ ] Form is usable on small screens

---

## 🔧 Configuration

### Environment Variables
No new environment variables are required. The existing Supabase configuration is sufficient:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### TypeScript
All types are properly defined in `src/lib/schemas.ts`. No additional configuration needed.

### Translations
The UI uses existing translation keys:
- `nav.tasks` - Tasks navigation label
- `common.loading` - Loading states

No new translations are required for Sprint 1.2.

---

## 📊 Database Schema Summary

### Modified Tables

#### tasks
```sql
ALTER TABLE tasks
ADD COLUMN image_url TEXT,
ADD COLUMN image_alt_text TEXT,
ADD COLUMN image_source VARCHAR(20) CHECK (image_source IN ('library', 'custom', 'emoji'));
```

### New Tables

#### task_image_library
```sql
CREATE TABLE task_image_library (
  id UUID PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  file_path TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE
);
```

**Image Categories**:
- cleaning (8 images)
- homework (6 images)
- hygiene (8 images)
- outdoor (5 images)
- helping (7 images)
- meals (4 images)
- pets (5 images)
- bedtime (4 images)

**Total**: 47 images

---

## 🚨 Troubleshooting

### Issue: "Failed to fetch task images"
**Solution**:
1. Check migration ran successfully
2. Verify `task_image_library` table exists
3. Check RLS policy allows authenticated users to read

### Issue: "Upload failed" when uploading custom image
**Solution**:
1. Verify storage bucket `task-images` exists and is public
2. Check file size is <1MB
3. Check file type is image/jpeg, image/png, image/webp, or image/svg+xml
4. Verify user is authenticated

### Issue: Images not displaying in picker
**Solution**:
1. Check if image files are uploaded to storage
2. Verify `file_path` in database matches actual storage paths
3. Try emoji fallback as temporary solution
4. Check browser console for 404 errors

### Issue: "Task not found" error
**Solution**:
1. Verify user is member of the family that owns the task
2. Check task exists in database
3. Verify RLS policies on tasks table

---

## 📈 Performance Considerations

### Optimizations Implemented
- GIN index on keywords for fast search
- Image lazy loading in grid view
- Pagination ready (not yet implemented)
- Efficient query with task assignments join

### Recommended Next Steps
1. Add image CDN (e.g., Cloudflare Images)
2. Implement image caching
3. Add pagination for large task lists
4. Optimize image sizes (use WebP format)

---

## 🎯 Success Metrics

Sprint 1.2 is successful when:
- ✅ Users can create tasks with images
- ✅ Image library is searchable and filterable
- ✅ Custom image upload works
- ✅ Tasks display with hybrid image + text
- ✅ All CRUD operations work correctly
- ✅ Navigation includes Tasks link
- ✅ RLS policies protect data correctly

---

## 📚 Related Documentation

- [Sprint 1.2 Specification](/docs/SPRINT-1.2-TASK-IMAGE-LIBRARY.md)
- [Project Status](/docs/PROJECT-STATUS.md)
- [Database Schema](/database/migrations/01-schema.sql)
- [API Documentation](/docs/API.md) (if exists)

---

## 🆘 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review migration SQL for errors
3. Check Supabase dashboard logs
4. Verify all environment variables are set
5. Ensure you're on the correct git branch

---

**Sprint 1.2 Implementation**: COMPLETE ✅
**Deployment Status**: Requires manual migration and storage setup
**Ready for**: Testing and image sourcing
