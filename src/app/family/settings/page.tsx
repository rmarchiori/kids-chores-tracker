'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
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
import { motion } from 'framer-motion'
import { useTranslation } from '@/hooks/useTranslation'

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
  const { t } = useTranslation()

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
          setError(t('family.notPartOfFamily'))
          return
        }

        setFamilyId(membership.family_id)
        setCurrentUserRole(membership.role)

        // Only admins can access this page
        if (membership.role !== 'admin') {
          setError(t('family.onlyAdminsCanManage'))
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
        setError(t('family.userAlreadyMember'))
        return
      }

      // Check if there's already a pending invitation
      const existingInvitation = invitations.find(
        inv => inv.invited_email.toLowerCase() === data.email.toLowerCase() && inv.status === 'pending'
      )
      if (existingInvitation) {
        setError(t('family.pendingInvitationExists'))
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

      setSuccess(t('family.invitationSent', { email: data.email }))
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
    if (!confirm(t('family.confirmRemoveMember', { email: memberEmail }))) {
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

      setSuccess(t('family.memberRemoved', { email: memberEmail }))
      setMembers(members.filter(m => m.id !== memberId))

    } catch (err) {
      console.error('Failed to remove member:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove member')
    }
  }

  // Handle invitation cancellation
  const handleCancelInvitation = async (invitationId: string, email: string) => {
    if (!confirm(t('family.confirmCancelInvitation', { email }))) {
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

      setSuccess(t('family.invitationCancelled', { email }))
      setInvitations(invitations.filter(inv => inv.id !== invitationId))

    } catch (err) {
      console.error('Failed to cancel invitation:', err)
      setError(err instanceof Error ? err.message : 'Failed to cancel invitation')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-700">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white font-medium">{t('family.loadingSettings')}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (currentUserRole !== 'admin') {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-700 px-4 relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }} />
          </div>

          <motion.div
            className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-gray-900 mb-3">{t('family.accessDenied')}</h2>
            <p className="text-gray-700 mb-6 font-medium">
              {t('family.onlyAdminsCanManage')}
            </p>
            <motion.button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {t('family.backToHome')}
            </motion.button>
          </motion.div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-700 py-8 px-4 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: [-5, 5] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            >
              <UserGroupIcon className="w-20 h-20 mx-auto mb-4 text-white" />
            </motion.div>
            <h1 className="text-5xl font-black text-white mb-3">
              {t('family.settings')}
            </h1>
            <p className="text-xl text-white/90">
              {t('family.manageDescription')}
            </p>
          </motion.div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            className="mb-6 p-4 bg-green-500 rounded-xl shadow-lg flex items-start"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircleIcon className="w-6 h-6 text-white mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-white font-bold">{success}</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-500 rounded-xl shadow-lg flex items-start"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <XCircleIcon className="w-6 h-6 text-white mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-white font-bold">{error}</p>
          </motion.div>
        )}

        {/* Invite Member Section */}
        <motion.div
          className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ scale: 1.01, y: -2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <EnvelopeIcon className="w-7 h-7 mr-3 text-cyan-600" />
            {t('family.inviteMember')}
          </h2>

          <form onSubmit={handleSubmit(onSubmitInvitation)} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('family.email')}
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
                {t('family.role')}
              </label>
              <select
                {...register('role')}
                id="role"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              >
                <option value="">{t('family.selectRole')}</option>
                <option value="parent">{t('family.parent')}</option>
                <option value="teen">{t('family.teen')}</option>
              </select>
              {errors.role && (
                <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                {t('family.roleDescription')}
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg flex items-center justify-center"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t('family.sendingInvitation')}
                </>
              ) : (
                <>
                  <EnvelopeIcon className="w-5 h-5 mr-2" />
                  {t('family.sendInvitation')}
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Current Members Section */}
        <motion.div
          className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.01, y: -2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <UserGroupIcon className="w-7 h-7 mr-3 text-cyan-600" />
            {`${t('family.members')} (${members.length})`}
          </h2>

          {members.length === 0 ? (
            <p className="text-gray-600 text-center py-8 font-medium">{t('family.noMembersFound')}</p>
          ) : (
            <div className="space-y-4">
              {members.map((member, index) => {
                const isOnlyAdmin = member.role === 'admin' && members.filter(m => m.role === 'admin').length === 1

                return (
                  <motion.div
                    key={member.id}
                    className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-cyan-50 border border-cyan-200 rounded-2xl hover:shadow-lg transition-all"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 5 }}
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
                      <motion.button
                        onClick={() => handleRemoveMember(member.id, member.email)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Remove member"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </motion.button>
                    )}

                    {isOnlyAdmin && (
                      <div className="ml-4 px-3 py-1 bg-purple-100 rounded-lg text-xs text-purple-700 font-bold">
                        {t('family.lastAdmin')}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Pending Invitations Section */}
        {invitations.length > 0 && (
          <motion.div
            className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <ClockIcon className="w-7 h-7 mr-3 text-yellow-600" />
              {`${t('family.invitations')} (${invitations.length})`}
            </h2>

            <div className="space-y-4">
              {invitations.map((invitation, index) => (
                <motion.div
                  key={invitation.id}
                  className="flex items-center justify-between p-5 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-2xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-gray-900 truncate">
                      {invitation.invited_email}
                    </p>
                    <p className="text-sm text-gray-700 font-medium">
                      {`${t('family.role')}:`} {invitation.invited_role} •
                      {` ${t('family.expiresAt')}:`} {new Date(invitation.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <motion.button
                    onClick={() => handleCancelInvitation(invitation.id, invitation.invited_email)}
                    className="ml-4 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {t('family.cancel')}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        </div>
      </div>
    </DashboardLayout>
  )
}
