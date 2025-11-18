# Sprint 1.2: Task Image Library System

**Sprint Duration**: 22 hours (part of enhanced Sprint 1.2)
**Dependencies**: Sprint 1.1 (Children management + theming complete)
**Status**: ⏳ NOT STARTED

---

## Overview

Implement a curated task image library with 40-50 hand-drawn illustrations to support non-readers (ages 5-6) and enhance visual task identification for all children. Includes hybrid image + text display, custom image upload capability, and emoji fallbacks.

## Problem Statement

**Target Users**: Children ages 5-8, especially early readers (5-6 years)
- **5-6 year olds**: Cannot read yet, need 100% visual cues
- **7-8 year olds**: Benefit from visual reinforcement, reduces cognitive load
- **Parents**: Need quick, recognizable task icons for rapid task creation

**User Pain Points Without Images**:
- Young children cannot independently identify tasks
- Parents must verbally explain each task
- Children ask "what does this say?" repeatedly
- Reduces sense of independence and accomplishment

---

## Goals

1. **Maximize Independence**: 5-6 year olds can identify tasks without reading
2. **Reduce Cognitive Load**: Visual + text is easier to process than text alone
3. **Speed Task Creation**: Parents select from library instead of searching for images
4. **Support Customization**: Parents can upload custom images for unique tasks

---

## Image Library Specifications

### Library Categories (8 categories, 40-50 total images)

#### 1. Cleaning (8 images)
- Make bed
- Clean room / tidy up
- Vacuum floor
- Dust furniture
- Take out trash
- Organize toys
- Put away laundry
- Wipe surfaces

#### 2. Homework & Learning (6 images)
- Math homework
- Reading time
- Writing practice
- Study / review
- School project
- Practice instrument

#### 3. Hygiene & Self-Care (8 images)
- Brush teeth (morning/night)
- Take shower/bath
- Wash hands
- Comb/brush hair
- Clip nails
- Put on sunscreen
- Change clothes
- Wash face

#### 4. Outdoor & Plants (5 images)
- Water plants
- Rake leaves
- Shovel snow
- Mow lawn
- Garden work

#### 5. Helping Family (7 images)
- Set table
- Clear dishes
- Help with cooking
- Help sibling
- Fold laundry
- Load/unload dishwasher
- Take care of younger sibling

#### 6. Meals & Nutrition (4 images)
- Eat breakfast
- Eat lunch
- Eat dinner
- Drink water / healthy snack

#### 7. Pets & Animals (5 images)
- Feed dog/cat
- Walk dog
- Clean litter box
- Groom pet
- Fill pet water bowl

#### 8. Bedtime & Morning Routine (4 images)
- Put on pajamas
- Story time
- Lights out / sleep
- Morning routine

### Visual Style Requirements

**Illustration Style**:
- Hand-drawn, cute, friendly aesthetic
- Simple, recognizable shapes
- High contrast for visibility
- Suitable for ages 5-12 (not babyish, not too mature)
- Culturally inclusive (diverse skin tones, family structures)

**Technical Specs**:
- Format: SVG (scalable) or WebP (optimized)
- Size: 512x512px minimum
- Transparent background
- Alt text for every image (accessibility)
- File size: <50KB per image

**Color Adaptation**:
- Images should work with both age themes (young bright, older cool)
- Use neutral base colors that can be tinted dynamically
- Avoid hard-coded theme colors in illustrations

---

## Implementation Plan

### 1. Database Schema Update (1 hour)

**File**: `database/03-task-images-schema.sql`

