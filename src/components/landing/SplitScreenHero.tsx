'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

type ViewMode = 'split' | 'parent' | 'kid'

export default function SplitScreenHero() {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [hoveredSide, setHoveredSide] = useState<'parent' | 'kid' | null>(null)

  const parentFeatures = [
    { icon: '👨‍👩‍👧‍👦', titleKey: 'landing.split.parent.features.dashboard', descKey: 'landing.split.parent.featuresDesc.dashboard' },
    { icon: '📊', titleKey: 'landing.split.parent.features.tracking', descKey: 'landing.split.parent.featuresDesc.tracking' },
    { icon: '⭐', titleKey: 'landing.split.parent.features.review', descKey: 'landing.split.parent.featuresDesc.review' },
    { icon: '🎁', titleKey: 'landing.split.parent.features.rewards', descKey: 'landing.split.parent.featuresDesc.rewards' },
  ]

  const kidFeatures = [
    { icon: '🎯', titleKey: 'landing.split.kid.features.tasks', descKey: 'landing.split.kid.featuresDesc.tasks' },
    { icon: '✅', titleKey: 'landing.split.kid.features.complete', descKey: 'landing.split.kid.featuresDesc.complete' },
    { icon: '🌟', titleKey: 'landing.split.kid.features.stars', descKey: 'landing.split.kid.featuresDesc.stars' },
    { icon: '🏆', titleKey: 'landing.split.kid.features.levelup', descKey: 'landing.split.kid.featuresDesc.levelup' },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
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
          {t('landing.split.views.both')}
        </button>
        <button
          onClick={() => setViewMode('parent')}
          className={`px-6 py-3 rounded-full font-bold transition-all ${
            viewMode === 'parent'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t('landing.split.views.parent')}
        </button>
        <button
          onClick={() => setViewMode('kid')}
          className={`px-6 py-3 rounded-full font-bold transition-all ${
            viewMode === 'kid'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t('landing.split.views.kid')}
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
                scale: hoveredSide === 'parent' ? 1.05 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-6xl md:text-7xl font-black mb-6">
                  {t('landing.split.parent.title')}
                </h2>
                <p className="text-2xl mb-12 text-blue-100">
                  {t('landing.split.parent.subtitle')}
                </p>
              </motion.div>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-4 mb-12">
                {parentFeatures.map((feature, i) => (
                  <motion.div
                    key={i}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <div className="text-4xl mb-3">{feature.icon}</div>
                    <h3 className="font-bold text-lg mb-1">{t(feature.titleKey)}</h3>
                    <p className="text-sm text-blue-200">{t(feature.descKey)}</p>
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
                    {t('landing.split.parent.cta')}
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
                {t('landing.split.parent.hoverHint')}
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
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
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
                scale: hoveredSide === 'kid' ? 1.05 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-6xl md:text-7xl font-black mb-6">
                  {t('landing.split.kid.title')}
                </h2>
                <p className="text-2xl mb-12 text-purple-100">
                  {t('landing.split.kid.subtitle')}
                </p>
              </motion.div>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-4 mb-12">
                {kidFeatures.map((feature, i) => (
                  <motion.div
                    key={i}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <div className="text-4xl mb-3">{feature.icon}</div>
                    <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                    <p className="text-sm text-purple-200">{feature.desc}</p>
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
                    {t('landing.split.kid.cta')}
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
                {t('landing.split.kid.hoverHint')}
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
              {t('landing.split.bottomCta.start')}
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/auth/login"
              className="px-10 py-5 text-xl font-bold text-gray-700 bg-white rounded-full shadow-2xl hover:shadow-3xl"
            >
              {t('landing.split.bottomCta.login')}
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
