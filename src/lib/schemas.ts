import { z } from 'zod'

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
  family_id: z.string().uuid(),
  created_at: z.string().datetime(),
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
  created_at: z.string().datetime().optional(),
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
  completed_at: z.coerce.date(),
  rating: z.number().min(1).max(5).nullable().optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(['completed', 'pending_review', 'reviewed']).default('completed'),
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
export type TaskAssignment = z.infer<typeof TaskAssignmentSchema>
export type TaskCompletion = z.infer<typeof TaskCompletionSchema>
export type Rating = z.infer<typeof RatingSchema>
export type Review = z.infer<typeof ReviewSchema>
export type Subtask = z.infer<typeof SubtaskSchema>
