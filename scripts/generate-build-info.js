#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Read version from package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
)
const version = packageJson.version

// Get git commit hash if available
let gitHash = 'dev'
try {
  gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
} catch (error) {
  console.warn('Git not available, using "dev" as commit hash')
}

// Generate build time and number
const buildTime = new Date().toISOString()
const buildNumber = Date.now().toString(36).toUpperCase()

// Generate the build info file
const buildInfoContent = `// This file is auto-generated during build
// Do not edit manually
// Generated at: ${buildTime}

export const BUILD_INFO = {
  version: '${version}',
  buildTime: '${buildTime}',
  buildNumber: '${buildNumber}',
  gitHash: '${gitHash}',
} as const
`

const outputPath = path.join(__dirname, '..', 'src', 'lib', 'build-info.ts')
fs.writeFileSync(outputPath, buildInfoContent, 'utf8')

console.log('✅ Build info generated:')
console.log(`   Version: ${version}`)
console.log(`   Build: ${buildNumber}`)
console.log(`   Git: ${gitHash}`)
console.log(`   Time: ${buildTime}`)
