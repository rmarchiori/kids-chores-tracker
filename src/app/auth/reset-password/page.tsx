'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Kids Chores Tracker
          </h1>
          <p className="text-lg text-gray-600">Reset Password</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
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
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  {isLoading ? 'Sending Email...' : 'Send Reset Link'}
                </button>
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
              <Link
                href="/auth/login"
                className="block w-full text-center py-3 px-4 border border-gray-300 hover:border-blue-600 text-blue-600 font-medium rounded-lg transition-colors duration-200"
              >
                Back to Login
              </Link>
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
                <div className="flex items-start">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600 text-sm font-semibold mr-4 flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email sent to {email}</p>
                    <p className="text-xs text-gray-500">Check your inbox and spam folder</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mr-4 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Click the reset link</p>
                    <p className="text-xs text-gray-500">Link expires in 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mr-4 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Create a new password</p>
                    <p className="text-xs text-gray-500">Make it secure and memorable</p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => setStep('request')}
                  className="w-full py-3 px-4 border border-gray-300 hover:border-blue-600 text-blue-600 font-medium rounded-lg transition-colors duration-200"
                >
                  Try Another Email
                </button>

                <Link
                  href="/auth/login"
                  className="block w-full text-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Back to Login
                </Link>
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
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