```sql
-- Add image columns to tasks table
ALTER TABLE tasks
ADD COLUMN image_url TEXT,
ADD COLUMN image_alt_text TEXT,
ADD COLUMN image_source TEXT DEFAULT 'emoji'
  CHECK (image_source IN ('library', 'custom', 'emoji'));

-- Create task_image_library table for curated images
CREATE TABLE task_image_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN (
    'cleaning', 'homework', 'hygiene', 'outdoor',
    'helping', 'meals', 'pets', 'bedtime'
  )),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  keywords TEXT[], -- For search functionality
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster category filtering
CREATE INDEX idx_task_images_category ON task_image_library(category);

-- Create index for keyword search
CREATE INDEX idx_task_images_keywords ON task_image_library USING GIN(keywords);

-- Seed initial image library (40-50 images)
-- This will be populated with actual image paths after asset creation
INSERT INTO task_image_library (category, name, file_path, alt_text, keywords) VALUES
-- Cleaning
('cleaning', 'Make Bed', '/images/tasks/cleaning/make-bed.svg', 'Child making bed with colorful blanket', ARRAY['bed', 'bedroom', 'morning', 'tidy']),
('cleaning', 'Clean Room', '/images/tasks/cleaning/clean-room.svg', 'Child organizing toys in room', ARRAY['room', 'tidy', 'organize', 'toys']),
('cleaning', 'Vacuum', '/images/tasks/cleaning/vacuum.svg', 'Child using vacuum cleaner', ARRAY['vacuum', 'floor', 'clean']),
('cleaning', 'Dust Furniture', '/images/tasks/cleaning/dust.svg', 'Child dusting furniture with cloth', ARRAY['dust', 'furniture', 'clean']),
('cleaning', 'Take Out Trash', '/images/tasks/cleaning/trash.svg', 'Child taking trash bag to bin', ARRAY['trash', 'garbage', 'waste']),
('cleaning', 'Organize Toys', '/images/tasks/cleaning/organize-toys.svg', 'Child sorting toys into bins', ARRAY['toys', 'organize', 'tidy', 'sort']),
('cleaning', 'Put Away Laundry', '/images/tasks/cleaning/laundry.svg', 'Child folding and putting away clothes', ARRAY['laundry', 'clothes', 'fold']),
('cleaning', 'Wipe Surfaces', '/images/tasks/cleaning/wipe.svg', 'Child wiping counter or table', ARRAY['wipe', 'clean', 'counter', 'table']),

-- Homework
('homework', 'Math Homework', '/images/tasks/homework/math.svg', 'Child working on math problems', ARRAY['math', 'homework', 'study', 'numbers']),
('homework', 'Reading Time', '/images/tasks/homework/reading.svg', 'Child reading a book', ARRAY['reading', 'book', 'study']),
('homework', 'Writing Practice', '/images/tasks/homework/writing.svg', 'Child writing in notebook', ARRAY['writing', 'homework', 'practice']),
('homework', 'Study', '/images/tasks/homework/study.svg', 'Child studying at desk', ARRAY['study', 'homework', 'school']),
('homework', 'School Project', '/images/tasks/homework/project.svg', 'Child working on project', ARRAY['project', 'school', 'homework']),
('homework', 'Practice Instrument', '/images/tasks/homework/music.svg', 'Child practicing musical instrument', ARRAY['music', 'practice', 'instrument']),

-- Hygiene
('hygiene', 'Brush Teeth', '/images/tasks/hygiene/brush-teeth.svg', 'Child brushing teeth', ARRAY['teeth', 'brush', 'morning', 'night', 'hygiene']),
('hygiene', 'Take Shower', '/images/tasks/hygiene/shower.svg', 'Child taking shower', ARRAY['shower', 'bath', 'clean', 'hygiene']),
('hygiene', 'Wash Hands', '/images/tasks/hygiene/wash-hands.svg', 'Child washing hands with soap', ARRAY['hands', 'wash', 'clean', 'hygiene']),
('hygiene', 'Comb Hair', '/images/tasks/hygiene/comb-hair.svg', 'Child combing hair', ARRAY['hair', 'comb', 'brush', 'groom']),
('hygiene', 'Clip Nails', '/images/tasks/hygiene/nails.svg', 'Child clipping fingernails', ARRAY['nails', 'clip', 'trim', 'hygiene']),
('hygiene', 'Apply Sunscreen', '/images/tasks/hygiene/sunscreen.svg', 'Child applying sunscreen', ARRAY['sunscreen', 'sun', 'protect']),
('hygiene', 'Change Clothes', '/images/tasks/hygiene/clothes.svg', 'Child changing clothes', ARRAY['clothes', 'change', 'dress']),
('hygiene', 'Wash Face', '/images/tasks/hygiene/wash-face.svg', 'Child washing face', ARRAY['face', 'wash', 'clean', 'hygiene']),

-- Outdoor
('outdoor', 'Water Plants', '/images/tasks/outdoor/water-plants.svg', 'Child watering plants with watering can', ARRAY['plants', 'water', 'garden']),
('outdoor', 'Rake Leaves', '/images/tasks/outdoor/rake-leaves.svg', 'Child raking autumn leaves', ARRAY['leaves', 'rake', 'yard', 'fall']),
('outdoor', 'Shovel Snow', '/images/tasks/outdoor/shovel-snow.svg', 'Child shoveling snow', ARRAY['snow', 'shovel', 'winter']),
('outdoor', 'Mow Lawn', '/images/tasks/outdoor/mow-lawn.svg', 'Child pushing lawn mower', ARRAY['lawn', 'mow', 'grass', 'yard']),
('outdoor', 'Garden Work', '/images/tasks/outdoor/garden.svg', 'Child gardening with tools', ARRAY['garden', 'plant', 'outdoor']),

-- Helping
('helping', 'Set Table', '/images/tasks/helping/set-table.svg', 'Child setting dinner table', ARRAY['table', 'set', 'dinner', 'help']),
('helping', 'Clear Dishes', '/images/tasks/helping/clear-dishes.svg', 'Child clearing dishes from table', ARRAY['dishes', 'clear', 'table', 'help']),
('helping', 'Help Cook', '/images/tasks/helping/cook.svg', 'Child helping with cooking', ARRAY['cook', 'help', 'kitchen']),
('helping', 'Help Sibling', '/images/tasks/helping/help-sibling.svg', 'Child helping younger sibling', ARRAY['sibling', 'help', 'brother', 'sister']),
('helping', 'Fold Laundry', '/images/tasks/helping/fold-laundry.svg', 'Child folding clean laundry', ARRAY['laundry', 'fold', 'clothes', 'help']),
('helping', 'Load Dishwasher', '/images/tasks/helping/dishwasher.svg', 'Child loading dishwasher', ARRAY['dishwasher', 'dishes', 'load', 'help']),
('helping', 'Care for Sibling', '/images/tasks/helping/babysit.svg', 'Child watching younger sibling', ARRAY['sibling', 'care', 'watch', 'help']),

-- Meals
('meals', 'Eat Breakfast', '/images/tasks/meals/breakfast.svg', 'Child eating breakfast', ARRAY['breakfast', 'eat', 'morning', 'meal']),
('meals', 'Eat Lunch', '/images/tasks/meals/lunch.svg', 'Child eating lunch', ARRAY['lunch', 'eat', 'meal']),
('meals', 'Eat Dinner', '/images/tasks/meals/dinner.svg', 'Child eating dinner', ARRAY['dinner', 'eat', 'meal', 'evening']),
('meals', 'Drink Water', '/images/tasks/meals/water.svg', 'Child drinking water', ARRAY['water', 'drink', 'hydrate', 'healthy']),

-- Pets
('pets', 'Feed Pet', '/images/tasks/pets/feed-pet.svg', 'Child feeding dog or cat', ARRAY['pet', 'feed', 'dog', 'cat', 'food']),
('pets', 'Walk Dog', '/images/tasks/pets/walk-dog.svg', 'Child walking dog on leash', ARRAY['dog', 'walk', 'pet', 'outdoor']),
('pets', 'Clean Litter Box', '/images/tasks/pets/litter-box.svg', 'Child cleaning cat litter box', ARRAY['cat', 'litter', 'clean', 'pet']),
('pets', 'Groom Pet', '/images/tasks/pets/groom-pet.svg', 'Child brushing pet', ARRAY['pet', 'groom', 'brush', 'dog', 'cat']),
('pets', 'Fill Water Bowl', '/images/tasks/pets/pet-water.svg', 'Child filling pet water bowl', ARRAY['pet', 'water', 'bowl', 'fill']),

-- Bedtime
('bedtime', 'Put On Pajamas', '/images/tasks/bedtime/pajamas.svg', 'Child putting on pajamas', ARRAY['pajamas', 'bedtime', 'sleep', 'night']),
('bedtime', 'Story Time', '/images/tasks/bedtime/story.svg', 'Child reading bedtime story', ARRAY['story', 'bedtime', 'read', 'night']),
('bedtime', 'Lights Out', '/images/tasks/bedtime/sleep.svg', 'Child sleeping in bed', ARRAY['sleep', 'bedtime', 'night', 'rest']),
('bedtime', 'Morning Routine', '/images/tasks/bedtime/morning.svg', 'Child getting ready in morning', ARRAY['morning', 'routine', 'wake', 'start']);

-- Enable RLS
ALTER TABLE task_image_library ENABLE ROW LEVEL SECURITY;

-- RLS policy: Anyone authenticated can read image library
CREATE POLICY "Authenticated users can read image library"
  ON task_image_library
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

---

### 2. Supabase Storage Setup (2 hours)

**Storage Bucket Configuration**:

```typescript
// In Supabase Dashboard: Storage > Create Bucket

