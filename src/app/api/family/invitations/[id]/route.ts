import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from('family_invitations')
      .select('family_id')
      .eq('id', params.id)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Verify user is admin of the family
    const { data: membership } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', invitation.family_id)
      .eq('user_id', session.user.id)
      .single()

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Only family admins can cancel invitations' }, { status: 403 })
    }

    // Delete invitation
    const { error: deleteError } = await supabase
      .from('family_invitations')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Invitation cancelled successfully' })

  } catch (error) {
    console.error('Delete invitation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
