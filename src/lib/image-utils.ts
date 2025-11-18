/**
 * Image utility functions for profile photo handling
 * Includes resize, compress, and upload functionality
 */

/**
 * Resize and compress an image file
 * @param file - The image file to process
 * @param maxWidth - Maximum width in pixels (default: 400)
 * @param maxHeight - Maximum height in pixels (default: 400)
 * @param quality - JPEG quality 0-1 (default: 0.8)
 * @returns Promise<Blob> - Processed image blob
 */
export async function resizeImage(
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to convert canvas to blob'))
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Validate image file
 * @param file - File to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a JPEG, PNG, or WebP image file'
    }
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image file size must be less than 5MB'
    }
  }

  return { isValid: true }
}

/**
 * Generate a unique filename for profile photo
 * @param userId - User ID for folder structure
 * @param originalFilename - Original file name
 * @returns String - Unique filename with path
 */
export function generatePhotoFilename(userId: string, originalFilename: string): string {
  const timestamp = Date.now()
  const extension = originalFilename.split('.').pop() || 'jpg'
  return `${userId}/profile-${timestamp}.${extension}`
}

/**
 * Create a preview URL from a file
 * @param file - Image file
 * @returns Promise<string> - Data URL for preview
 */
export function createPreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('Failed to create preview'))
    reader.readAsDataURL(file)
  })
}

/**
 * Default avatar options
 */
export const DEFAULT_AVATARS = [
  {
    id: 'avatar-1',
    emoji: '🧒',
    color: 'bg-gradient-to-br from-blue-400 to-purple-500',
    label: 'Blue Purple'
  },
  {
    id: 'avatar-2',
    emoji: '👧',
    color: 'bg-gradient-to-br from-pink-400 to-red-500',
    label: 'Pink Red'
  },
  {
    id: 'avatar-3',
    emoji: '👦',
    color: 'bg-gradient-to-br from-green-400 to-teal-500',
    label: 'Green Teal'
  },
  {
    id: 'avatar-4',
    emoji: '👶',
    color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    label: 'Yellow Orange'
  },
  {
    id: 'avatar-5',
    emoji: '🧑',
    color: 'bg-gradient-to-br from-indigo-400 to-blue-500',
    label: 'Indigo Blue'
  },
  {
    id: 'avatar-6',
    emoji: '👧',
    color: 'bg-gradient-to-br from-purple-400 to-pink-500',
    label: 'Purple Pink'
  },
]

/**
 * Generate avatar SVG data URL from initial
 * @param initial - First letter of name
 * @param color - Background color class
 * @returns String - Data URL for SVG avatar
 */
export function generateAvatarDataUrl(initial: string, colorIndex: number = 0): string {
  const colors = [
    '#3B82F6', // blue
    '#EC4899', // pink
    '#10B981', // green
    '#F59E0B', // amber
    '#6366F1', // indigo
    '#8B5CF6', // violet
  ]

  const color = colors[colorIndex % colors.length]
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="100" fill="${color}"/>
      <text x="100" y="100" font-family="Arial, sans-serif" font-size="80" font-weight="bold"
            fill="white" text-anchor="middle" dominant-baseline="central">
        ${initial.toUpperCase()}
      </text>
    </svg>
  `

  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Create cropped image from original image and crop area
 * @param imageSrc - Source image URL
 * @param pixelCrop - Crop area in pixels {x, y, width, height}
 * @param outputSize - Desired output size (default: 400x400)
 * @param quality - JPEG quality 0-1 (default: 0.85)
 * @returns Promise<Blob> - Cropped image as JPEG blob
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  outputSize: number = 400,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = imageSrc

    image.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      // Set canvas size to desired output size
      canvas.width = outputSize
      canvas.height = outputSize

      // Draw the cropped image scaled to output size
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputSize,
        outputSize
      )

      // Convert to JPEG blob with specified quality
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create cropped image'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    image.onerror = () => reject(new Error('Failed to load image'))
  })
}
