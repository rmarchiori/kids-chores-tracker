# Hybrid Design System Guide

## Overview
This application now uses the **Hybrid Design System** - a vibrant, 3D-interactive design language that combines the professional structure for parents with playful, engaging elements for kids.

## Design Principles

### 1. 3D Interactive Elements
All interactive components should have depth and respond to user interaction:
```tsx
<motion.button
  whileHover={{ scale: 1.05, y: -5 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
>
  Content
</motion.button>
```

### 2. Gradient Backgrounds
Use vibrant gradient combinations instead of flat colors:

#### Parent-Focused Components
- Primary: `from-blue-600 via-blue-700 to-indigo-800`
- Secondary: `from-indigo-600 to-cyan-600`

#### Kid-Focused Components
- Primary: `from-purple-600 to-pink-600`
- Secondary: `from-pink-400 to-rose-400`

#### Hybrid/General Components
- Welcome: `from-blue-600 via-purple-600 to-pink-600`
- Success: `from-green-600 to-cyan-600`
- Info: `from-cyan-400 to-teal-400`

### 3. Framer Motion Animations
All pages should use `framer-motion` for smooth, performant animations:

```tsx
import { motion } from 'framer-motion'

// Page entrance
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {content}
</motion.div>

// Icon animations
<motion.div
  animate={{ rotate: [-5, 5] }}
  transition={{
    duration: 2,
    repeat: Infinity,
    repeatType: 'reverse'
  }}
>
  {emoji}
</motion.div>
```

### 4. Modern Rounded UI
- Cards: `rounded-3xl shadow-2xl`
- Buttons: `rounded-xl shadow-lg`
- Inputs: `rounded-lg`
- Modals: `rounded-3xl backdrop-blur-md`

### 5. Typography
- Headers: `font-black` (900 weight)
- Subheadings: `font-bold` (700 weight)
- Body: `font-medium` (500 weight)
- Captions: `font-normal` (400 weight)

## Component Patterns

### Feature Cards
```tsx
<motion.button
  onClick={handleClick}
  className="bg-gradient-to-br from-blue-400 to-cyan-400 rounded-3xl shadow-2xl p-6 text-left text-white"
  whileHover={{ scale: 1.05, y: -5 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
>
  <motion.div
    className="text-5xl mb-4"
    animate={{ rotate: [-5, 5] }}
    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
  >
    👨‍👩‍👧‍👦
  </motion.div>
  <h3 className="text-xl font-bold mb-2">Title</h3>
  <p className="text-white/90 text-sm">Description</p>
</motion.button>
```

### Form Pages (Auth, Settings)
```tsx
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4 relative overflow-hidden">
  {/* Animated Background Pattern */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute inset-0" style={{
      backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
      backgroundSize: '50px 50px',
    }} />
  </div>

  <motion.div
    className="w-full max-w-md relative z-10"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {/* Form content */}
  </motion.div>
</div>
```

### Interactive Buttons
```tsx
<motion.button
  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg"
  whileHover={{ scale: 1.02, y: -2 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
>
  Button Text
</motion.button>
```

## Color Palette

### Gradients by Use Case
- **Family/Parent Features**: Blue → Cyan, Indigo → Blue
- **Child Features**: Purple → Pink, Pink → Rose
- **Tasks**: Indigo → Blue, Pink → Rose
- **Reviews/Rewards**: Yellow → Orange
- **Analytics**: Cyan → Teal
- **Settings**: Purple → Indigo
- **Success States**: Green → Cyan
- **Error States**: Red → Rose
- **Disabled**: Gray → Gray (with reduced opacity)

## Animation Timing
- **Page Transitions**: 0.5s duration
- **Hover Effects**: Spring (stiffness: 400, damping: 25)
- **Icon Animations**: 2s duration, infinite repeat
- **Staggered Delays**: 0.1-0.2s between elements

## Accessibility
- Maintain color contrast ratios (WCAG AA minimum)
- Reduce motion for users with `prefers-reduced-motion`
- Ensure all interactive elements have focus states
- Keep text readable on gradient backgrounds (white text on vibrant gradients)

## Implementation Status

### ✅ Completed
- Landing page (HybridHero only)
- Auth pages (login, register, reset password, etc.)
- Onboarding flow
- Dashboard/home page with all feature cards

### 📋 Ready for Implementation
Following the established patterns above, these pages should be updated:
- Children management pages
- Task management pages
- Calendar & reviews pages
- Analytics & rewards pages
- Settings & configuration pages
- Special pages (cast receiver, invite, etc.)

## Migration Checklist
When updating a page to hybrid design:
1. ✅ Import `{ motion }` from 'framer-motion'
2. ✅ Replace divs/buttons with motion components
3. ✅ Apply gradient backgrounds (remove plain white)
4. ✅ Add 3D hover effects (scale + translateY)
5. ✅ Use rounded-3xl and shadow-2xl
6. ✅ Animate icons with subtle transformations
7. ✅ Add page entrance animations
8. ✅ Update typography to use font-black/font-bold
9. ✅ Test animations and accessibility
10. ✅ Verify responsive design on mobile

## Examples

See the following files for reference implementations:
- `/src/app/page.tsx` - Landing page
- `/src/components/landing/HybridHero.tsx` - Complete hybrid design showcase
- `/src/app/auth/login/page.tsx` - Auth page pattern
- `/src/app/dashboard/page.tsx` - Dashboard with feature cards
- `/src/app/onboarding/page.tsx` - Onboarding flow

---

**Design System Version**: 1.0
**Last Updated**: Sprint 2 Completion
**Maintainer**: Development Team
