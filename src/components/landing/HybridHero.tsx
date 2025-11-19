'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

type ViewMode = 'split' | 'parent' | 'kid'

export default function HybridHero() {
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [hoveredSide, setHoveredSide] = useState<'parent' | 'kid' | null>(null)
  const [hoveredCoin, setHoveredCoin] = useState<number | null>(null)

  // Floating coins for visual interest
  const coins = [
    { x: '5%', y: '15%', delay: 0, size: 50 },
    { x: '92%', y: '12%', delay: 0.2, size: 45 },
    { x: '8%', y: '75%', delay: 0.4, size: 40 },
    { x: '90%', y: '80%', delay: 0.6, size: 48 },
  ]

  const parentFeatures = [
    { icon: '👨‍👩‍👧‍👦', title: 'Family Dashboard', desc: 'Manage everyone', gradient: 'from-blue-400 to-cyan-400' },
    { icon: '📊', title: 'Progress Tracking', desc: 'See completion stats', gradient: 'from-indigo-400 to-blue-400' },
    { icon: '⭐', title: 'Review & Approve', desc: 'Quality control', gradient: 'from-purple-400 to-indigo-400' },
    { icon: '🎁', title: 'Reward System', desc: 'Set incentives', gradient: 'from-cyan-400 to-teal-400' },
  ]

  const kidFeatures = [
    { icon: '🎯', title: 'My Tasks', desc: 'See what to do', gradient: 'from-pink-400 to-rose-400' },
    { icon: '✅', title: 'Complete & Earn', desc: 'Check off chores', gradient: 'from-orange-400 to-pink-400' },
    { icon: '🌟', title: 'Collect Stars', desc: 'Build your streak', gradient: 'from-yellow-400 to-orange-400' },
    { icon: '🏆', title: 'Level Up', desc: 'Unlock achievements', gradient: 'from-purple-400 to-pink-400' },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Floating Coins (3D-style from Approach 2) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {coins.map((coin, i) => (
          <motion.div
            key={`coin-${i}`}
            className="absolute text-5xl filter drop-shadow-xl will-change-transform"
            style={{ left: coin.x, top: coin.y }}
            initial={false}
            animate={{
              y: [-15, 15],
              rotate: [0, 180],
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: coin.delay,
              ease: 'easeInOut',
            }}
            onHoverStart={() => setHoveredCoin(i)}
            onHoverEnd={() => setHoveredCoin(null)}
          >
            <motion.span
              animate={{
                scale: hoveredCoin === i ? 1.4 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="cursor-pointer inline-block"
            >
              🪙
            </motion.span>
          </motion.div>
        ))}
      </div>

      {/* Mode Selector Pills */}
      <motion.div
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md rounded-full shadow-2xl p-2 flex gap-2"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={() => setViewMode('split')}
          className={`px-6 py-3 rounded-full font-bold transition-all ${
            viewMode === 'split'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Both Views
        </button>
        <button
          onClick={() => setViewMode('parent')}
          className={`px-6 py-3 rounded-full font-bold transition-all ${
            viewMode === 'parent'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          For Parents
        </button>
        <button
          onClick={() => setViewMode('kid')}
          className={`px-6 py-3 rounded-full font-bold transition-all ${
            viewMode === 'kid'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          For Kids
        </button>
      </motion.div>

      {/* Main Split Screen Container */}
      <div className="flex min-h-screen pt-24">
        <AnimatePresence mode="wait">
          {/* Parent Side */}
          <motion.div
            className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden ${
              viewMode === 'kid' ? 'hidden' : ''
            }`}
            initial={{ width: '50%' }}
            animate={{
              width: viewMode === 'parent' ? '100%' : viewMode === 'split' ? '50%' : '0%',
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            onHoverStart={() => setHoveredSide('parent')}
            onHoverEnd={() => setHoveredSide(null)}
          >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '50px 50px',
              }} />
            </div>

            <motion.div
              className="relative z-10 max-w-2xl px-8 text-center"
              animate={{
                scale: hoveredSide === 'parent' ? 1.03 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-6xl md:text-7xl font-black mb-6">
                  For Parents
                </h2>
                <p className="text-2xl mb-12 text-blue-100">
                  Organize, track, and guide your family's daily routines
                </p>
              </motion.div>

              {/* Feature Cards with 3D hover effects */}
              <div className="grid grid-cols-2 gap-4 mb-12">
                {parentFeatures.map((feature, i) => (
                  <motion.div
                    key={`parent-feature-${i}`}
                    className={`bg-gradient-to-br ${feature.gradient} rounded-3xl p-6 text-center shadow-2xl will-change-transform`}
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{
                      scale: 1.05,
                      y: -5,
                    }}
                  >
                    <motion.div
                      className="text-5xl mb-3 inline-block"
                      animate={{ rotate: [-5, 5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        delay: i * 0.2,
                        ease: 'easeInOut'
                      }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="font-bold text-lg mb-1 text-white">{feature.title}</h3>
                    <p className="text-sm text-white/90">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              {viewMode !== 'split' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center px-12 py-5 text-xl font-bold bg-white text-blue-600 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
                  >
                    Start Managing Now
                  </Link>
                </motion.div>
              )}
            </motion.div>

            {/* Hover Indicator */}
            {viewMode === 'split' && hoveredSide === 'parent' && (
              <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Click to explore parent features →
              </motion.div>
            )}
          </motion.div>

          {/* Divider Line (only in split mode) */}
          {viewMode === 'split' && (
            <motion.div
              className="w-1 bg-gradient-to-b from-transparent via-white to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 }}
            />
          )}

          {/* Kid Side */}
          <motion.div
            className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white overflow-hidden ${
              viewMode === 'parent' ? 'hidden' : ''
            }`}
            initial={{ width: '50%' }}
            animate={{
              width: viewMode === 'kid' ? '100%' : viewMode === 'split' ? '50%' : '0%',
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            onHoverStart={() => setHoveredSide('kid')}
            onHoverEnd={() => setHoveredSide(null)}
          >
            {/* Animated Stars Background */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-300 text-2xl"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0.3, 1],
                    scale: [1, 1.2],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: Math.random() * 2,
                  }}
                >
                  ⭐
                </motion.div>
              ))}
            </div>

            <motion.div
              className="relative z-10 max-w-2xl px-8 text-center"
              animate={{
                scale: hoveredSide === 'kid' ? 1.03 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-6xl md:text-7xl font-black mb-6">
                  For Kids
                </h2>
                <p className="text-2xl mb-12 text-purple-100">
                  Complete tasks, earn rewards, and have fun!
                </p>
              </motion.div>

              {/* Feature Cards with 3D hover effects */}
              <div className="grid grid-cols-2 gap-4 mb-12">
                {kidFeatures.map((feature, i) => (
                  <motion.div
                    key={`kid-feature-${i}`}
                    className={`bg-gradient-to-br ${feature.gradient} rounded-3xl p-6 text-center shadow-2xl will-change-transform`}
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{
                      scale: 1.05,
                      y: -5,
                    }}
                  >
                    <motion.div
                      className="text-5xl mb-3 inline-block"
                      animate={{ rotate: [-5, 5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        delay: i * 0.2,
                        ease: 'easeInOut'
                      }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="font-bold text-lg mb-1 text-white">{feature.title}</h3>
                    <p className="text-sm text-white/90">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              {viewMode !== 'split' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center px-12 py-5 text-xl font-bold bg-white text-purple-600 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
                  >
                    Start Your Adventure! 🚀
                  </Link>
                </motion.div>
              )}
            </motion.div>

            {/* Hover Indicator */}
            {viewMode === 'split' && hoveredSide === 'kid' && (
              <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                ← Click to explore kid features
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA (only in split mode) */}
      {viewMode === 'split' && (
        <motion.div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-6"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/auth/register"
              className="px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full shadow-2xl hover:shadow-3xl"
            >
              Start Free for Everyone! 🎉
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/auth/login"
              className="px-10 py-5 text-xl font-bold text-gray-700 bg-white rounded-full shadow-2xl hover:shadow-3xl"
            >
              Login
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
