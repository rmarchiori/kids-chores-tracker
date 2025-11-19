'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

// Type definitions for analytics data
interface TrendDataPoint {
  date: string
  tasks: number
}

interface ChildPerformanceData {
  name: string
  tasks: number
}

interface CategoryBreakdownData {
  name: string
  value: number
}

interface OverviewStats {
  total_completions: number
  monthly_completions: number
  average_completion_rate: number
  current_streak: number
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('30days')
  const [overviewStats, setOverviewStats] = useState<OverviewStats>({
    total_completions: 0,
    monthly_completions: 0,
    average_completion_rate: 0,
    current_streak: 0
  })
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([])
  const [childPerformance, setChildPerformance] = useState<ChildPerformanceData[]>([])
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdownData[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        setError(null)
        setLoading(true)

        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) {
          throw new Error('Authentication failed')
        }

        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: familyMember, error: familyError } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('user_id', user.id)
          .single()

        if (familyError) {
          throw new Error('Failed to fetch family membership')
        }

        if (familyMember) {
          setFamilyId(familyMember.family_id)
          await fetchAnalyticsData(familyMember.family_id)
        }
      } catch (err) {
        console.error('Error loading analytics:', err)
        setError(err instanceof Error ? err.message : 'Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, dateRange])

  const fetchAnalyticsData = async (famId: string) => {
    try {
      const supabase = createClient()
      const daysAgo = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90
      const startDate = format(subDays(new Date(), daysAgo), 'yyyy-MM-dd')

      // Fetch completions
      const { data: completions, error: completionsError } = await supabase
        .from('task_completions')
        .select(`
          id,
          completed_at,
          rating,
          tasks!inner(id, family_id, category),
          children(id, name)
        `)
        .eq('tasks.family_id', famId)
        .gte('completed_at', startDate)
        .in('status', ['completed', 'pending_review'])

      if (completionsError) {
        throw new Error(`Failed to fetch completions: ${completionsError.message}`)
      }

      if (!completions) return

      // Overview stats
      const total = completions.length
      const monthlyComps = completions.filter(c =>
        new Date(c.completed_at) >= subDays(new Date(), 30)
      ).length

      setOverviewStats({
        total_completions: total,
        monthly_completions: monthlyComps,
        average_completion_rate: total > 0 ? Math.round((total / daysAgo) * 100) / 100 : 0,
        current_streak: 0 // Calculate based on consecutive days
      })

      // Trend data - group by day
      const trendMap = new Map<string, number>()
      completions.forEach(c => {
        const day = format(new Date(c.completed_at), 'MMM d')
        trendMap.set(day, (trendMap.get(day) || 0) + 1)
      })
      const trend: TrendDataPoint[] = Array.from(trendMap.entries()).map(([date, count]) => ({ date, tasks: count }))
      setTrendData(trend.slice(-30)) // Last 30 data points

      // Child performance
      const childMap = new Map<string, number>()
      completions.forEach(c => {
        const childName = c.children?.name || 'Unknown'
        childMap.set(childName, (childMap.get(childName) || 0) + 1)
      })
      const childPerf: ChildPerformanceData[] = Array.from(childMap.entries()).map(([name, count]) => ({ name, tasks: count }))
      setChildPerformance(childPerf)

      // Category breakdown
      const catMap = new Map<string, number>()
      completions.forEach(c => {
        const cat = c.tasks?.category || 'other'
        catMap.set(cat, (catMap.get(cat) || 0) + 1)
      })
      const catBreak: CategoryBreakdownData[] = Array.from(catMap.entries()).map(([name, value]) => ({ name, value }))
      setCategoryBreakdown(catBreak)
    } catch (err) {
      console.error('Error fetching analytics data:', err)
      throw err
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading analytics...</div>
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Analytics</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      {/* Date Range Filter */}
      <div className="mb-6">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Completions</p>
          <p className="text-3xl font-bold text-blue-600">{overviewStats.total_completions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-3xl font-bold text-green-600">{overviewStats.monthly_completions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Avg Per Day</p>
          <p className="text-3xl font-bold text-purple-600">{overviewStats.average_completion_rate}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Current Streak</p>
          <p className="text-3xl font-bold text-orange-600">{overviewStats.current_streak} days</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Completion Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Child Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Child Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={childPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tasks" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Top Performers</h2>
          <div className="space-y-4">
            {childPerformance.slice(0, 3).map((child, index) => (
              <div key={child.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                  <span className="font-medium">{child.name}</span>
                </div>
                <span className="text-gray-600">{child.tasks} tasks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
