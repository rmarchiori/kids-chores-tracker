import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

/**
 * Schema for updating child theme preference
 * Validates theme_preference is one of the allowed values
 */
const ThemeUpdateSchema = z.object({
  theme_preference: z.enum(['age-default', 'young', 'older'], {
    errorMap: () => ({ message: 'Theme must be age-default, young, or older' })
  }),
})

export type ThemeUpdateRequest = z.infer<typeof ThemeUpdateSchema>

/**
 * PATCH /api/children/[id]/theme
 * Update a child's theme preference
 *
 * Security:
 * - User must be authenticated
 * - User must be parent or admin in child's family
 * - Child must belong to user's family
 *
 * @param request - Request body: { theme_preference: 'age-default' | 'young' | 'older' }
 * @param params - Route params: { id: string }
 * @returns Updated child record with theme_preference
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const supabase = await createClient()

    // Authentication: Verify user is logged in
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = ThemeUpdateSchema.parse(body)

    // Authorization: Get user's family member record with role
    const { data: familyMember, error: memberError } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', user.id)
      .single()

    if (memberError) {
      return NextResponse.json(
        { error: 'Family not found', message: 'User is not part of any family' },
        { status: 404 }
      )
    }

    // Authorization: Verify user has parent or admin role
    if (familyMember.role !== 'parent' && familyMember.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only parents and admins can update child themes'
        },
        { status: 403 }
      )
    }

    // Update theme preference
    // RLS policy ensures child belongs to user's family
    const { data: updatedChild, error: updateError } = await supabase
      .from('children')
      .update({ theme_preference: validatedData.theme_preference })
      .eq('id', id)
      .eq('family_id', familyMember.family_id)
      .select('id, name, age_group, theme_preference, profile_photo_url, family_id, created_at')
      .single()

    if (updateError) {
      console.error('Theme update error:', updateError)

      // Handle specific error cases
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          {
            error: 'Child not found',
            message: 'Child does not exist or does not belong to your family'
          },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: 'Update failed', message: updateError.message },
        { status: 500 }
      )
    }

    if (!updatedChild) {
      return NextResponse.json(
        {
          error: 'Child not found',
          message: 'Child does not exist or does not belong to your family'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      child: updatedChild,
      message: 'Theme preference updated successfully'
    })

  } catch (error) {
    console.error('Error updating child theme:', error)

    // Validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    // Unexpected errors
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to update theme preference' },
      { status: 500 }
    )
  }
}
