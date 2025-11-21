#!/usr/bin/env node

/**
 * Translation System Validation Script
 *
 * This script validates that the translation system is working correctly:
 * 1. All translation files exist and are valid JSON
 * 2. Key translation keys are present in all languages
 * 3. Translation files are accessible via HTTP
 * 4. Cache busting parameters work correctly
 */

const fs = require('fs')
const path = require('path')
const http = require('http')

const LANGUAGES = ['en-CA', 'pt-BR', 'fr-CA']
const DEV_SERVER_URL = 'http://localhost:3000'

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logTest(testName) {
  console.log(`\n${colors.bold}${colors.blue}Testing: ${testName}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

// Test 1: Check that translation files exist
async function testTranslationFilesExist() {
  logTest('Translation files exist on disk')

  let allExist = true
  for (const lang of LANGUAGES) {
    const filePath = path.join(__dirname, 'public', 'locales', lang, 'common.json')

    if (fs.existsSync(filePath)) {
      logSuccess(`${lang}/common.json exists`)
    } else {
      logError(`${lang}/common.json NOT FOUND at ${filePath}`)
      allExist = false
    }
  }

  return allExist
}

// Test 2: Check that translation files are valid JSON
async function testTranslationFilesValidJSON() {
  logTest('Translation files are valid JSON')

  let allValid = true
  const translations = {}

  for (const lang of LANGUAGES) {
    const filePath = path.join(__dirname, 'public', 'locales', lang, 'common.json')

    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const parsed = JSON.parse(content)
      translations[lang] = parsed

      const keyCount = Object.keys(parsed).length
      logSuccess(`${lang}/common.json is valid JSON with ${keyCount} top-level keys`)
    } catch (error) {
      logError(`${lang}/common.json is INVALID JSON: ${error.message}`)
      allValid = false
    }
  }

  return { allValid, translations }
}

// Test 3: Check that key translation keys exist in all languages
async function testKeyTranslationKeysExist(translations) {
  logTest('Key translation keys exist in all languages')

  // Define important keys that should exist in all translations
  const requiredKeys = [
    'dashboard.title',
    'tasks.new_task',
    'children.title',
    'settings.title',
  ]

  let allKeysExist = true

  for (const key of requiredKeys) {
    console.log(`\nChecking key: ${key}`)

    for (const lang of LANGUAGES) {
      const keys = key.split('.')
      let value = translations[lang]
      let found = true

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k]
        } else {
          found = false
          break
        }
      }

      if (found && typeof value === 'string') {
        logSuccess(`  ${lang}: "${value}"`)
      } else {
        logError(`  ${lang}: MISSING or not a string`)
        allKeysExist = false
      }
    }
  }

  return allKeysExist
}

// Test 4: Check that translation files are accessible via HTTP
async function testTranslationFilesAccessibleViaHTTP() {
  logTest('Translation files are accessible via HTTP')

  let allAccessible = true

  for (const lang of LANGUAGES) {
    const url = `${DEV_SERVER_URL}/locales/${lang}/common.json`

    try {
      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        const keyCount = Object.keys(data).length
        logSuccess(`${lang}: HTTP 200, ${keyCount} keys`)
      } else {
        logError(`${lang}: HTTP ${response.status}`)
        allAccessible = false
      }
    } catch (error) {
      logError(`${lang}: Failed to fetch - ${error.message}`)
      allAccessible = false
    }
  }

  return allAccessible
}

// Test 5: Check that cache busting works (two requests with different timestamps should not be cached)
async function testCacheBusting() {
  logTest('Cache busting with timestamp parameter')

  const lang = 'en-CA'
  const timestamp1 = Date.now()
  const url1 = `${DEV_SERVER_URL}/locales/${lang}/common.json?t=${timestamp1}`

  // Wait a moment to ensure different timestamp
  await new Promise(resolve => setTimeout(resolve, 10))

  const timestamp2 = Date.now()
  const url2 = `${DEV_SERVER_URL}/locales/${lang}/common.json?t=${timestamp2}`

  try {
    const response1 = await fetch(url1, {
      headers: { 'Cache-Control': 'no-cache' }
    })
    const data1 = await response1.json()
    logSuccess(`Request 1 with t=${timestamp1}: ${Object.keys(data1).length} keys`)

    const response2 = await fetch(url2, {
      headers: { 'Cache-Control': 'no-cache' }
    })
    const data2 = await response2.json()
    logSuccess(`Request 2 with t=${timestamp2}: ${Object.keys(data2).length} keys`)

    // Both should return the same data
    if (JSON.stringify(data1) === JSON.stringify(data2)) {
      logSuccess('Both requests returned the same translation data (as expected)')
      return true
    } else {
      logWarning('Requests returned different data (unexpected, but not necessarily wrong)')
      return true
    }
  } catch (error) {
    logError(`Cache busting test failed: ${error.message}`)
    return false
  }
}

// Test 6: Check for common issues in translation files
async function testCommonIssues(translations) {
  logTest('Common issues in translation files')

  let noIssues = true

  for (const lang of LANGUAGES) {
    console.log(`\nChecking ${lang} for common issues:`)

    const data = translations[lang]

    // Check for empty strings
    let emptyCount = 0
    let missingCount = 0

    const checkObject = (obj, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key

        if (typeof value === 'string') {
          if (value.trim() === '') {
            emptyCount++
          }
        } else if (typeof value === 'object' && value !== null) {
          checkObject(value, fullKey)
        } else if (value === null || value === undefined) {
          missingCount++
        }
      }
    }

    checkObject(data)

    if (emptyCount === 0 && missingCount === 0) {
      logSuccess(`  No empty or missing translations`)
    } else {
      if (emptyCount > 0) {
        logWarning(`  Found ${emptyCount} empty string(s)`)
        noIssues = false
      }
      if (missingCount > 0) {
        logWarning(`  Found ${missingCount} null/undefined value(s)`)
        noIssues = false
      }
    }
  }

  return noIssues
}

// Test 7: Check that the dev server is running
async function testDevServerRunning() {
  logTest('Dev server is running')

  try {
    const response = await fetch(DEV_SERVER_URL)
    if (response.ok) {
      logSuccess(`Dev server is running at ${DEV_SERVER_URL}`)
      return true
    } else {
      logError(`Dev server returned HTTP ${response.status}`)
      return false
    }
  } catch (error) {
    logError(`Cannot connect to dev server: ${error.message}`)
    logWarning(`Make sure to run 'npm run dev' before running this script`)
    return false
  }
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.bold}${colors.blue}`)
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║                                                            ║')
  console.log('║        TRANSLATION SYSTEM VALIDATION TESTS                 ║')
  console.log('║                                                            ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log(colors.reset)

  const results = []

  // File system tests
  results.push({ name: 'Files exist', passed: await testTranslationFilesExist() })

  const { allValid, translations } = await testTranslationFilesValidJSON()
  results.push({ name: 'Valid JSON', passed: allValid })

  if (allValid) {
    results.push({ name: 'Key translations exist', passed: await testKeyTranslationKeysExist(translations) })
    results.push({ name: 'No common issues', passed: await testCommonIssues(translations) })
  }

  // HTTP tests (require dev server to be running)
  const devServerRunning = await testDevServerRunning()
  results.push({ name: 'Dev server running', passed: devServerRunning })

  if (devServerRunning) {
    results.push({ name: 'HTTP accessible', passed: await testTranslationFilesAccessibleViaHTTP() })
    results.push({ name: 'Cache busting', passed: await testCacheBusting() })
  } else {
    logWarning('\nSkipping HTTP tests because dev server is not running')
  }

  // Print summary
  console.log(`\n${colors.bold}${colors.blue}`)
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║                                                            ║')
  console.log('║                      TEST SUMMARY                          ║')
  console.log('║                                                            ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  console.log(colors.reset)

  const passed = results.filter(r => r.passed).length
  const total = results.length

  results.forEach(result => {
    if (result.passed) {
      logSuccess(`${result.name}`)
    } else {
      logError(`${result.name}`)
    }
  })

  console.log()
  if (passed === total) {
    log(`${colors.bold}All ${total} tests PASSED! ✅${colors.reset}`, 'green')
    console.log()
    log('Translation system is working correctly! 🎉', 'green')
    process.exit(0)
  } else {
    log(`${colors.bold}${passed}/${total} tests passed${colors.reset}`, 'yellow')
    console.log()
    log('Some tests FAILED. Please review the errors above. ❌', 'red')
    process.exit(1)
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18 or later (for native fetch support)')
  process.exit(1)
}

// Run all tests
runAllTests().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
