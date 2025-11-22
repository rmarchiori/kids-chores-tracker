'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import LanguageSelector from '@/components/LanguageSelector'

type ViewMode = 'split' | 'parent' | 'kid'

export default function HybridHero() {
  const { t, locale } = useTranslation()
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [hoveredSide, setHoveredSide] = useState<'parent' | 'kid' | null>(null)

  const parentFeatures = [
    { icon: '👨‍👩‍👧‍👦', titleKey: 'landing.hybrid.parent.features.dashboard', descKey: 'landing.hybrid.parent.featuresDesc.dashboard', gradient: 'from-blue-400 to-cyan-400' },
    { icon: '📊', titleKey: 'landing.hybrid.parent.features.tracking', descKey: 'landing.hybrid.parent.featuresDesc.tracking', gradient: 'from-indigo-400 to-blue-400' },
    { icon: '⭐', titleKey: 'landing.hybrid.parent.features.review', descKey: 'landing.hybrid.parent.featuresDesc.review', gradient: 'from-purple-400 to-indigo-400' },
    { icon: '🎁', titleKey: 'landing.hybrid.parent.features.rewards', descKey: 'landing.hybrid.parent.featuresDesc.rewards', gradient: 'from-cyan-400 to-teal-400' },
  ]

  const kidFeatures = [
    { icon: '🎯', titleKey: 'landing.hybrid.kid.features.tasks', descKey: 'landing.hybrid.kid.featuresDesc.tasks', gradient: 'from-pink-400 to-rose-400' },
    { icon: '✅', titleKey: 'landing.hybrid.kid.features.complete', descKey: 'landing.hybrid.kid.featuresDesc.complete', gradient: 'from-orange-400 to-pink-400' },
    { icon: '🌟', titleKey: 'landing.hybrid.kid.features.stars', descKey: 'landing.hybrid.kid.featuresDesc.stars', gradient: 'from-yellow-400 to-orange-400' },
    { icon: '🏆', titleKey: 'landing.hybrid.kid.features.levelup', descKey: 'landing.hybrid.kid.featuresDesc.levelup', gradient: 'from-purple-400 to-pink-400' },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Language Selector - Top Right */}
      <div className="fixed top-4 right-4 z-[200]">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <LanguageSelector currentLocale={locale} />
        </motion.div>
      </div>

      {/* Mode Selector Pills - Hidden on mobile, centered on desktop */}
      <div className="hidden md:flex fixed top-6 left-0 right-0 z-50 justify-center">
        <motion.div
          className="bg-white/90 backdrop-blur-md rounded-full shadow-2xl p-2 flex gap-2"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
        <button
          onClick={() => setViewMode('split')}
          className={`px-6 py-3 rounded-full font-bold transition-all ${
            viewMode === 'split'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t('landing.hybrid.views.both')}
        </button>
        <button
          onClick={() => setViewMode('parent')}
          className={`px-6 py-3 rounded-full font-bold transition-all ${
            viewMode === 'parent'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t('landing.hybrid.views.parent')}
        </button>
        <button
          onClick={() => setViewMode('kid')}
          className={`px-6 py-3 rounded-full font-bold transition-all ${
            viewMode === 'kid'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t('landing.hybrid.views.kid')}
        </button>
        </motion.div>
      </div>

      {/* Main Container - Stacks vertically on mobile, side-by-side on desktop */}
      <div className="flex flex-col md:flex-row min-h-screen md:pt-24">
        <AnimatePresence mode="wait">
          {/* Parent Side */}
          <motion.div
            key="parent-side"
            className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden min-h-[50vh] md:min-h-screen ${
              viewMode === 'kid' ? 'hidden' : ''
            } md:w-1/2`}
            initial={{ width: '100%' }}
            animate={{
              width: viewMode === 'parent' ? '100%' : viewMode === 'split' ? '100%' : '0%',
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
              className="relative z-10 max-w-2xl px-4 md:px-8 py-12 md:py-0 text-center"
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
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6">
                  {t('landing.hybrid.parent.title')}
                </h2>
                <p className="text-lg md:text-2xl mb-8 md:mb-12 text-blue-100">
                  {t('landing.hybrid.parent.subtitle')}
                </p>
              </motion.div>

              {/* Feature Cards with 3D hover effects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-12">
                {parentFeatures.map((feature, i) => (
                  <motion.div
                    key={`parent-feature-${i}`}
                    className={`bg-gradient-to-br ${feature.gradient} rounded-2xl md:rounded-3xl p-4 md:p-6 text-center shadow-2xl will-change-transform`}
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{
                      scale: 1.05,
                      y: -5,
                      transition: { type: 'spring', stiffness: 400, damping: 25 }
                    }}
                  >
                    <motion.div
                      className="text-4xl md:text-5xl mb-2 md:mb-3 inline-block"
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
                    <h3 className="font-bold text-base md:text-lg mb-1 text-white">{t(feature.titleKey)}</h3>
                    <p className="text-xs md:text-sm text-white/90">{t(feature.descKey)}</p>
                  </motion.div>
                ))}
              </div>

              {/* Show CTA only on mobile */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="md:hidden"
              >
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center px-8 md:px-12 py-3 md:py-5 text-lg md:text-xl font-bold bg-white text-blue-600 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
                  >
                    {t('landing.hybrid.parent.cta')}
                  </Link>
                </motion.div>
            </motion.div>

            {/* Hover Indicator - Desktop only */}
            {viewMode === 'split' && hoveredSide === 'parent' && (
              <motion.div
                className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {t('landing.hybrid.parent.hoverHint')}
              </motion.div>
            )}
          </motion.div>

          {/* Divider Line (only in split mode on desktop) */}
          {viewMode === 'split' && (
            <motion.div
              className="hidden md:block w-1 bg-gradient-to-b from-transparent via-white to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 }}
            />
          )}

          {/* Kid Side */}
          <motion.div
            key="kid-side"
            className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white overflow-hidden min-h-[50vh] md:min-h-screen ${
              viewMode === 'parent' ? 'hidden' : ''
            } md:w-1/2`}
            initial={{ width: '100%' }}
            animate={{
              width: viewMode === 'kid' ? '100%' : viewMode === 'split' ? '100%' : '0%',
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
                  className="absolute text-yellow-300 text-xl md:text-2xl"
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
              className="relative z-10 max-w-2xl px-4 md:px-8 py-12 md:py-0 text-center"
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
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6">
                  {t('landing.hybrid.kid.title')}
                </h2>
                <p className="text-lg md:text-2xl mb-8 md:mb-12 text-purple-100">
                  {t('landing.hybrid.kid.subtitle')}
                </p>
              </motion.div>

              {/* Feature Cards with 3D hover effects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-12">
                {kidFeatures.map((feature, i) => (
                  <motion.div
                    key={`kid-feature-${i}`}
                    className={`bg-gradient-to-br ${feature.gradient} rounded-2xl md:rounded-3xl p-4 md:p-6 text-center shadow-2xl will-change-transform`}
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{
                      scale: 1.05,
                      y: -5,
                      transition: { type: 'spring', stiffness: 400, damping: 25 }
                    }}
                  >
                    <motion.div
                      className="text-4xl md:text-5xl mb-2 md:mb-3 inline-block"
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
                    <h3 className="font-bold text-base md:text-lg mb-1 text-white">{t(feature.titleKey)}</h3>
                    <p className="text-xs md:text-sm text-white/90">{t(feature.descKey)}</p>
                  </motion.div>
                ))}
              </div>

              {/* Show CTA only on desktop when not in split mode, or always on mobile */}
              {viewMode !== 'split' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="hidden md:block"
                >
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center px-8 md:px-12 py-3 md:py-5 text-lg md:text-xl font-bold bg-white text-purple-600 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
                  >
                    {t('landing.hybrid.kid.cta')}
                  </Link>
                </motion.div>
              )}
            </motion.div>

            {/* Hover Indicator - Desktop only */}
            {viewMode === 'split' && hoveredSide === 'kid' && (
              <motion.div
                className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {t('landing.hybrid.kid.hoverHint')}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA - Fixed on desktop in split mode, static on mobile */}
      <div className="md:hidden w-full bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Link
              href="/auth/register"
              className="block w-full sm:inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-full shadow-2xl hover:shadow-3xl text-center"
            >
              {t('landing.hybrid.bottomCta.start')}
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Link
              href="/auth/login"
              className="block w-full sm:inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-700 bg-white rounded-full shadow-2xl hover:shadow-3xl text-center"
            >
              {t('landing.hybrid.bottomCta.login')}
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom CTA for desktop only in split mode */}
      {viewMode === 'split' && (
        <div className="hidden md:flex fixed bottom-8 left-0 right-0 z-50 justify-center">
          <motion.div
            className="flex gap-6"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/auth/register"
                className="px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-full shadow-2xl hover:shadow-3xl"
              >
                {t('landing.hybrid.bottomCta.start')}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/auth/login"
                className="px-10 py-5 text-xl font-bold text-gray-700 bg-white rounded-full shadow-2xl hover:shadow-3xl"
              >
                {t('landing.hybrid.bottomCta.login')}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
