import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ChildSchema } from '@/lib/schemas'
import { z } from 'zod'

// Schema for creating a child (without id and created_at)
const CreateChildSchema = z.object({
  name: z.string().min(1).max(255),
  age_group: z.enum(['5-8', '9-12']),
  theme_preference: z.enum(['age-default', 'young', 'older']).default('age-default'),
  profile_photo_url: z.union([z.string().url(), z.null()]).optional(),
})

/**
 * GET /api/children
 * Get all children for the current user's family
 */
export async function GET() {
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

    // Get children for this family
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('*')
      .eq('family_id', familyMember.family_id)
      .order('created_at', { ascending: true })

    if (childrenError) {
      throw childrenError
    }

    // Validate children data
    const validatedChildren = children.map(child => ChildSchema.parse(child))

    return NextResponse.json({ children: validatedChildren })
  } catch (error) {
    console.error('Error fetching children:', error)
    return NextResponse.json(
      { error: 'Failed to fetch children' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/children
 * Create a new child for the current user's family
 */
export async function POST(request: Request) {
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

    // Only parents and admins can add children
    if (familyMember.role !== 'parent' && familyMember.role !== 'admin') {
      return NextResponse.json({ error: 'Only parents can add children' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = CreateChildSchema.parse(body)

    // Create child
    const { data: child, error: createError } = await supabase
      .from('children')
      .insert({
        ...validatedData,
        family_id: familyMember.family_id,
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    // Validate created child
    const validatedChild = ChildSchema.parse(child)

    return NextResponse.json({ child: validatedChild }, { status: 201 })
  } catch (error) {
    console.error('Error creating child:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create child' },
      { status: 500 }
    )
  }
}
