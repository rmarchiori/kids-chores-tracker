import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const acceptInvitationSchema = z.object({
  token: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - please log in first' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const { token } = acceptInvitationSchema.parse(body)

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

    // Verify email matches
    if (session.user.email?.toLowerCase() !== invitation.invited_email.toLowerCase()) {
      return NextResponse.json({
        error: `This invitation was sent to ${invitation.invited_email}. Please log in with that email address.`
      }, { status: 403 })
    }

    // Check if user is already a member of this family
    const { data: existingMember } = await supabase
      .from('family_members')
      .select('id')
      .eq('family_id', invitation.family_id)
      .eq('user_id', session.user.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'You are already a member of this family' }, { status: 400 })
    }

    // Add user to family
    const { data: newMember, error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: invitation.family_id,
        user_id: session.user.id,
        role: invitation.invited_role,
        display_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        email: session.user.email || invitation.invited_email,
      })
      .select()
      .single()

    if (memberError) {
      console.error('Failed to add family member:', memberError)
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('family_invitations')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Failed to update invitation status:', updateError)
      // Don't fail the request - member was added successfully
    }

    return NextResponse.json({
      message: 'Invitation accepted successfully',
      member: newMember
    })

  } catch (error) {
    console.error('Accept invitation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
