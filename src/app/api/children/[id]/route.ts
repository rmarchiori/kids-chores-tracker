import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ChildSchema } from '@/lib/schemas'
import { z } from 'zod'

// Schema for updating a child
const UpdateChildSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  age_group: z.enum(['5-8', '9-12']).optional(),
  theme_preference: z.enum(['age-default', 'young', 'older']).optional(),
  profile_photo_url: z.union([z.string().url(), z.null()]).optional(),
})

/**
 * GET /api/children/[id]
 * Get a specific child by ID
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's family member record
    const { data: familyMember, error: memberError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (memberError) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 })
    }

    // Get child
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('*')
      .eq('id', id)
      .eq('family_id', familyMember.family_id)
      .single()

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    // Validate child data
    const validatedChild = ChildSchema.parse(child)

    return NextResponse.json({ child: validatedChild })
  } catch (error) {
    console.error('Error fetching child:', error)
    return NextResponse.json(
      { error: 'Failed to fetch child' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/children/[id]
 * Update a child's information
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's family member record
    const { data: familyMember, error: memberError } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', user.id)
      .single()

    if (memberError) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 })
    }

    // Only parents and admins can update children
    if (familyMember.role !== 'parent' && familyMember.role !== 'admin') {
      return NextResponse.json({ error: 'Only parents can update children' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = UpdateChildSchema.parse(body)

    // Update child
    const { data: child, error: updateError } = await supabase
      .from('children')
      .update(validatedData)
      .eq('id', id)
      .eq('family_id', familyMember.family_id)
      .select()
      .single()

    if (updateError || !child) {
      return NextResponse.json({ error: 'Child not found or update failed' }, { status: 404 })
    }

    // Validate updated child
    const validatedChild = ChildSchema.parse(child)

    return NextResponse.json({ child: validatedChild })
  } catch (error) {
    console.error('Error updating child:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update child' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/children/[id]
 * Delete a child
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's family member record
    const { data: familyMember, error: memberError } = await supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', user.id)
      .single()

    if (memberError) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 })
    }

    // Only parents and admins can delete children
    if (familyMember.role !== 'parent' && familyMember.role !== 'admin') {
      return NextResponse.json({ error: 'Only parents can delete children' }, { status: 403 })
    }

    // Delete child
    const { error: deleteError } = await supabase
      .from('children')
      .delete()
      .eq('id', id)
      .eq('family_id', familyMember.family_id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting child:', error)
    return NextResponse.json(
      { error: 'Failed to delete child' },
      { status: 500 }
    )
  }
}
