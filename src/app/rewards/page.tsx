'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Reward {
  id: string
  name: string
  description: string
  points_cost: number
  category: string
  active: boolean
}

export default function RewardsPage() {
  const router = useRouter()
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
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
        await fetchRewards(familyMember.family_id)
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

  const isParent = role === 'admin' || role === 'parent'

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Rewards Store</h1>
        {isParent && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add Reward'}
          </button>
        )}
      </div>

      {/* Create Reward Form */}
      {showForm && isParent && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Reward</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Reward Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., 30 min extra screen time"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Points Cost</label>
                <input
                  type="number"
                  value={formData.points_cost}
                  onChange={(e) => setFormData({ ...formData, points_cost: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="screen_time">Screen Time</option>
                  <option value="allowance">Allowance</option>
                  <option value="privileges">Privileges</option>
                  <option value="activities">Activities</option>
                  <option value="items">Items</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleCreateReward}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create Reward
            </button>
          </div>
        </div>
      )}

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rewards.map(reward => (
          <div key={reward.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold">{reward.name}</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {reward.points_cost} pts
              </span>
            </div>
            {reward.description && (
              <p className="text-gray-600 mb-4">{reward.description}</p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 capitalize">{reward.category.replace('_', ' ')}</span>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Redeem
              </button>
            </div>
          </div>
        ))}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No rewards available yet.</p>
          {isParent && <p className="mt-2">Create some rewards to motivate your children!</p>}
        </div>
      )}
    </div>
  )
}
