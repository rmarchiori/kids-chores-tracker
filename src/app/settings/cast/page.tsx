'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { CastButton } from '@/components/cast/CastButton'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

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
    alert('Settings saved successfully!')
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
              Back to Settings
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Chromecast Settings</h1>
            <p className="text-gray-600 mt-2">
              Configure your Chromecast TV dashboard display
            </p>
          </div>

          {/* Cast Connection Test */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Connect to Chromecast</h2>
            <p className="text-gray-600 mb-4">
              Click the button below to cast your family dashboard to a TV.
            </p>
            <CastButton showStatus={true} />
          </div>

          {/* Display Settings */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Display Settings</h2>

            {/* Rotation Interval */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Child Rotation Interval
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
                How long to display each child's dashboard before rotating
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
                    Show Today's Achievements
                  </span>
                  <p className="text-sm text-gray-500">
                    Display completed tasks from today on the TV dashboard
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
                    Auto-start on Connect
                  </span>
                  <p className="text-sm text-gray-500">
                    Automatically begin rotation when connecting to Chromecast
                  </p>
                </div>
              </label>
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Save Settings
            </button>
          </div>

          {/* Setup Instructions */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  1. Prerequisites
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>A Chromecast device connected to your TV</li>
                  <li>TV and computer/phone on the same WiFi network</li>
                  <li>Google Chrome browser (recommended)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  2. First Time Setup
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Ensure your Chromecast is set up and connected to WiFi</li>
                  <li>Open this page in Google Chrome</li>
                  <li>Click the "Cast" button above</li>
                  <li>Select your Chromecast device from the list</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  3. Using the TV Dashboard
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>The dashboard will automatically rotate between children every {rotationInterval} seconds</li>
                  <li>Each child's screen shows their pending tasks and today's achievements</li>
                  <li>Updates happen in real-time when tasks are completed</li>
                  <li>Click "Cast" again to disconnect</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  4. Troubleshooting
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li><strong>Can't see Cast button?</strong> Make sure you're using Google Chrome browser</li>
                  <li><strong>No devices found?</strong> Ensure your Chromecast and computer are on the same WiFi network</li>
                  <li><strong>Connection fails?</strong> Try restarting your Chromecast device</li>
                  <li><strong>Display issues?</strong> Check your TV's HDMI input and Chromecast connection</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Features Overview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              📺 TV Dashboard Features
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-blue-800">
              <div>
                <h3 className="font-semibold mb-1">✨ Auto-Rotation</h3>
                <p className="text-sm">
                  Cycles through each child's dashboard automatically
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">📋 Today's Tasks</h3>
                <p className="text-sm">
                  Shows all pending tasks with images and point values
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">🎯 Achievements</h3>
                <p className="text-sm">
                  Displays completed tasks with ratings and timestamps
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">🔄 Real-time Updates</h3>
                <p className="text-sm">
                  Automatically refreshes when tasks are completed
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">🎨 TV-Optimized</h3>
                <p className="text-sm">
                  Large text and high contrast for easy viewing from distance
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">👤 Profile Display</h3>
                <p className="text-sm">
                  Shows each child's name, photo, and age group
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
