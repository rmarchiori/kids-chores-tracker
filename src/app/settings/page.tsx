'use client'

import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { useTranslation } from '@/hooks/useTranslation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const { t } = useTranslation()

  const settingsOptions = [
    {
      icon: '📺',
      title: t('settings.cast.title'),
      description: t('settings.cast.description'),
      href: '/settings/cast',
      gradient: 'from-indigo-400 to-blue-400',
    },
    {
      icon: '👨‍👩‍👧‍👦',
      title: t('settings.family.title'),
      description: t('settings.family.description'),
      href: '/family/settings',
      gradient: 'from-blue-400 to-cyan-400',
    },
  ]

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 px-4 py-8 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [-5, 5] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            >
              ⚙️
            </motion.div>
            <h1 className="text-5xl font-black text-white mb-4">{t('settings.title')}</h1>
            <p className="text-xl text-white/90">Configure your experience</p>
          </motion.div>

          {/* Settings Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {settingsOptions.map((option, index) => (
              <motion.div
                key={option.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={option.href}>
                  <motion.div
                    className={`bg-gradient-to-br ${option.gradient} rounded-3xl shadow-2xl p-8 text-white cursor-pointer`}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <motion.div
                      className="text-6xl mb-6"
                      animate={{ rotate: [-5, 5] }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: index * 0.2 }}
                    >
                      {option.icon}
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-3">
                      {option.title}
                    </h2>
                    <p className="text-white/90 text-base mb-4">{option.description}</p>
                    <div className="flex items-center text-white/90 font-medium">
                      <span className="mr-2">Configure</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