Bucket Name: task-images
Public: true (images need to be publicly accessible)
Allowed MIME types: image/svg+xml, image/webp, image/png, image/jpeg
Max file size: 1 MB per image
```

**Upload Structure**:
```
task-images/
├── library/
│   ├── cleaning/
│   │   ├── make-bed.svg
│   │   ├── clean-room.svg
│   │   └── ...
│   ├── homework/
│   ├── hygiene/
│   ├── outdoor/
│   ├── helping/
│   ├── meals/
│   ├── pets/
│   └── bedtime/
└── custom/
    └── {family_id}/
        └── {task_id}/
            └── custom-image.webp
```

---

### 3. Image Picker Component (5 hours)

**File**: `src/components/tasks/ImagePicker.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { MagnifyingGlassIcon, PhotoIcon, FaceSmileIcon } from '@heroicons/react/24/outline'

interface TaskImage {
  id: string
  category: string
  name: string
  file_path: string
  alt_text: string
  keywords: string[]
}

interface ImagePickerProps {
  onSelect: (imageUrl: string, altText: string, source: 'library' | 'emoji') => void
  currentImage?: string | null
}

const EMOJI_OPTIONS = [
  { emoji: '🛏️', name: 'Bed', keywords: ['bed', 'sleep'] },
  { emoji: '🧹', name: 'Broom', keywords: ['clean', 'sweep'] },
  { emoji: '🪥', name: 'Toothbrush', keywords: ['teeth', 'brush'] },
  { emoji: '📚', name: 'Books', keywords: ['read', 'study', 'homework'] },
  { emoji: '🍽️', name: 'Plate', keywords: ['eat', 'meal', 'dinner'] },
  { emoji: '🐕', name: 'Dog', keywords: ['pet', 'dog', 'walk'] },
  { emoji: '🌱', name: 'Plant', keywords: ['water', 'garden'] },
  { emoji: '🧸', name: 'Toy', keywords: ['toys', 'organize'] },
  { emoji: '👕', name: 'Clothes', keywords: ['laundry', 'clothes'] },
  { emoji: '🚿', name: 'Shower', keywords: ['shower', 'bath'] },
]

