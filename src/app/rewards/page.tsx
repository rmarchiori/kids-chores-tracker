'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { motion } from 'framer-motion'

interface Reward {
  id: string
  name: string
  description: string
  points_cost: number
  category: string
  active: boolean
}

interface Child {
  id: string
  name: string
  points: number
}

export default function RewardsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_cost: 50,
    category: 'screen_time'
  })

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: familyMember } = await supabase
        .from('family_members')
        .select('family_id, role')
        .eq('user_id', user.id)
        .single()

      if (familyMember) {
        setFamilyId(familyMember.family_id)
        setRole(familyMember.role)
        await Promise.all([
          fetchRewards(familyMember.family_id),
          fetchChildren(familyMember.family_id)
        ])
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  const fetchRewards = async (famId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('rewards')
      .select('*')
      .eq('family_id', famId)
      .eq('active', true)
      .order('points_cost', { ascending: true })

    if (data) setRewards(data)
  }

  const fetchChildren = async (famId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('children')
      .select('id, name, points')
      .eq('family_id', famId)
      .order('name', { ascending: true })

    if (data && data.length > 0) {
      setChildren(data)
      setSelectedChild(data[0] || null)
    }
  }

  const handleCreateReward = async () => {
    if (!familyId) return

    const supabase = createClient()
    const { error } = await supabase
      .from('rewards')
      .insert({
        family_id: familyId,
        ...formData
      })

    if (!error) {
      setShowForm(false)
      setFormData({ name: '', description: '', points_cost: 50, category: 'screen_time' })
      fetchRewards(familyId)
    }
  }

  const handleRedeem = async (rewardId: string, pointsCost: number) => {
    if (!selectedChild) {
      alert('Please select a child first')
      return
    }

    if (selectedChild.points < pointsCost) {
      alert('Not enough points!')
      return
    }

    if (!confirm(`Redeem this reward for ${selectedChild.name}?`)) {
      return
    }

    const response = await fetch(`/api/rewards/${rewardId}/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ child_id: selectedChild.id })
    })

    if (response.ok) {
      const data = await response.json()
      // Update selected child's points
      setSelectedChild({ ...selectedChild, points: data.new_points })
      // Update in children list
      setChildren(children.map(c =>
        c.id === selectedChild.id ? { ...c, points: data.new_points } : c
      ))
      alert(`Success! ${selectedChild.name} now has ${data.new_points} points.`)
    } else {
      const error = await response.json()
      alert(`Error: ${error.error}`)
    }
  }

  const isParent = role === 'admin' || role === 'parent'

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-400 to-orange-400">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
            <p className="text-white font-bold text-lg">{t('rewards.loading')}</p>
          </motion.div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Page Header */}
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="text-6xl"
                animate={{ rotate: [-5, 5] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              >
                🎁
              </motion.div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
                {t('rewards.title')}
              </h1>
            </div>
            {isParent && (
              <motion.button
                onClick={() => setShowForm(!showForm)}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-3xl font-bold shadow-2xl"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {showForm ? t('rewards.cancel') : t('rewards.add_reward')}
              </motion.button>
            )}
          </motion.div>

          {/* Child Selector and Points Display */}
          {children.length > 0 && (
            <motion.div
              className="bg-white rounded-3xl shadow-2xl p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold mb-2 text-gray-700">Select Child</label>
                  <select
                    value={selectedChild?.id || ''}
                    onChange={(e) => {
                      const child = children.find(c => c.id === e.target.value)
                      setSelectedChild(child || null)
                    }}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    {children.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedChild && (
                  <motion.div
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 shadow-lg"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <p className="text-white/80 text-sm font-bold mb-1">Available Points</p>
                    <p className="text-white text-4xl font-black">{selectedChild.points}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Create Reward Form */}
          {showForm && isParent && (
            <motion.div
              className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-black text-orange-600 mb-6">{t('rewards.form.create_title')}</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">{t('rewards.form.name_label')}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder={t('rewards.form.name_placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">{t('rewards.form.description_label')}</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">{t('rewards.form.points_cost_label')}</label>
                    <input
                      type="number"
                      value={formData.points_cost}
                      onChange={(e) => setFormData({ ...formData, points_cost: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">{t('rewards.form.category_label')}</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <option value="screen_time">{t('rewards.categories.screen_time')}</option>
                      <option value="allowance">{t('rewards.categories.allowance')}</option>
                      <option value="privileges">{t('rewards.categories.privileges')}</option>
                      <option value="activities">{t('rewards.categories.activities')}</option>
                      <option value="items">{t('rewards.categories.items')}</option>
                    </select>
                  </div>
                </div>
                <motion.button
                  onClick={handleCreateReward}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {t('rewards.create_reward')}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Rewards Grid */}
          {rewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward, index) => {
                const canAfford = selectedChild && selectedChild.points >= reward.points_cost
                return (
                  <motion.div
                    key={reward.id}
                    className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl shadow-2xl p-6 text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-black">{reward.name}</h3>
                      <motion.span
                        className="px-4 py-2 bg-white/30 backdrop-blur-sm text-white rounded-full text-sm font-bold shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        {reward.points_cost} pts
                      </motion.span>
                    </div>
                    {reward.description && (
                      <p className="text-white/90 mb-5 font-medium">{reward.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/80 capitalize font-bold">
                        {t(`rewards.categories.${reward.category}`)}
                      </span>
                      <motion.button
                        onClick={() => handleRedeem(reward.id, reward.points_cost)}
                        disabled={!canAfford || !selectedChild}
                        className={`px-5 py-2 rounded-2xl font-bold shadow-lg transition-opacity ${
                          canAfford && selectedChild
                            ? 'bg-white text-orange-600'
                            : 'bg-white/30 text-white/50 cursor-not-allowed'
                        }`}
                        whileHover={canAfford && selectedChild ? { scale: 1.1, y: -2 } : {}}
                        whileTap={canAfford && selectedChild ? { scale: 0.95 } : {}}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        {t('rewards.redeem')}
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <motion.div
              className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl shadow-2xl p-12 text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [-5, 5] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              >
                🎯
              </motion.div>
              <h2 className="text-2xl font-black mb-2">{t('rewards.no_rewards')}</h2>
              {isParent && (
                <p className="text-white/90 text-lg font-medium">{t('rewards.create_prompt')}</p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
