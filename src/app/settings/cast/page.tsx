'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { CastButton } from '@/components/cast/CastButton'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/settings')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              {t('cast.backToSettings')}
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{t('cast.title')}</h1>
            <p className="text-gray-600 mt-2">
              {t('cast.subtitle')}
            </p>
          </div>

          {/* Cast Connection Test */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{t('cast.connect.title')}</h2>
            <p className="text-gray-600 mb-4">
              {t('cast.connect.description')}
            </p>
            <CastButton showStatus={true} />
          </div>

          {/* Display Settings */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{t('cast.displaySettings.title')}</h2>

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

            <button
              onClick={handleSaveSettings}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {t('cast.displaySettings.saveSettings')}
            </button>
          </div>

          {/* Setup Instructions */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{t('cast.setup.title')}</h2>

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
          </div>

          {/* Features Overview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              {t('cast.features.title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-blue-800">
              <div>
                <h3 className="font-semibold mb-1">{t('cast.features.autoRotation.title')}</h3>
                <p className="text-sm">
                  {t('cast.features.autoRotation.description')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('cast.features.todayTasks.title')}</h3>
                <p className="text-sm">
                  {t('cast.features.todayTasks.description')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('cast.features.achievements.title')}</h3>
                <p className="text-sm">
                  {t('cast.features.achievements.description')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('cast.features.realtime.title')}</h3>
                <p className="text-sm">
                  {t('cast.features.realtime.description')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('cast.features.tvOptimized.title')}</h3>
                <p className="text-sm">
                  {t('cast.features.tvOptimized.description')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('cast.features.profileDisplay.title')}</h3>
                <p className="text-sm">
                  {t('cast.features.profileDisplay.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
