import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TaskImageSchema } from '@/lib/schemas'

/**
 * GET /api/task-images
 * Get all task images from the library
 * Authenticated users only
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user - verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all images from library
    const { data: images, error: imagesError } = await supabase
      .from('task_image_library')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (imagesError) {
      console.error('Error fetching task images:', imagesError)
      throw imagesError
    }

    // Validate images data
    const validatedImages = images.map(image => TaskImageSchema.parse(image))

    return NextResponse.json(validatedImages)
  } catch (error) {
    console.error('Error in GET /api/task-images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task images' },
      { status: 500 }
    )
  }
}
