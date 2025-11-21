'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import LanguageSelector from '@/components/LanguageSelector'

export default function PlayfulHero() {
  const { t, locale } = useTranslation()
  const [hoveredCoin, setHoveredCoin] = useState<number | null>(null)

  const coins = [
    { x: '10%', y: '20%', delay: 0, size: 60 },
    { x: '80%', y: '15%', delay: 0.2, size: 50 },
    { x: '15%', y: '70%', delay: 0.4, size: 55 },
    { x: '85%', y: '75%', delay: 0.6, size: 45 },
    { x: '50%', y: '10%', delay: 0.3, size: 40 },
  ]

  const features = [
    { icon: '🎯', titleKey: 'landing.playful.features.dailyTasks', color: 'from-purple-400 to-pink-400' },
    { icon: '🌟', titleKey: 'landing.playful.features.earnStars', color: 'from-yellow-400 to-orange-400' },
    { icon: '🎁', titleKey: 'landing.playful.features.getRewards', color: 'from-green-400 to-teal-400' },
    { icon: '📊', titleKey: 'landing.playful.features.trackProgress', color: 'from-blue-400 to-cyan-400' },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Language Selector - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <LanguageSelector currentLocale={locale} />
      </div>

      {/* Floating Coins Background */}
      <div className="absolute inset-0 pointer-events-none">
        {coins.map((coin, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl filter drop-shadow-lg"
            style={{ left: coin.x, top: coin.y }}
            initial={{ y: 0, rotate: 0 }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: coin.delay,
              ease: 'easeInOut',
            }}
            onHoverStart={() => setHoveredCoin(i)}
            onHoverEnd={() => setHoveredCoin(null)}
          >
            <motion.span
              animate={{
                scale: hoveredCoin === i ? 1.3 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              🪙
            </motion.span>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16">
        {/* Animated Title */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 10,
          }}
          className="text-center mb-12"
        >
          <motion.h1
            className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            {t('landing.playful.title')}
          </motion.h1>
          <motion.p
            className="text-2xl md:text-3xl text-gray-700 font-bold"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {t('landing.playful.subtitle')}
          </motion.p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 w-full max-w-5xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className={`bg-gradient-to-br ${feature.color} rounded-3xl p-6 text-center shadow-xl`}
              whileHover={{
                scale: 1.1,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
              }}
            >
              <motion.div
                className="text-5xl mb-3"
                animate={{ rotate: [-10, 10] }}
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
              <p className="text-white font-bold text-lg">{t(feature.titleKey)}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/auth/register"
              className="group relative inline-flex items-center justify-center px-10 py-5 text-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full overflow-hidden shadow-2xl"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600"
                initial={{ x: '100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative flex items-center gap-2">
                {t('landing.playful.cta.start')}
              </span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-10 py-5 text-2xl font-bold text-purple-600 bg-white rounded-full shadow-xl hover:shadow-2xl border-4 border-purple-200"
            >
              {t('landing.playful.cta.login')}
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Animation Hint */}
        <motion.div
          className="mt-16 text-gray-500 text-sm"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {t('landing.playful.hint')}
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <motion.path
            fill="#ffffff"
            fillOpacity="0.3"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            animate={{ d: [
              "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,170.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </div>
  )
}
