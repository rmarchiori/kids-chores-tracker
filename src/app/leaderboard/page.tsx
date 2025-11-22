'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { useTranslation } from '@/hooks/useTranslation'
import { motion } from 'framer-motion'

interface LeaderboardEntry {
  child_id: string
  name: string
  points: number
  current_streak: number
  completion_count: number
  avg_rating: number
  rank: number
}

export default function LeaderboardPage() {
  const { t } = useTranslation()
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [timeframe])

  async function loadLeaderboard() {
    setLoading(true)
    const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`)
    if (response.ok) {
      const result = await response.json()
      setData(result.data || [])
    }
    setLoading(false)
  }

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-orange-400'
      case 2: return 'from-gray-300 to-gray-400'
      case 3: return 'from-orange-400 to-orange-500'
      default: return 'from-blue-400 to-indigo-400'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                className="text-6xl"
                animate={{ rotate: [-5, 5] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              >
                👑
              </motion.div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
                Leaderboard
              </h1>
            </div>

            {/* Timeframe Selector */}
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
                <motion.button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-6 py-2 rounded-full font-bold ${
                    timeframe === tf
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                      : 'bg-white text-gray-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tf.charAt(0).toUpperCase() + tf.slice(1)}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Leaderboard */}
          {data.length > 0 ? (
            <div className="space-y-4">
              {data.map((entry, index) => (
                <motion.div
                  key={entry.child_id}
                  className={`bg-gradient-to-r ${getRankColor(entry.rank)} rounded-3xl shadow-2xl p-6 text-white`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-black">
                        {getRankEmoji(entry.rank)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black">{entry.name}</h3>
                        <p className="text-white/80 text-sm">
                          {entry.completion_count} tasks completed • {entry.avg_rating.toFixed(1)}⭐ avg
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black">{entry.points}</p>
                      <p className="text-white/80 text-sm">points</p>
                      {entry.current_streak > 0 && (
                        <p className="text-white/90 text-sm mt-1">
                          🔥 {entry.current_streak} day streak
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              className="bg-gradient-to-r from-indigo-400 to-purple-400 rounded-3xl shadow-2xl p-12 text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-black mb-2">No Data Yet</h2>
              <p className="text-white/90">{t('leaderboard.description')}</p>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
