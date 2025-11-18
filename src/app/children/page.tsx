'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import type { Child } from '@/lib/schemas'

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
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('children.title')}</h1>
          {children.length > 0 && (
            <button
              onClick={() => router.push('/children/new')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t('children.add_child')}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {children.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">👶</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {t('children.no_children')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('children.add_first_child')}
            </p>
            <button
              onClick={() => router.push('/children/new')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t('children.add_child')}
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <div
                key={child.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* Profile Photo */}
                  <div className="flex justify-center mb-4">
                    {child.profile_photo_url ? (
                      <img
                        src={child.profile_photo_url}
                        alt={child.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-200">
                        {child.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                    {child.name}
                  </h3>

                  {/* Age Group Badge */}
                  <div className="flex justify-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      child.age_group === '5-8'
                        ? 'bg-pink-100 text-pink-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {t('children.age_group')}: {child.age_group}
                    </span>
                  </div>

                  {/* Theme Preference */}
                  <div className="text-center text-sm text-gray-600 mb-4">
                    {t('children.theme')}: {t(`theme.${child.theme_preference}`)}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/children/${child.id}/edit`)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(child.id, child.name)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  )
}
