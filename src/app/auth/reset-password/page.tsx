'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'

// Validation schema for reset request
const resetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ResetRequestFormData = z.infer<typeof resetRequestSchema>

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [step, setStep] = useState<'request' | 'confirm'>('request')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetRequestFormData>({
    resolver: zodResolver(resetRequestSchema),
  })

  const email = watch('email')

  const onSubmit = async (data: ResetRequestFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccessMessage(null)

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSuccessMessage('Reset email sent! Check your inbox for instructions.')
      setStep('confirm')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-700 to-cyan-800 px-4 relative overflow-hidden">
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
          <p className="text-xl text-blue-100">Reset Password</p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8"
          whileHover={{ scale: 1.01, y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Request Step */}
          {step === 'request' && (
            <>
              {/* Instructions */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Reset Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg transition-colors duration-200"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {isLoading ? 'Sending Email...' : 'Send Reset Link'}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="my-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">remember password?</span>
                </div>
              </div>

              {/* Links */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Link
                  href="/auth/login"
                  className="block w-full text-center py-3 px-4 border-2 border-indigo-600 hover:border-cyan-600 text-indigo-600 hover:text-cyan-600 font-bold rounded-xl transition-colors duration-200"
                >
                  Back to Login
                </Link>
              </motion.div>
            </>
          )}

          {/* Confirm Step */}
          {step === 'confirm' && (
            <>
              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm font-medium mb-2">{successMessage}</p>
                  <p className="text-green-700 text-xs">
                    Check your email inbox for a password reset link. The link will expire in 24 hours.
                  </p>
                </div>
              )}

              {/* Steps */}
              <div className="space-y-4">
                <motion.div
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600 text-sm font-semibold mr-4 flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email sent to {email}</p>
                    <p className="text-xs text-gray-500">Check your inbox and spam folder</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mr-4 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Click the reset link</p>
                    <p className="text-xs text-gray-500">Link expires in 24 hours</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mr-4 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Create a new password</p>
                    <p className="text-xs text-gray-500">Make it secure and memorable</p>
                  </div>
                </motion.div>
              </div>

              {/* Buttons */}
              <div className="mt-8 space-y-3">
                <motion.button
                  onClick={() => setStep('request')}
                  className="w-full py-3 px-4 border-2 border-indigo-600 hover:border-cyan-600 text-indigo-600 hover:text-cyan-600 font-bold rounded-xl transition-colors duration-200"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  Try Another Email
                </motion.button>

                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Link
                    href="/auth/login"
                    className="block w-full text-center py-3 px-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-bold rounded-xl transition-colors duration-200"
                  >
                    Back to Login
                  </Link>
                </motion.div>
              </div>

              {/* FAQ */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Not receiving the email?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure you entered the correct email</li>
                  <li>• Try requesting a new link if it expired</li>
                  <li>• Contact support if you continue having issues</li>
                </ul>
              </div>
            </>
          )}
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-blue-100">
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
