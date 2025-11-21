'use client'

import { motion } from 'framer-motion'

export default function ThemeTestPage() {
  const gradients = [
    {
      name: 'Parent Primary',
      gradient: 'from-blue-600 via-blue-700 to-indigo-800',
      category: 'Parent-Focused',
      emoji: '👨‍👩‍👧‍👦'
    },
    {
      name: 'Parent Secondary',
      gradient: 'from-indigo-600 to-cyan-600',
      category: 'Parent-Focused',
      emoji: '⚙️'
    },
    {
      name: 'Kid Primary',
      gradient: 'from-purple-600 to-pink-600',
      category: 'Kid-Focused',
      emoji: '🎨'
    },
    {
      name: 'Kid Secondary',
      gradient: 'from-pink-400 to-rose-400',
      category: 'Kid-Focused',
      emoji: '🌈'
    },
    {
      name: 'Welcome Hybrid',
      gradient: 'from-blue-600 via-purple-600 to-pink-600',
      category: 'Hybrid/General',
      emoji: '👋'
    },
    {
      name: 'Success',
      gradient: 'from-green-600 to-cyan-600',
      category: 'Hybrid/General',
      emoji: '✅'
    },
    {
      name: 'Info',
      gradient: 'from-cyan-400 to-teal-400',
      category: 'Hybrid/General',
      emoji: 'ℹ️'
    },
    {
      name: 'Family Features',
      gradient: 'from-blue-400 to-cyan-400',
      category: 'Feature Cards',
      emoji: '👨‍👩‍👧‍👦'
    },
    {
      name: 'Children',
      gradient: 'from-purple-400 to-pink-400',
      category: 'Feature Cards',
      emoji: '👥'
    },
    {
      name: 'Tasks',
      gradient: 'from-indigo-400 to-blue-400',
      category: 'Feature Cards',
      emoji: '📋'
    },
    {
      name: 'Daily Tasks',
      gradient: 'from-pink-400 to-rose-400',
      category: 'Feature Cards',
      emoji: '✅'
    },
    {
      name: 'Reviews/Rewards',
      gradient: 'from-yellow-400 to-orange-400',
      category: 'Feature Cards',
      emoji: '⭐'
    },
    {
      name: 'Analytics',
      gradient: 'from-cyan-400 to-teal-400',
      category: 'Feature Cards',
      emoji: '📊'
    },
    {
      name: 'Settings',
      gradient: 'from-purple-400 to-indigo-400',
      category: 'Feature Cards',
      emoji: '⚙️'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-6xl font-black text-white mb-4"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          >
            🎨 Hybrid Design System Showcase
          </motion.h1>
          <p className="text-xl text-white/90 font-bold">
            All gradient combinations and animations
          </p>
        </motion.div>

        {/* Gradient Cards Grid */}
        {['Parent-Focused', 'Kid-Focused', 'Hybrid/General', 'Feature Cards'].map((category, catIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: catIndex * 0.1 }}
          >
            <h2 className="text-3xl font-black text-white mb-6">{category}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {gradients
                .filter(g => g.category === category)
                .map((item, index) => (
                  <motion.div
                    key={item.name}
                    className={`bg-gradient-to-br ${item.gradient} rounded-3xl shadow-2xl p-6 text-white`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (catIndex * 0.1) + (index * 0.05) }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="text-5xl mb-4"
                      animate={{ rotate: [-5, 5] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        delay: index * 0.2
                      }}
                    >
                      {item.emoji}
                    </motion.div>
                    <h3 className="text-xl font-black mb-2">{item.name}</h3>
                    <p className="text-white/90 text-sm font-bold">
                      {item.gradient}
                    </p>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        ))}

        {/* Interactive Button Examples */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-3xl font-black text-white mb-6">Interactive Buttons</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.button
              className="py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              Primary Action
            </motion.button>
            <motion.button
              className="py-3 px-4 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              Success Action
            </motion.button>
            <motion.button
              className="py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              Kid-Friendly Action
            </motion.button>
            <motion.button
              className="py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              Reward Action
            </motion.button>
            <motion.button
              className="py-3 px-4 border-2 border-white hover:bg-white/10 text-white font-bold rounded-xl"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              Outline Button
            </motion.button>
            <motion.button
              className="py-3 px-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-bold rounded-xl"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              Glass Button
            </motion.button>
          </div>
        </motion.div>

        {/* Typography Examples */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-3xl font-black text-white mb-6">Typography Scale</h2>
          <div className="space-y-4 text-white">
            <p className="text-6xl font-black">Heading Black (900)</p>
            <p className="text-4xl font-bold">Subheading Bold (700)</p>
            <p className="text-2xl font-medium">Body Medium (500)</p>
            <p className="text-xl font-normal">Caption Normal (400)</p>
          </div>
        </motion.div>

        {/* Animation Patterns */}
        <motion.div
          className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h2 className="text-3xl font-black text-white mb-6">Animation Patterns</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <motion.div
                className="text-6xl mb-2"
                animate={{ rotate: [-5, 5] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              >
                🎯
              </motion.div>
              <p className="text-white font-bold text-sm">Subtle Rotate</p>
            </div>
            <div>
              <motion.div
                className="text-6xl mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⭐
              </motion.div>
              <p className="text-white font-bold text-sm">Pulse Scale</p>
            </div>
            <div>
              <motion.div
                className="text-6xl mb-2"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎈
              </motion.div>
              <p className="text-white font-bold text-sm">Bounce Float</p>
            </div>
            <div>
              <motion.div
                className="text-6xl mb-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                ⚙️
              </motion.div>
              <p className="text-white font-bold text-sm">Continuous Spin</p>
            </div>
          </div>
        </motion.div>

        {/* Design System Info */}
        <motion.div
          className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          whileHover={{ scale: 1.01, y: -2 }}
        >
          <h2 className="text-4xl font-black mb-4">Hybrid Design System v1.0</h2>
          <p className="text-xl font-bold mb-4">
            Professional structure for parents • Playful engagement for kids
          </p>
          <p className="text-white/90 font-medium">
            All components use framer-motion for smooth animations, gradient backgrounds for visual appeal,
            and 3D hover effects for interactivity. Typography follows a clear hierarchy with font-black
            for headers, font-bold for subheadings, and proper contrast ratios for accessibility.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
