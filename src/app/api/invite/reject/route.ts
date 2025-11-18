import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const rejectInvitationSchema = z.object({
  token: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Parse and validate request body
    const body = await request.json()
    const { token } = rejectInvitationSchema.parse(body)

    // Get invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from('family_invitations')
      .select('*')
      .eq('token', token)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 })
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: `This invitation has already been ${invitation.status}` }, { status: 400 })
    }

    // Update invitation status to rejected
    const { error: updateError } = await supabase
      .from('family_invitations')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Failed to update invitation status:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Invitation declined successfully'
    })

  } catch (error) {
    console.error('Reject invitation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
