import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const languageSchema = z.object({
  language: z.enum(['en-CA', 'pt-BR', 'fr-CA'], {
    required_error: 'Invalid language code',
  }),
})

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const { language } = languageSchema.parse(body)

    // Update all family_members records for this user
    const { error: updateError } = await supabase
      .from('family_members')
      .update({ language_preference: language })
      .eq('user_id', session.user.id)

    if (updateError) {
      console.error('Failed to update language preference:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Language preference updated successfully',
      language,
    })
  } catch (error) {
    console.error('Language preference update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(_request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's language preference from any family membership
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .select('language_preference')
      .eq('user_id', session.user.id)
      .limit(1)
      .single()

    if (memberError || !member) {
      // Default to English if no preference found
      return NextResponse.json({ language: 'en-CA' })
    }

    return NextResponse.json({ language: member.language_preference })
  } catch (error) {
    console.error('Language preference fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
