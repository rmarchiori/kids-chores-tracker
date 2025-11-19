'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'

// Validation schema for new password
const newPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type NewPasswordFormData = z.infer<typeof newPasswordSchema>

function ResetPasswordConfirmForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
  })

  // Verify the reset token on page load
  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Debug the full URL
        console.log('Debug - Full URL:', window.location.href)
        console.log('Debug - window.location.search:', window.location.search)
        console.log('Debug - window.location.hash:', window.location.hash)

        // Get the code from URL manually
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')

        console.log('Debug - Reset code from URL:', code)

        // Also try to get from hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const hashCode = hashParams.get('code')
        console.log('Debug - Reset code from hash:', hashCode)

        if (!code) {
          setError('Invalid reset link - no code found. Please request a new password reset.')
          setIsValidToken(false)
          return
        }

        // Exchange the code for a session using verifyOtp
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: code,
          type: 'recovery',
        })

        console.log('Debug - verifyOtp data:', data)
        console.log('Debug - verifyOtp error:', verifyError)

        if (verifyError) {
          setError(`This reset link has expired or is invalid. Please request a new one. (${verifyError.message})`)
          setIsValidToken(false)
          return
        }

        if (!data.session) {
          setError('Could not create session from reset link. Please try requesting a new link.')
          setIsValidToken(false)
          return
        }

        // We have a valid session! User can now reset password
        console.log('Debug - Valid session created, allowing password reset')
        setIsValidToken(true)

      } catch (err) {
        console.error('Debug - Error in verifyToken:', err)
        setError(`Failed to verify reset link: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setIsValidToken(false)
      }
    }

    verifyToken()
  }, [searchParams, supabase.auth])

  const onSubmit = async (data: NewPasswordFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccessMessage(null)

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccessMessage('Password updated successfully! Redirecting to login...')

      // Sign out and redirect to login
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-teal-700 to-cyan-800 px-4 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
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
          <h1 className="text-5xl font-black text-white mb-2">
            Kids Chores Tracker
          </h1>
          <p className="text-xl text-teal-100">Create New Password</p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8"
          whileHover={{ scale: 1.01, y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Loading State */}
          {isValidToken === null && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying reset link...</p>
            </div>
          )}

          {/* Invalid Token */}
          {isValidToken === false && (
            <>
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/auth/reset-password"
                  className="block w-full text-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Request New Reset Link
                </Link>

                <Link
                  href="/auth/login"
                  className="block w-full text-center py-3 px-4 border border-gray-300 hover:border-blue-600 text-blue-600 font-medium rounded-lg transition-colors duration-200"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}

          {/* Valid Token - Show Password Form */}
          {isValidToken === true && (
            <>
              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm font-medium">{successMessage}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Instructions */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  Choose a strong password with at least 8 characters.
                </p>
              </div>

              {/* New Password Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* New Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    {...register('password')}
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    id="confirmPassword"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg transition-colors duration-200"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {isLoading ? 'Updating Password...' : 'Update Password'}
                </motion.button>
              </form>

              {/* Password Requirements */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Password Requirements:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• At least 8 characters long</li>
                  <li>• Both passwords must match</li>
                  <li>• Use a unique password you haven't used before</li>
                </ul>
              </div>
            </>
          )}
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-teal-100">
            Need help?{' '}
            <a href="mailto:support@example.com" className="text-white hover:underline font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-teal-700 to-cyan-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordConfirmForm />
    </Suspense>
  )
}
