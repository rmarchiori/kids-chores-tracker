'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/navigation/DashboardLayout'
import { TaskForm } from '@/components/tasks/TaskForm'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import type { Child } from '@/lib/schemas'

export default function NewTaskPage() {
  const router = useRouter()
  const supabase = createClient()
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFamilyData()
  }, [])

  async function loadFamilyData() {
    try {
      setLoading(true)

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

      if (memberError) {
        throw memberError
      }

      setFamilyId(familyMember.family_id)

      // Get children for this family
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', familyMember.family_id)
        .order('created_at', { ascending: true })

      if (childrenError) {
        throw childrenError
      }

      setChildren(childrenData || [])
    } catch (err) {
      console.error('Error loading family data:', err)
      alert('Failed to load family data. Please try again.')
      router.push('/tasks')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(data: any) {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create task')
      }

      // Navigate back to tasks list
      router.push('/tasks')
    } catch (error) {
      console.error('Error creating task:', error)
      alert(error instanceof Error ? error.message : 'Failed to create task. Please try again.')
      throw error
    }
  }

  if (loading || !familyId) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/tasks')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Tasks
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
            <p className="text-gray-600 mt-2">
              Add a new task and optionally assign it to your children.
            </p>
          </div>

          {/* Task Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <TaskForm
              familyId={familyId}
              onSubmit={handleSubmit}
              submitLabel="Create Task"
              availableChildren={children.map(child => ({
                id: child.id,
                name: child.name
              }))}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
