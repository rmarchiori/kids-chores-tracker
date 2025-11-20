'use client'

import { useState } from 'react'
import { BUILD_INFO } from '@/lib/build-info'

export function VersionBadge() {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatBuildTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Unknown'
    }
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 transition-all duration-200"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={`
          bg-gray-800 text-white text-xs rounded-lg shadow-lg
          transition-all duration-200 cursor-default
          ${isExpanded ? 'px-4 py-3' : 'px-3 py-1.5'}
        `}
      >
        {isExpanded ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold">Version:</span>
              <span className="font-mono">{BUILD_INFO.version}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Build:</span>
              <span className="font-mono">{BUILD_INFO.buildNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Commit:</span>
              <span className="font-mono">{BUILD_INFO.gitHash}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Date:</span>
              <span className="font-mono text-xs">
                {formatBuildTime(BUILD_INFO.buildTime)}
              </span>
            </div>
          </div>
        ) : (
          <div className="font-mono font-semibold">
            v{BUILD_INFO.version} · {BUILD_INFO.buildNumber}
          </div>
        )}
      </div>
    </div>
  )
}
