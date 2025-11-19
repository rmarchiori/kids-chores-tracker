'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { CastButton } from '@/components/cast/CastButton'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'

/**
 * Cast Settings Page
 *
 * Configuration and setup instructions for Chromecast functionality.
 * Allows users to:
 * - Test cast connection
 * - Configure auto-rotation settings
 * - View setup instructions
 * - Manage cast preferences
 */

export default function CastSettingsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [rotationInterval, setRotationInterval] = useState(10)
  const [showCompletedTasks, setShowCompletedTasks] = useState(true)
  const [autoStart, setAutoStart] = useState(false)

  const handleSaveSettings = () => {
    // TODO: Save settings to localStorage or user preferences
    localStorage.setItem('cast_settings', JSON.stringify({
      rotationInterval,
      showCompletedTasks,
      autoStart
    }))
    alert(t('cast.settingsSaved'))
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 py-8 px-4 relative overflow-hidden">
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
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              onClick={() => router.push('/settings')}
              className="flex items-center gap-2 text-white/90 hover:text-white mb-6 font-medium"
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              {t('cast.backToSettings')}
            </motion.button>
            <div className="text-center">
              <motion.div
                className="text-7xl mb-4"
                animate={{ rotate: [-5, 5] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              >
                📺
              </motion.div>
              <h1 className="text-5xl font-black text-white mb-3">{t('cast.title')}</h1>
              <p className="text-xl text-white/90">
                {t('cast.subtitle')}
              </p>
            </div>
          </motion.div>

          {/* Cast Connection Test */}
          <motion.div
            className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cast.connect.title')}</h2>
            <p className="text-gray-700 mb-6 font-medium">
              {t('cast.connect.description')}
            </p>
            <CastButton showStatus={true} />
          </motion.div>

          {/* Display Settings */}
          <motion.div
            className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('cast.displaySettings.title')}</h2>

            {/* Rotation Interval */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('cast.displaySettings.rotationInterval')}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={rotationInterval}
                  onChange={(e) => setRotationInterval(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-gray-700 font-medium w-20">
                  {rotationInterval} sec
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {t('cast.displaySettings.rotationDescription')}
              </p>
            </div>

            {/* Show Completed Tasks */}
            <div className="mb-6">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={showCompletedTasks}
                  onChange={(e) => setShowCompletedTasks(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    {t('cast.displaySettings.showAchievements')}
                  </span>
                  <p className="text-sm text-gray-500">
                    {t('cast.displaySettings.showAchievementsDescription')}
                  </p>
                </div>
              </label>
            </div>

            {/* Auto-start on Connect */}
            <div className="mb-6">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={(e) => setAutoStart(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    {t('cast.displaySettings.autoStart')}
                  </span>
                  <p className="text-sm text-gray-500">
                    {t('cast.displaySettings.autoStartDescription')}
                  </p>
                </div>
              </label>
            </div>

            <motion.button
              onClick={handleSaveSettings}
              className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {t('cast.displaySettings.saveSettings')}
            </motion.button>
          </motion.div>

          {/* Setup Instructions */}
          <motion.div
            className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('cast.setup.title')}</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t('cast.setup.prerequisites.title')}
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>{t('cast.setup.prerequisites.item1')}</li>
                  <li>{t('cast.setup.prerequisites.item2')}</li>
                  <li>{t('cast.setup.prerequisites.item3')}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t('cast.setup.firstTime.title')}
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>{t('cast.setup.firstTime.item1')}</li>
                  <li>{t('cast.setup.firstTime.item2')}</li>
                  <li>{t('cast.setup.firstTime.item3')}</li>
                  <li>{t('cast.setup.firstTime.item4')}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t('cast.setup.using.title')}
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>{t('cast.setup.using.item1', { interval: rotationInterval })}</li>
                  <li>{t('cast.setup.using.item2')}</li>
                  <li>{t('cast.setup.using.item3')}</li>
                  <li>{t('cast.setup.using.item4')}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t('cast.setup.troubleshooting.title')}
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li><strong>{t('cast.setup.troubleshooting.q1')}</strong> {t('cast.setup.troubleshooting.a1')}</li>
                  <li><strong>{t('cast.setup.troubleshooting.q2')}</strong> {t('cast.setup.troubleshooting.a2')}</li>
                  <li><strong>{t('cast.setup.troubleshooting.q3')}</strong> {t('cast.setup.troubleshooting.a3')}</li>
                  <li><strong>{t('cast.setup.troubleshooting.q4')}</strong> {t('cast.setup.troubleshooting.a4')}</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Features Overview */}
          <motion.div
            className="bg-gradient-to-br from-blue-400 to-cyan-400 rounded-3xl shadow-2xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              {t('cast.features.title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-white">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="font-bold mb-2 text-lg">{t('cast.features.autoRotation.title')}</h3>
                <p className="text-white/90">
                  {t('cast.features.autoRotation.description')}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="font-bold mb-2 text-lg">{t('cast.features.todayTasks.title')}</h3>
                <p className="text-white/90">
                  {t('cast.features.todayTasks.description')}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="font-bold mb-2 text-lg">{t('cast.features.achievements.title')}</h3>
                <p className="text-white/90">
                  {t('cast.features.achievements.description')}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h3 className="font-bold mb-2 text-lg">{t('cast.features.realtime.title')}</h3>
                <p className="text-white/90">
                  {t('cast.features.realtime.description')}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <h3 className="font-bold mb-2 text-lg">{t('cast.features.tvOptimized.title')}</h3>
                <p className="text-white/90">
                  {t('cast.features.tvOptimized.description')}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <h3 className="font-bold mb-2 text-lg">{t('cast.features.profileDisplay.title')}</h3>
                <p className="text-white/90">
                  {t('cast.features.profileDisplay.description')}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
