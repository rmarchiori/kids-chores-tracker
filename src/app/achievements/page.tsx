'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { motion } from 'framer-motion'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  unlocked_at?: string
}

interface Child {
  id: string
  name: string
}

export default function AchievementsPage() {
  const router = useRouter()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [unlocked, setUnlocked] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedChild) {
      loadAchievements(selectedChild.id)
    }
  }, [selectedChild])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (familyMember) {
      const { data: childrenData } = await supabase
        .from('children')
        .select('id, name')
        .eq('family_id', familyMember.family_id)
        .order('name')

      if (childrenData && childrenData.length > 0) {
        setChildren(childrenData)
        setSelectedChild(childrenData[0] || null)
      }
    }

    setLoading(false)
  }

  async function loadAchievements(childId: string) {
    const response = await fetch(`/api/children/${childId}/achievements`)
    if (response.ok) {
      const data = await response.json()
      setUnlocked(data.unlocked || [])
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
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
                🏆
              </motion.div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Achievements
              </h1>
            </div>

            {/* Child Selector */}
            {children.length > 0 && (
              <select
                value={selectedChild?.id || ''}
                onChange={(e) => {
                  const child = children.find(c => c.id === e.target.value)
                  setSelectedChild(child || null)
                }}
                className="px-4 py-3 border-2 border-purple-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            )}
          </motion.div>

          {/* Achievements Grid */}
          {unlocked.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unlocked.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl shadow-2xl p-6 text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">{achievement.icon}</div>
                    <h3 className="text-xl font-black">{achievement.name}</h3>
                  </div>
                  <p className="text-white/90 text-sm mb-3 text-center">
                    {achievement.description}
                  </p>
                  {achievement.unlocked_at && (
                    <p className="text-white/70 text-xs text-center">
                      Unlocked: {new Date(achievement.unlocked_at).toLocaleDateString()}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl shadow-2xl p-12 text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-black mb-2">No Achievements Yet</h2>
              <p className="text-white/90">Complete tasks to unlock achievements!</p>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
