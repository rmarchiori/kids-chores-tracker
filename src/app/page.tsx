'use client'

import { useState } from 'react'
import PlayfulHero from '@/components/landing/PlayfulHero'
import SplitScreenHero from '@/components/landing/SplitScreenHero'
import { motion, AnimatePresence } from 'framer-motion'

type LandingVersion = 'playful' | 'split'

export default function Home() {
  const [version, setVersion] = useState<LandingVersion>('split')

  return (
    <>
      {/* Version Switcher - Fixed Bottom Right */}
      <motion.div
        className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-gray-200"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="text-xs font-semibold text-gray-500 mb-2 text-center">
          Preview Versions
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setVersion('split')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              version === 'split'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Split-Screen
          </button>
          <button
            onClick={() => setVersion('playful')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              version === 'playful'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Playful 3D
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-2 text-center">
          {version === 'split' ? 'Approach 5' : 'Approach 2'}
        </div>
      </motion.div>

      {/* Landing Page Content */}
      <AnimatePresence mode="wait">
        {version === 'playful' ? (
          <motion.div
            key="playful"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
          >
            <PlayfulHero />
          </motion.div>
        ) : (
          <motion.div
            key="split"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <SplitScreenHero />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
