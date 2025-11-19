'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format, subDays } from 'date-fns'
import { ChartSkeleton } from '@/components/ui/LoadingSkeletons'
import { useTranslation } from '@/hooks/useTranslation'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { motion } from 'framer-motion'

// Dynamic imports for Recharts components (reduces initial bundle size by ~350KB gzipped)
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), {
  loading: () => <ChartSkeleton />,
  ssr: false
})
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false })
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), {
  loading: () => <ChartSkeleton />,
  ssr: false
})
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false })
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), {
  loading: () => <ChartSkeleton />,
  ssr: false
})
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false })
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

// Type definitions for analytics data
interface TrendDataPoint {
  date: string
  tasks: number
  [key: string]: any
}

interface ChildPerformanceData {
  name: string
  tasks: number
  [key: string]: any
}

interface CategoryBreakdownData {
  name: string
  value: number
  [key: string]: any
}

interface OverviewStats {
  total_completions: number
  monthly_completions: number
  average_completion_rate: number
  current_streak: number
}

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const router = useRouter()
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

      // Fetch completions with rating columns
      const { data: completions, error: completionsError } = await supabase
        .from('task_completions')
        .select(`
          id,
          completed_at,
          child_rating,
          parent_rating,
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
        const childName = c.children?.[0]?.name || 'Unknown'
        childMap.set(childName, (childMap.get(childName) || 0) + 1)
      })
      const childPerf: ChildPerformanceData[] = Array.from(childMap.entries()).map(([name, count]) => ({ name, tasks: count }))
      setChildPerformance(childPerf)

      // Category breakdown
      const catMap = new Map<string, number>()
      completions.forEach(c => {
        const cat = c.tasks?.[0]?.category || 'other'
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
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-400 to-teal-400">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
            <p className="text-white font-bold text-lg">{t('analytics.loading')}</p>
          </motion.div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-400 to-teal-400">
          <motion.div
            className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-black text-red-900 mb-2">{t('analytics.error')}</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <motion.button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {t('analytics.retry')}
            </motion.button>
          </motion.div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-cyan-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Page Header */}
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
                📊
              </motion.div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600">
                {t('analytics.title')}
              </h1>
            </div>

            {/* Date Range Filter */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-6 py-3 bg-white border-2 border-cyan-200 rounded-xl font-bold text-gray-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="7days">{t('analytics.dateRange.last7days')}</option>
                <option value="30days">{t('analytics.dateRange.last30days')}</option>
                <option value="90days">{t('analytics.dateRange.last90days')}</option>
              </select>
            </motion.div>
          </motion.div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              className="bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-3xl shadow-2xl p-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <p className="text-sm text-white/80 font-bold mb-2">{t('analytics.stats.total_completions')}</p>
              <p className="text-4xl font-black">{overviewStats.total_completions}</p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl shadow-2xl p-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <p className="text-sm text-white/80 font-bold mb-2">{t('analytics.stats.monthly_completions')}</p>
              <p className="text-4xl font-black">{overviewStats.monthly_completions}</p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-3xl shadow-2xl p-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <p className="text-sm text-white/80 font-bold mb-2">{t('analytics.stats.avg_per_day')}</p>
              <p className="text-4xl font-black">{overviewStats.average_completion_rate}</p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl shadow-2xl p-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <p className="text-sm text-white/80 font-bold mb-2">{t('analytics.stats.current_streak')}</p>
              <p className="text-4xl font-black">{overviewStats.current_streak} {t('analytics.stats.days')}</p>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completion Trend */}
            <motion.div
              className="bg-white rounded-3xl shadow-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.02, y: -3 }}
            >
              <h2 className="text-2xl font-black text-cyan-600 mb-4">{t('analytics.charts.completion_trend')}</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tasks" stroke="#0891b2" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Child Performance */}
            <motion.div
              className="bg-white rounded-3xl shadow-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              whileHover={{ scale: 1.02, y: -3 }}
            >
              <h2 className="text-2xl font-black text-teal-600 mb-4">{t('analytics.charts.child_performance')}</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={childPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" fill="#14b8a6" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Category Breakdown */}
            <motion.div
              className="bg-white rounded-3xl shadow-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ scale: 1.02, y: -3 }}
            >
              <h2 className="text-2xl font-black text-cyan-600 mb-4">{t('analytics.charts.category_breakdown')}</h2>
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
                    {categoryBreakdown.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Top Performers */}
            <motion.div
              className="bg-gradient-to-br from-cyan-400 to-teal-400 rounded-3xl shadow-2xl p-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ scale: 1.02, y: -3 }}
            >
              <h2 className="text-2xl font-black mb-6">{t('analytics.charts.top_performers')}</h2>
              <div className="space-y-4">
                {childPerformance.slice(0, 3).map((child, index) => (
                  <motion.div
                    key={child.name}
                    className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-2xl p-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
                    whileHover={{ scale: 1.05, x: 5 }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.span
                        className="text-3xl"
                        animate={{ rotate: [-5, 5] }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: index * 0.3 }}
                      >
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </motion.span>
                      <span className="font-black text-lg">{child.name}</span>
                    </div>
                    <span className="font-bold text-lg">{child.tasks} {t('analytics.tasks')}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
