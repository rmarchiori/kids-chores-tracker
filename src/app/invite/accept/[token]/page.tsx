'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface InvitationDetails {
  id: string
  family_id: string
  invited_email: string
  invited_role: string
  status: string
  expires_at: string
  family_name: string
}

export default function AcceptInvitationPage() {
  const router = useRouter()
  const params = useParams()
  const token = params?.token as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Check authentication and load invitation
  useEffect(() => {
    async function checkAuthAndLoadInvitation() {
      try {
        setLoading(true)

        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
        setUserEmail(session?.user?.email || null)

        // Fetch invitation details
        const { data: invitationData, error: invitationError } = await supabase
          .from('family_invitations')
          .select(`
            id,
            family_id,
            invited_email,
            invited_role,
            status,
            expires_at,
            families:family_id (name)
          `)
          .eq('token', token)
          .single()

        if (invitationError || !invitationData) {
          setError('Invitation not found or invalid')
          return
        }

        // Check if invitation is expired
        if (new Date(invitationData.expires_at) < new Date()) {
          setError('This invitation has expired')
          return
        }

        // Check if invitation is already used
        if (invitationData.status !== 'pending') {
          setError(`This invitation has already been ${invitationData.status}`)
          return
        }

        // Type assertion to handle Supabase nested query
        const familyData = invitationData.families as any

        setInvitation({
          ...invitationData,
          family_name: familyData?.name || 'Unknown Family'
        })

      } catch (err) {
        console.error('Failed to load invitation:', err)
        setError(err instanceof Error ? err.message : 'Failed to load invitation')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      checkAuthAndLoadInvitation()
    }
  }, [token, supabase])

  const handleAcceptInvitation = async () => {
    if (!invitation || !isAuthenticated) return

    try {
      setAccepting(true)
      setError(null)

      // Check if user email matches invitation
      if (userEmail?.toLowerCase() !== invitation.invited_email.toLowerCase()) {
        setError(`This invitation was sent to ${invitation.invited_email}. Please log in with that email address.`)
        return
      }

      // Accept invitation via API
      const response = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to accept invitation')
      }

      // Redirect to dashboard
      router.push('/dashboard')

    } catch (err) {
      console.error('Failed to accept invitation:', err)
      setError(err instanceof Error ? err.message : 'Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  const handleRejectInvitation = async () => {
    if (!invitation) return

    if (!confirm('Are you sure you want to decline this invitation?')) {
      return
    }

    try {
      setError(null)

      const response = await fetch('/api/invite/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to decline invitation')
      }

      // Show success and redirect to login
      alert('Invitation declined successfully')
      router.push('/auth/login')

    } catch (err) {
      console.error('Failed to decline invitation:', err)
      setError(err instanceof Error ? err.message : 'Failed to decline invitation')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <UserGroupIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Family Invitation
          </h1>
          <p className="text-gray-600">
            You've been invited to join a family on Kids Chores Tracker
          </p>
        </div>

        {/* Invitation Details */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <UserGroupIcon className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Family</p>
                <p className="text-lg font-semibold text-gray-900">{invitation.family_name}</p>
              </div>
            </div>

            <div className="flex items-start">
              <EnvelopeIcon className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Invited Email</p>
                <p className="text-lg font-semibold text-gray-900">{invitation.invited_email}</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircleIcon className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Role</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{invitation.invited_role}</p>
              </div>
            </div>

            <div className="flex items-start">
              <ClockIcon className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Expires</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(invitation.expires_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Role Description */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>As a {invitation.invited_role}:</strong>{' '}
            {invitation.invited_role === 'parent'
              ? 'You will be able to manage children, create and assign tasks, and review task completions.'
              : 'You will be able to view family tasks and help manage your siblings\' chores.'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <XCircleIcon className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Authentication Required */}
        {!isAuthenticated ? (
          <div className="space-y-3">
            <p className="text-center text-gray-600 mb-4">
              Please log in or create an account to accept this invitation
            </p>
            <button
              onClick={() => router.push(`/auth/login?redirect=/invite/accept/${token}`)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => router.push(`/auth/register?redirect=/invite/accept/${token}`)}
              className="w-full py-3 px-4 border border-gray-300 hover:border-blue-600 text-blue-600 font-medium rounded-lg transition-colors"
            >
              Create Account
            </button>
          </div>
        ) : (
          /* Action Buttons */
          <div className="space-y-3">
            <button
              onClick={handleAcceptInvitation}
              disabled={accepting}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {accepting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Accept Invitation
                </>
              )}
            </button>

            <button
              onClick={handleRejectInvitation}
              disabled={accepting}
              className="w-full py-3 px-4 border border-gray-300 hover:border-red-600 text-red-600 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Decline Invitation
            </button>
          </div>
        )}

        {/* Logged in as info */}
        {isAuthenticated && userEmail && (
          <p className="mt-4 text-center text-sm text-gray-500">
            Logged in as: {userEmail}
            {userEmail.toLowerCase() !== invitation.invited_email.toLowerCase() && (
              <span className="block text-red-600 mt-1">
                ⚠️ Email mismatch - please log in with {invitation.invited_email}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
