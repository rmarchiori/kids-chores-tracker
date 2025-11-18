#!/usr/bin/env node

/**
 * Cleanup Orphaned Photos Script
 *
 * This script finds and deletes photos in the profile-photos bucket
 * that are not referenced by any child records.
 *
 * Usage:
 *   node scripts/cleanup-orphaned-photos.mjs
 *   node scripts/cleanup-orphaned-photos.mjs --dry-run  (to preview without deleting)
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing required environment variables')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  console.error('   Make sure .env.local is configured correctly')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Check if dry-run mode
const isDryRun = process.argv.includes('--dry-run')

async function cleanupOrphanedPhotos() {
  try {
    console.log('🔍 Starting orphaned photos cleanup...\n')

    // Step 1: Get all profile photo URLs from children table
    console.log('📋 Step 1: Fetching children records...')
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('id, name, profile_photo_url')

    if (childrenError) throw childrenError

    console.log(`   Found ${children.length} children total`)

    // Extract URLs and convert to file paths
    const referencedUrls = children
      .map(c => c.profile_photo_url)
      .filter(url => url && !url.startsWith('data:'))

    console.log(`   ${referencedUrls.length} have real photo URLs (not data: URLs)`)

    // Extract just the file paths from URLs (including folder structure)
    const referencedFilePaths = new Set()
    for (const url of referencedUrls) {
      // URL format: https://.../storage/v1/object/public/profile-photos/user-id/filename.jpg
      const match = url.match(/profile-photos\/(.+?)(?:\?|$)/)
      if (match) {
        referencedFilePaths.add(match[1])
      }
    }

    console.log(`   Referenced files:`)
    if (referencedFilePaths.size === 0) {
      console.log('      (none)')
    } else {
      for (const filePath of referencedFilePaths) {
        console.log(`      - ${filePath}`)
      }
    }

    // Step 2: List all files in the profile-photos bucket (recursively)
    console.log('\n📁 Step 2: Listing all files in bucket...')

    async function listAllFiles(path = '') {
      const { data: items, error } = await supabase.storage
        .from('profile-photos')
        .list(path, {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) throw error

      let allFiles = []

      for (const item of items) {
        if (item.id === null) {
          // It's a folder, list its contents
          const subPath = path ? `${path}/${item.name}` : item.name
          const subFiles = await listAllFiles(subPath)
          allFiles = allFiles.concat(subFiles)
        } else {
          // It's a file
          const fullPath = path ? `${path}/${item.name}` : item.name
          allFiles.push({ ...item, fullPath })
        }
      }

      return allFiles
    }

    const files = await listAllFiles()

    console.log(`   Found ${files.length} total files in bucket`)
    console.log(`   All files in bucket:`)
    if (files.length === 0) {
      console.log('      (none)')
    } else {
      for (const file of files) {
        console.log(`      - ${file.fullPath}`)
      }
    }

    // Step 3: Find orphaned files
    console.log('\n🔎 Step 3: Identifying orphaned files...')
    console.log(`   Comparing:`)
    console.log(`      Files in bucket: ${files.length}`)
    console.log(`      Files referenced in DB: ${referencedFilePaths.size}`)

    const orphanedFiles = files.filter(file => {
      // Skip .emptyFolderPlaceholder files
      if (file.name === '.emptyFolderPlaceholder') return false

      const isOrphaned = !referencedFilePaths.has(file.fullPath)
      if (isOrphaned) {
        console.log(`      ❌ ORPHAN: ${file.fullPath} (not in referenced set)`)
      } else {
        console.log(`      ✅ KEEP: ${file.fullPath} (referenced in DB)`)
      }
      return isOrphaned
    })

    console.log(`   Found ${orphanedFiles.length} orphaned file(s)`)

    if (orphanedFiles.length === 0) {
      console.log('\n✅ No orphaned files to clean up!')
      return
    }

    // Display orphaned files
    console.log('\n📝 Orphaned files:')
    for (const file of orphanedFiles) {
      const sizeKB = (file.metadata?.size / 1024).toFixed(2)
      console.log(`   - ${file.fullPath} (${sizeKB} KB, created: ${file.created_at})`)
    }

    // Step 4: Delete orphaned files (or show what would be deleted)
    if (isDryRun) {
      console.log('\n🔍 DRY RUN MODE - No files will be deleted')
      console.log(`   Would delete ${orphanedFiles.length} file(s)`)
      const totalSize = orphanedFiles.reduce((sum, f) => sum + (f.metadata?.size || 0), 0)
      console.log(`   Would free up ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
    } else {
      console.log('\n🗑️  Step 4: Deleting orphaned files...')

      const filesToDelete = orphanedFiles.map(f => f.fullPath)

      const { data: deleteData, error: deleteError } = await supabase.storage
        .from('profile-photos')
        .remove(filesToDelete)

      if (deleteError) throw deleteError

      console.log(`   ✅ Successfully deleted ${filesToDelete.length} orphaned file(s)`)

      const totalSize = orphanedFiles.reduce((sum, f) => sum + (f.metadata?.size || 0), 0)
      console.log(`   💾 Freed up ${(totalSize / 1024 / 1024).toFixed(2)} MB of storage`)
    }

    console.log('\n✅ Cleanup complete!')

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error)
    process.exit(1)
  }
}

// Run the cleanup
console.log(isDryRun ? '🧪 DRY RUN MODE ENABLED\n' : '')
cleanupOrphanedPhotos()
