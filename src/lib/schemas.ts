import { z } from 'zod'

// Image URL Validator - Only allow approved sources
const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return true // null/undefined is okay

  // Allow emojis (simple check for non-URL strings)
  if (url.length <= 10 && !url.startsWith('http') && !url.startsWith('/')) {
    return true // Likely an emoji
  }

  // Allow local paths
  if (url.startsWith('/images/tasks/')) {
    return true
  }

  // Allow Supabase storage URLs only
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && url.startsWith(supabaseUrl)) {
    return true
  }

  return false
}

// Language Support
export const SupportedLanguages = ['en-CA', 'pt-BR', 'fr-CA'] as const
export const LanguageSchema = z.enum(SupportedLanguages)
export type Language = z.infer<typeof LanguageSchema>

// User & Family Schemas
export const FamilySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  created_at: z.string().datetime(),
})

export const ParentSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  family_id: z.string().uuid(),
  created_at: z.string().datetime(),
})

export const ChildSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  age_group: z.enum(['5-8', '9-12']),
  theme_preference: z.enum(['age-default', 'young', 'older']).default('age-default'),
  profile_photo_url: z.union([z.string().url(), z.null()]).optional(),
  family_id: z.string().uuid(),
  created_at: z.string(),
})

// Task Schemas
export const TaskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title required').max(255),
  description: z.string().max(1000).optional(),
  category: z.enum(['cleaning', 'homework', 'pets', 'other']),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.coerce.date(),
  family_id: z.string().uuid(),
  recurring: z.boolean().default(false),
  recurring_type: z.enum(['daily']).optional(),
  image_url: z.string().optional().nullable(),
  image_alt_text: z.string().optional().nullable(),
  image_source: z.enum(['library', 'custom', 'emoji']).optional().nullable(),
  created_at: z.string().datetime().optional(),
})

// Task Image Library Schema
export const TaskImageSchema = z.object({
  id: z.string().uuid(),
  category: z.enum(['cleaning', 'homework', 'hygiene', 'outdoor', 'helping', 'meals', 'pets', 'bedtime']),
  name: z.string().min(1).max(100),
  file_path: z.string(),
  alt_text: z.string(),
  keywords: z.array(z.string()),
  created_at: z.string().datetime(),
})

// Task Creation Schema (for POST requests)
export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000).optional(),
  category: z.enum(['cleaning', 'homework', 'pets', 'other']),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.string().optional(), // ISO date string
  recurring: z.boolean().default(false),
  recurring_type: z.enum(['daily', 'weekly', 'monthly']).optional().nullable(),
  image_url: z.string().optional().nullable().refine(isValidImageUrl, {
    message: 'Image URL must be from approved sources only'
  }),
  image_alt_text: z.string().max(200).optional().nullable(),
  image_source: z.enum(['library', 'custom', 'emoji']).optional().nullable(),
  assigned_children: z.array(z.string().uuid()).optional(),
})

// Task Update Schema (for PATCH requests)
export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  category: z.enum(['cleaning', 'homework', 'pets', 'other']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  due_date: z.string().optional().nullable(), // ISO date string
  recurring: z.boolean().optional(),
  recurring_type: z.enum(['daily', 'weekly', 'monthly']).optional().nullable(),
  image_url: z.string().optional().nullable().refine(isValidImageUrl, {
    message: 'Image URL must be from approved sources only'
  }),
  image_alt_text: z.string().max(200).optional().nullable(),
  image_source: z.enum(['library', 'custom', 'emoji']).optional().nullable(),
  assigned_children: z.array(z.string().uuid()).optional(),
})

// Task Image Update Schema
export const UpdateTaskImageSchema = z.object({
  image_url: z.string().refine(isValidImageUrl, {
    message: 'Image URL must be from approved sources only'
  }),
  image_alt_text: z.string().min(1).max(200),
  image_source: z.enum(['library', 'custom', 'emoji']),
})

export const TaskAssignmentSchema = z.object({
  id: z.string().uuid().optional(),
  task_id: z.string().uuid(),
  child_id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
})

// Task Completion Schemas
export const TaskCompletionSchema = z.object({
  id: z.string().uuid().optional(),
  task_id: z.string().uuid(),
  child_id: z.string().uuid(),
  completed_at: z.coerce.date().optional(),
  rating: z.number().min(1).max(5).nullable().optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(['pending', 'pending_review', 'completed', 'rejected']).default('pending'),
  reviewed_by: z.string().uuid().nullable().optional(),
  feedback: z.string().max(500).optional(),
  created_at: z.string().datetime().optional(),
})

// Rating Schema
export const RatingSchema = z.object({
  rating: z.number().min(1).max(5),
  notes: z.string().max(500).optional(),
})

// Review Schema
export const ReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().min(1).max(500),
})

// Subtask Schema
export const SubtaskSchema = z.object({
  id: z.string().uuid().optional(),
  task_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  completed: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
})

// Type exports
export type Family = z.infer<typeof FamilySchema>
export type Parent = z.infer<typeof ParentSchema>
export type Child = z.infer<typeof ChildSchema>
export type Task = z.infer<typeof TaskSchema>
export type TaskImage = z.infer<typeof TaskImageSchema>
export type CreateTask = z.infer<typeof CreateTaskSchema>
export type UpdateTask = z.infer<typeof UpdateTaskSchema>
export type UpdateTaskImage = z.infer<typeof UpdateTaskImageSchema>
export type TaskAssignment = z.infer<typeof TaskAssignmentSchema>
export type TaskCompletion = z.infer<typeof TaskCompletionSchema>
export type Rating = z.infer<typeof RatingSchema>
export type Review = z.infer<typeof ReviewSchema>
export type Subtask = z.infer<typeof SubtaskSchema>
