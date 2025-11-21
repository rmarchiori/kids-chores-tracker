import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all achievements
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .order('category, requirement_value')

    if (error) {
      throw error
    }

    return NextResponse.json({ achievements: achievements || [] })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
