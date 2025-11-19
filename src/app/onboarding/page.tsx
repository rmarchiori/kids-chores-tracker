'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'

// Validation schema for family creation
const onboardingSchema = z.object({
  familyName: z.string().min(2, 'Family name must be at least 2 characters'),
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  })

  // Check if user is authenticated and doesn't already have a family
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Check if user already has a family
      const { data: familyMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (familyMember) {
        // User already has a family, redirect to dashboard
        router.push('/dashboard')
      }
    }

    checkAuth()
  }, [router, supabase])

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      // Step 1: Create family
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert([
          {
            name: data.familyName,
          },
        ])
        .select('id')
        .single()

      if (familyError) {
        setError('Failed to create family: ' + familyError.message)
        return
      }

      // Step 2: Create family member record (user as admin)
      const { error: memberError } = await supabase.from('family_members').insert([
        {
          family_id: familyData.id,
          user_id: user.id,
          role: 'admin',
          display_name: user.user_metadata.name || user.email?.split('@')[0] || 'User',
          email: user.email!,
        },
      ])

      if (memberError) {
        setError('Failed to create member profile: ' + memberError.message)
        return
      }

      // Success! Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600 px-4 py-8 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h1
            className="text-5xl font-black text-white mb-2"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          >
            Welcome, {user.user_metadata.name}!
          </motion.h1>
          <p className="text-xl text-white/90">Let's create your family</p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8"
          whileHover={{ scale: 1.01, y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              You'll be the <span className="font-semibold">admin</span> of this family. You can
              invite other parents later from your dashboard.
            </p>
          </div>

          {/* Onboarding Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Family Name Field */}
            <div>
              <label
                htmlFor="familyName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Family Name
              </label>
              <input
                {...register('familyName')}
                type="text"
                id="familyName"
                placeholder="Smith Family"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
                autoFocus
              />
              {errors.familyName && (
                <p className="mt-2 text-sm text-red-600">{errors.familyName.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This is what your family will be called in the app
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg transition-colors duration-200"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {isLoading ? 'Creating Family...' : 'Create Family'}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white/90">
            You can change your family name later in settings
          </p>
        </div>
      </motion.div>
    </div>
  )
}
