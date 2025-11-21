'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import type { Child } from '@/lib/schemas'
import { motion } from 'framer-motion'

export default function ChildrenPage() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useTranslation()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadChildren()
  }, [])

  async function loadChildren() {
    try {
      setLoading(true)
      setError(null)

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        router.push('/auth/login')
        return
      }

      // Get user's family member record
      const { data: familyMember, error: memberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', session.user.id)
        .single()

      if (memberError) throw memberError

      // Get children for this family
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', familyMember.family_id)
        .order('created_at', { ascending: true })

      if (childrenError) throw childrenError

      setChildren(childrenData || [])
    } catch (err) {
      console.error('Error loading children:', err)
      setError('Failed to load children. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(childId: string, childName: string) {
    if (!confirm(t('children.delete_confirm', { name: childName }))) {
      return
    }

    try {
      const response = await fetch(`/api/children/${childId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete child')
      }

      // Reload children list
      await loadChildren()
    } catch (err) {
      console.error('Error deleting child:', err)
      alert('Failed to delete child. Please try again.')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 py-8 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
        </div>
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-black text-white">{t('children.title')}</h1>
          {children.length > 0 && (
            <motion.button
              onClick={() => router.push('/children/new')}
              className="px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-3xl hover:from-purple-500 hover:to-pink-500 transition-colors font-bold shadow-2xl"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {t('children.add_child')}
            </motion.button>
          )}
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {children.length === 0 ? (
          <motion.div
            className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl shadow-2xl p-12 text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [-5, 5] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            >
              👶
            </motion.div>
            <h2 className="text-2xl font-black mb-2">
              {t('children.no_children')}
            </h2>
            <p className="text-white/90 mb-6">
              {t('children.add_first_child')}
            </p>
            <motion.button
              onClick={() => router.push('/children/new')}
              className="px-6 py-3 bg-white text-purple-600 rounded-3xl hover:bg-gray-50 transition-colors font-bold shadow-2xl"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {t('children.add_child')}
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {children.map((child, index) => (
              <motion.div
                key={child.id}
                className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl shadow-2xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="p-6">
                  {/* Profile Photo */}
                  <div className="flex justify-center mb-4">
                    {child.profile_photo_url ? (
                      <motion.img
                        src={child.profile_photo_url}
                        alt={child.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      />
                    ) : (
                      <motion.div
                        className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-purple-600 text-3xl font-black border-4 border-white shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        {child.name.charAt(0).toUpperCase()}
                      </motion.div>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-black text-center text-white mb-2">
                    {child.name}
                  </h3>

                  {/* Age Group Badge */}
                  <div className="flex justify-center mb-4">
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-white/30 text-white backdrop-blur-sm">
                      {t('children.age_group')}: {child.age_group}
                    </span>
                  </div>

                  {/* Theme Preference */}
                  <div className="text-center text-sm text-white/80 mb-4">
                    {t('children.theme')}: {t(`theme.${child.theme_preference}`)}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => router.push(`/children/${child.id}/edit`)}
                      className="flex-1 px-4 py-2 bg-white text-purple-600 rounded-3xl hover:bg-gray-50 transition-colors font-bold text-sm shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      {t('common.edit')}
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(child.id, child.name)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-3xl hover:bg-red-700 transition-colors font-bold text-sm shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      {t('common.delete')}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  )
}
