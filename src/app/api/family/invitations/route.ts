import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const invitationSchema = z.object({
  family_id: z.string().uuid(),
  invited_email: z.string().email(),
  invited_role: z.enum(['parent', 'teen']),
})

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const { family_id, invited_email, invited_role } = invitationSchema.parse(body)

    // Verify user is admin of this family
    const { data: membership, error: membershipError } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', family_id)
      .eq('user_id', session.user.id)
      .single()

    if (membershipError || !membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Only family admins can send invitations' }, { status: 403 })
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('family_members')
      .select('id')
      .eq('family_id', family_id)
      .eq('email', invited_email.toLowerCase())
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'This user is already a member of your family' }, { status: 400 })
    }

    // Check for existing pending invitation
    const { data: existingInvitation } = await supabase
      .from('family_invitations')
      .select('id')
      .eq('family_id', family_id)
      .eq('invited_email', invited_email.toLowerCase())
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json({ error: 'There is already a pending invitation for this email' }, { status: 400 })
    }

    // Create invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('family_invitations')
      .insert({
        family_id,
        invited_email: invited_email.toLowerCase(),
        invited_role,
        invited_by: session.user.id,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single()

    if (invitationError) {
      console.error('Failed to create invitation:', invitationError)
      return NextResponse.json({ error: invitationError.message }, { status: 500 })
    }

    // Get family name for email
    const { data: family } = await supabase
      .from('families')
      .select('name')
      .eq('id', family_id)
      .single()

    // Send invitation email
    try {
      const invitationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/invite/accept/${invitation.token}`

      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: invited_email,
          subject: `You're invited to join ${family?.name || 'a family'} on Kids Chores Tracker`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2563eb;">Family Invitation</h1>
              <p>Hi there!</p>
              <p>You've been invited to join <strong>${family?.name || 'a family'}</strong> on Kids Chores Tracker as a <strong>${invited_role}</strong>.</p>
              <p>Click the button below to accept the invitation:</p>
              <a href="${invitationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                Accept Invitation
              </a>
              <p style="color: #6b7280; font-size: 14px;">This invitation will expire in 7 days.</p>
              <p style="color: #6b7280; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          `,
        }),
      })
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
      // Don't fail the request if email fails - the invitation is still created
    }

    return NextResponse.json({
      invitation,
      message: 'Invitation sent successfully'
    })

  } catch (error) {
    console.error('Invitation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get invitations for current user's families
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's families where they are admin
    const { data: memberships } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')

    if (!memberships || memberships.length === 0) {
      return NextResponse.json([])
    }

    const familyIds = memberships.map(m => m.family_id)

    // Get pending invitations for these families
    const { data: invitations, error } = await supabase
      .from('family_invitations')
      .select('*')
      .in('family_id', familyIds)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(invitations || [])

  } catch (error) {
    console.error('Get invitations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
