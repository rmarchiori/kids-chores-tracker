'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

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
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-cyan-600 relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }} />
          </div>
          <motion.div
            className="text-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-white text-xl font-bold">Loading invitation...</p>
          </motion.div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-rose-600 px-4 relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }} />
          </div>
          <motion.div
            className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-center relative z-10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 font-medium mb-6">{error}</p>
            <motion.button
              onClick={() => router.push('/auth/login')}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-colors"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              Go to Login
            </motion.button>
          </motion.div>
        </div>
      </DashboardLayout>
    )
  }

  if (!invitation) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-cyan-600 px-4 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />
        </div>
        <motion.div
          className="max-w-2xl w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <UserGroupIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Family Invitation
          </h1>
          <p className="text-gray-600 font-medium">
            You've been invited to join a family on Kids Chores Tracker
          </p>
        </motion.div>

        {/* Invitation Details */}
        <motion.div
          className="bg-gradient-to-br from-green-50 to-cyan-50 border-2 border-green-200 rounded-2xl p-6 mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="space-y-4">
            <motion.div
              className="flex items-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <UserGroupIcon className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
              </motion.div>
              <div>
                <p className="text-sm font-bold text-gray-700">Family</p>
                <p className="text-lg font-black text-gray-900">{invitation.family_name}</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <EnvelopeIcon className="w-6 h-6 text-cyan-600 mt-1 mr-3 flex-shrink-0" />
              </motion.div>
              <div>
                <p className="text-sm font-bold text-gray-700">Invited Email</p>
                <p className="text-lg font-black text-gray-900">{invitation.invited_email}</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <CheckCircleIcon className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
              </motion.div>
              <div>
                <p className="text-sm font-bold text-gray-700">Role</p>
                <p className="text-lg font-black text-gray-900 capitalize">{invitation.invited_role}</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              >
                <ClockIcon className="w-6 h-6 text-cyan-600 mt-1 mr-3 flex-shrink-0" />
              </motion.div>
              <div>
                <p className="text-sm font-bold text-gray-700">Expires</p>
                <p className="text-lg font-black text-gray-900">
                  {new Date(invitation.expires_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Role Description */}
        <motion.div
          className="bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 rounded-2xl p-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm text-gray-700 font-medium">
            <strong className="font-black">As a {invitation.invited_role}:</strong>{' '}
            {invitation.invited_role === 'parent'
              ? 'You will be able to manage children, create and assign tasks, and review task completions.'
              : 'You will be able to view family tasks and help manage your siblings\' chores.'}
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <XCircleIcon className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-red-800 text-sm font-bold">{error}</p>
          </motion.div>
        )}

        {/* Authentication Required */}
        {!isAuthenticated ? (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-center text-gray-600 font-medium mb-4">
              Please log in or create an account to accept this invitation
            </p>
            <motion.button
              onClick={() => router.push(`/auth/login?redirect=/invite/accept/${token}`)}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg transition-colors"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              Log In
            </motion.button>
            <motion.button
              onClick={() => router.push(`/auth/register?redirect=/invite/accept/${token}`)}
              className="w-full py-3 px-4 border-2 border-green-600 hover:border-cyan-600 text-green-600 hover:text-cyan-600 font-bold rounded-xl transition-colors"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              Create Account
            </motion.button>
          </motion.div>
        ) : (
          /* Action Buttons */
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <motion.button
              onClick={handleAcceptInvitation}
              disabled={accepting}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg transition-colors duration-200 flex items-center justify-center"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {accepting ? (
                <>
                  <motion.div
                    className="rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Accept Invitation
                </>
              )}
            </motion.button>

            <motion.button
              onClick={handleRejectInvitation}
              disabled={accepting}
              className="w-full py-3 px-4 border-2 border-gray-300 hover:border-red-600 text-red-600 font-bold rounded-xl transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              Decline Invitation
            </motion.button>
          </motion.div>
        )}

        {/* Logged in as info */}
        {isAuthenticated && userEmail && (
          <motion.p
            className="mt-4 text-center text-sm text-gray-500 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            Logged in as: <span className="font-bold">{userEmail}</span>
            {userEmail.toLowerCase() !== invitation.invited_email.toLowerCase() && (
              <motion.span
                className="block text-red-600 mt-1 font-bold"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                ⚠️ Email mismatch - please log in with {invitation.invited_email}
              </motion.span>
            )}
          </motion.p>
        )}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
