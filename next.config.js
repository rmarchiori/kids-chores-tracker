/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false,
  },
  // Next.js automatically looks for app/ in src/ directory
  // No additional configuration needed
  // Note: i18n config not supported in App Router - using cookies/headers instead
}

module.exports = nextConfig