export function ImagePicker({ onSelect, currentImage }: ImagePickerProps) {
  const [images, setImages] = useState<TaskImage[]>([])
  const [filteredImages, setFilteredImages] = useState<TaskImage[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'library' | 'emoji'>('library')

  const categories = ['all', 'cleaning', 'homework', 'hygiene', 'outdoor', 'helping', 'meals', 'pets', 'bedtime']

  // Fetch image library
  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch('/api/task-images')
        const data = await response.json()
        setImages(data)
        setFilteredImages(data)
      } catch (error) {
        console.error('Failed to fetch task images:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchImages()
  }, [])

  // Filter images by category and search
  useEffect(() => {
    let filtered = images

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(img => img.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(img =>
        img.name.toLowerCase().includes(query) ||
        img.keywords.some(keyword => keyword.toLowerCase().includes(query))
      )
    }

    setFilteredImages(filtered)
  }, [selectedCategory, searchQuery, images])

  return (
    <div className="space-y-4">
      {/* Tab Selector */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('library')}
          className={`
            px-4 py-2 font-medium transition-colors
            ${activeTab === 'library'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          <PhotoIcon className="w-5 h-5 inline mr-2" />
          Image Library
        </button>
        <button
          onClick={() => setActiveTab('emoji')}
          className={`
            px-4 py-2 font-medium transition-colors
            ${activeTab === 'emoji'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          <FaceSmileIcon className="w-5 h-5 inline mr-2" />
          Emojis
        </button>
      </div>

      {activeTab === 'library' ? (
        <>
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Image Grid */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading images...</div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No images found. Try a different search or category.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
              {filteredImages.map(image => (
                <button
                  key={image.id}
                  onClick={() => onSelect(image.file_path, image.alt_text, 'library')}
                  className={`
                    relative aspect-square rounded-lg border-2 overflow-hidden
                    transition-all hover:scale-105
                    ${currentImage === image.file_path
                      ? 'border-blue-600 ring-2 ring-blue-600'
                      : 'border-gray-200 hover:border-blue-400'}
                  `}
                >
                  <Image
                    src={image.file_path}
                    alt={image.alt_text}
                    fill
                    className="object-contain p-2"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center truncate">
                    {image.name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Emoji Grid */
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 max-h-96 overflow-y-auto">
          {EMOJI_OPTIONS.map(option => (
            <button
              key={option.emoji}
              onClick={() => onSelect(option.emoji, option.name, 'emoji')}
              className={`
                aspect-square rounded-lg border-2 flex items-center justify-center
                text-4xl transition-all hover:scale-110
                ${currentImage === option.emoji
                  ? 'border-blue-600 ring-2 ring-blue-600'
                  : 'border-gray-200 hover:border-blue-400'}
              `}
              title={option.name}
            >
              {option.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### 4. Custom Image Upload Component (3 hours)

**File**: `src/components/tasks/CustomImageUpload.tsx`

```typescript
'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'

interface CustomImageUploadProps {
  familyId: string
  taskId: string
  onUploadComplete: (url: string, altText: string) => void
}

export function CustomImageUpload({
  familyId,
  taskId,
  onUploadComplete
}: CustomImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setError(null)

      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, WebP, or SVG)')
        return
      }

      // Validate file size (1MB max)
      if (file.size > 1024 * 1024) {
        setError('Image must be less than 1MB')
        return
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `custom/${familyId}/${taskId}/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('task-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('task-images')
        .getPublicUrl(filePath)

      onUploadComplete(publicUrl, file.name)
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block">
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${uploading
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-gray-400 hover:border-blue-500 hover:bg-blue-50'}
          `}
        >
          <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            {uploading ? 'Uploading...' : 'Click to upload custom image'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            JPEG, PNG, WebP, or SVG • Max 1MB
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </div>
      </label>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
```

---

### 5. API Routes (4 hours)

**File**: `src/app/api/task-images/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all images from library
    const { data: images, error } = await supabase
      .from('task_image_library')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(images)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**File**: `src/app/api/tasks/[id]/image/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const imageUpdateSchema = z.object({
  image_url: z.string(),
  image_alt_text: z.string(),
  image_source: z.enum(['library', 'custom', 'emoji']),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const { image_url, image_alt_text, image_source } = imageUpdateSchema.parse(body)

    // Verify user has access to this task's family
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('family_id')
      .eq('id', params.id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Verify user is member of this family
    const { data: membership } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', task.family_id)
      .eq('user_id', session.user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update task image
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({
        image_url,
        image_alt_text,
        image_source,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updatedTask)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

### 6. Task Display Components (4 hours)

**File**: `src/components/tasks/TaskCard.tsx`

```typescript
'use client'

import Image from 'next/image'
import { useTheme } from '@/lib/theme-context'
import { getThemeClasses } from '@/lib/theme-utils'
import { ThemeCard } from '@/components/theme/ThemeCard'

interface TaskCardProps {
  task: {
    id: string
    title: string
    description?: string
    image_url?: string
    image_alt_text?: string
    image_source?: 'library' | 'custom' | 'emoji'
    status: 'pending' | 'completed' | 'pending_review'
  }
  onClick?: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { theme } = useTheme()
  const themeClasses = getThemeClasses(theme)

  return (
    <ThemeCard>
      <button
        onClick={onClick}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        {/* Image Section - Hybrid Image + Text */}
        <div className="flex items-center gap-4 mb-3">
          {/* Task Image/Emoji */}
          <div className={`
            flex-shrink-0 flex items-center justify-center
            ${themeClasses.iconSize}
            ${task.image_source === 'emoji' ? 'text-4xl' : ''}
          `}>
            {task.image_url ? (
              task.image_source === 'emoji' ? (
                <span>{task.image_url}</span>
              ) : (
                <Image
                  src={task.image_url}
                  alt={task.image_alt_text || task.title}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              )
            ) : (
              // Fallback: First letter of task title in colored circle
              <div className={`
                ${themeClasses.iconSize}
                rounded-full
                ${themeClasses.primary}
                flex items-center justify-center
                font-bold text-white
                ${themeClasses.textSize}
              `}>
                {task.title.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Task Title */}
          <h3 className={`
            flex-1 font-semibold
            ${themeClasses.textSize}
            ${themeClasses.text}
          `}>
            {task.title}
          </h3>
        </div>

        {/* Description (if present) */}
        {task.description && theme === 'parent' && (
          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${task.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : task.status === 'pending_review'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'}
          `}>
            {task.status === 'completed' ? '✓ Done' :
             task.status === 'pending_review' ? '⏳ Review' : 'To Do'}
          </span>
        </div>
      </button>
    </ThemeCard>
  )
}
```

---

## Testing Checklist

### Image Library
- [ ] All 40-50 images uploaded to Supabase Storage
- [ ] Images display correctly in all browsers
- [ ] Search functionality finds images by name and keywords
- [ ] Category filtering works correctly
- [ ] Image selection updates task correctly

### Custom Upload
- [ ] File type validation works (accept only images)
- [ ] File size validation works (max 1MB)
- [ ] Upload to Supabase Storage succeeds
- [ ] Uploaded images display correctly
- [ ] Error handling for failed uploads

### Display
- [ ] Hybrid image + text displays correctly
- [ ] Emoji fallback works when no image selected
- [ ] Images scale correctly on all devices
- [ ] Theme colors don't interfere with images
- [ ] Alt text present for accessibility

### Performance
- [ ] Image library loads quickly (<1s)
- [ ] Images lazy-load in grid view
- [ ] Custom uploads complete in <5s
- [ ] No memory leaks when browsing large image grid

---

## Asset Sourcing Strategy

### Option 1: Commission Custom Illustrations (Recommended)
- **Platform**: Fiverr, Upwork, or 99designs
- **Budget**: $200-400 for 40-50 illustrations
- **Timeline**: 2-3 weeks
- **Style**: Hand-drawn, cute, friendly, culturally inclusive
- **Deliverables**: SVG files, 512x512px, transparent background

### Option 2: Use Free Icon Libraries (Faster, Lower Quality)
- **Sources**: Flaticon, Freepik, unDraw, Streamline Icons
- **Cost**: Free with attribution
- **Timeline**: 1 week to curate and adapt
- **Limitation**: May not perfectly match desired style

### Option 3: AI-Generated (Experimental)
- **Tool**: DALL-E 3, Midjourney, or Stable Diffusion
- **Cost**: $50-100 for generation + editing
- **Timeline**: 1 week
- **Risk**: Consistency and style control

---

## Success Metrics

- **Independence**: 80%+ of 5-6 year olds can identify tasks without help
- **Task Creation Speed**: Parents create tasks 50% faster with library
- **Adoption**: 90%+ of tasks use images (library or custom)
- **Accessibility**: 100% of images have descriptive alt text
- **Performance**: Image picker loads in <1 second

---

## Post-MVP Enhancements (Future)

- [ ] AI-powered image generation (text-to-image for custom tasks)
- [ ] AI-powered task suggestions from images (image-to-text)
- [ ] Animated task illustrations (celebrate completion)
- [ ] Seasonal/holiday image variants
- [ ] User-contributed image library (community sharing)
- [ ] Multi-language alt text support
- [ ] Image editing tools (crop, rotate, filters)
