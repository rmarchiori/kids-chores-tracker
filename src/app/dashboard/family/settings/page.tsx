'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  UserGroupIcon,
  EnvelopeIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline'

// Validation schema for invitation
const invitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['parent', 'teen'], {
    required_error: 'Please select a role'
  }),
})

type InvitationFormData = z.infer<typeof invitationSchema>

interface FamilyMember {
  id: string
  display_name: string
  email: string
  role: 'admin' | 'parent' | 'teen'
  created_at: string
}

interface Invitation {
  id: string
  invited_email: string
  invited_role: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  expires_at: string
  created_at: string
}

export default function FamilySettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
  })

  // Fetch family data
  useEffect(() => {
    async function loadFamilyData() {
      try {
        setLoading(true)

        // Get current user's family membership
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/auth/login')
          return
        }

        // Get user's family membership (first family for now)
        const { data: membership, error: membershipError } = await supabase
          .from('family_members')
          .select('family_id, role')
          .eq('user_id', session.user.id)
          .single()

        if (membershipError || !membership) {
          setError('You are not part of any family')
          return
        }

        setFamilyId(membership.family_id)
        setCurrentUserRole(membership.role)

        // Only admins can access this page
        if (membership.role !== 'admin') {
          setError('Only family admins can manage family settings')
          return
        }

        // Load family members
        const { data: membersData, error: membersError } = await supabase
          .from('family_members')
          .select('*')
          .eq('family_id', membership.family_id)
          .order('role', { ascending: true })
          .order('display_name', { ascending: true })

        if (membersError) throw membersError
        setMembers(membersData || [])

        // Load pending invitations
        const { data: invitationsData, error: invitationsError } = await supabase
          .from('family_invitations')
          .select('*')
          .eq('family_id', membership.family_id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })

        if (invitationsError) throw invitationsError
        setInvitations(invitationsData || [])

      } catch (err) {
        console.error('Failed to load family data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load family data')
      } finally {
        setLoading(false)
      }
    }

    loadFamilyData()
  }, [supabase, router])

  // Handle invitation submission
  const onSubmitInvitation = async (data: InvitationFormData) => {
    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)

      // Check if user is already a member
      const existingMember = members.find(m => m.email.toLowerCase() === data.email.toLowerCase())
      if (existingMember) {
        setError('This user is already a member of your family')
        return
      }

      // Check if there's already a pending invitation
      const existingInvitation = invitations.find(
        inv => inv.invited_email.toLowerCase() === data.email.toLowerCase() && inv.status === 'pending'
      )
      if (existingInvitation) {
        setError('There is already a pending invitation for this email')
        return
      }

      // Send invitation via API
      const response = await fetch('/api/family/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          family_id: familyId,
          invited_email: data.email,
          invited_role: data.role,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send invitation')
      }

      setSuccess(`Invitation sent to ${data.email}!`)
      setInvitations([result.invitation, ...invitations])
      reset()

    } catch (err) {
      console.error('Failed to send invitation:', err)
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle member removal
  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${memberEmail} from your family?`)) {
      return
    }

    try {
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/family/members/${memberId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove member')
      }

      setSuccess(`${memberEmail} has been removed from your family`)
      setMembers(members.filter(m => m.id !== memberId))

    } catch (err) {
      console.error('Failed to remove member:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove member')
    }
  }

  // Handle invitation cancellation
  const handleCancelInvitation = async (invitationId: string, email: string) => {
    if (!confirm(`Cancel invitation for ${email}?`)) {
      return
    }

    try {
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/family/invitations/${invitationId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel invitation')
      }

      setSuccess(`Invitation for ${email} has been cancelled`)
      setInvitations(invitations.filter(inv => inv.id !== invitationId))

    } catch (err) {
      console.error('Failed to cancel invitation:', err)
      setError(err instanceof Error ? err.message : 'Failed to cancel invitation')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (currentUserRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Only family admins can manage family settings.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserGroupIcon className="w-8 h-8 mr-3 text-blue-600" />
            Family Settings
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your family members and invite others to join
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-green-800 text-sm font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <XCircleIcon className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Invite Member Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <EnvelopeIcon className="w-6 h-6 mr-2 text-blue-600" />
            Invite Family Member
          </h2>

          <form onSubmit={handleSubmit(onSubmitInvitation)} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="family@example.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                {...register('role')}
                id="role"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              >
                <option value="">Select a role...</option>
                <option value="parent">Parent</option>
                <option value="teen">Teen</option>
              </select>
              {errors.role && (
                <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                <strong>Parent:</strong> Can manage children and tasks.
                <br />
                <strong>Teen:</strong> Can view tasks and help manage siblings.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending Invitation...
                </>
              ) : (
                <>
                  <EnvelopeIcon className="w-5 h-5 mr-2" />
                  Send Invitation
                </>
              )}
            </button>
          </form>
        </div>

        {/* Current Members Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <UserGroupIcon className="w-6 h-6 mr-2 text-blue-600" />
            Family Members ({members.length})
          </h2>

          {members.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No family members found</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const isOnlyAdmin = member.role === 'admin' && members.filter(m => m.role === 'admin').length === 1

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center flex-1">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0
                        ${member.role === 'admin' ? 'bg-purple-100' : member.role === 'parent' ? 'bg-blue-100' : 'bg-green-100'}
                      `}>
                        {member.role === 'admin' ? (
                          <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
                        ) : (
                          <UserIcon className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.display_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                      </div>
                      <span className={`
                        ml-3 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0
                        ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          member.role === 'parent' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'}
                      `}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    </div>

                    {!isOnlyAdmin && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.email)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}

                    {isOnlyAdmin && (
                      <div className="ml-4 px-3 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                        Last Admin
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pending Invitations Section */}
        {invitations.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="w-6 h-6 mr-2 text-yellow-600" />
              Pending Invitations ({invitations.length})
            </h2>

            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {invitation.invited_email}
                    </p>
                    <p className="text-xs text-gray-600">
                      Role: {invitation.invited_role} •
                      Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancelInvitation(invitation.id, invitation.invited_email)}
                    className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
