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

    // Get member details
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .select('family_id, role, email')
      .eq('id', params.id)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Verify user is admin of the family
    const { data: adminMembership } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', member.family_id)
      .eq('user_id', session.user.id)
      .single()

    if (!adminMembership || adminMembership.role !== 'admin') {
      return NextResponse.json({ error: 'Only family admins can remove members' }, { status: 403 })
    }

    // Check if this is the last admin
    if (member.role === 'admin') {
      const { data: adminCount } = await supabase
        .from('family_members')
        .select('id', { count: 'exact', head: true })
        .eq('family_id', member.family_id)
        .eq('role', 'admin')

      if (adminCount && adminCount.length === 1) {
        return NextResponse.json({
          error: 'Cannot remove the last admin. Please promote another member to admin first.'
        }, { status: 400 })
      }
    }

    // Delete member
    const { error: deleteError } = await supabase
      .from('family_members')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: `${member.email} has been removed from the family successfully`
    })

  } catch (error) {
    console.error('Delete member error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
