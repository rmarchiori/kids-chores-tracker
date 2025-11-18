# Sprint 1.1: Age-Specific Theming System

**Sprint Duration**: 22 hours (part of enhanced Sprint 1.1)
**Dependencies**: Sprint 0.3 (Onboarding complete)
**Status**: ⏳ NOT STARTED

---

## Overview

Implement an age-appropriate theming system that provides vibrant, playful colors for younger children (5-8) and more mature, colorful styling for older children (9-12), while maintaining professional, calming aesthetics for parent views.

## Goals

1. **Enhance Child Engagement**: Age-appropriate visual design increases task completion motivation
2. **Support Development**: Match UI complexity to cognitive development stages
3. **Maintain Accessibility**: WCAG AA contrast compliance on all theme variations
4. **Enable Personalization**: Allow theme switching per child for flexibility

---

## Design Specifications

### Theme Definitions

#### 5-8 Years Theme: "Bright & Playful"
**Target Users**: Early readers, high energy, need clear visual cues

**Color Palette**:
```typescript
const youngTheme = {
  primary: '#FF6B6B',      // Vibrant coral - Energy and excitement
  primaryHover: '#FF5252',
  success: '#4ECDC4',      // Bright teal - Achievement and growth
  successHover: '#45B7AF',
  pending: '#FFE66D',      // Sunny yellow - Pending tasks (not urgent)
  pendingHover: '#FFD93D',
  background: '#F7F7FF',   // Very light purple - Soft, non-distracting
  surface: '#FFFFFF',      // Pure white for cards
  text: '#2D3748',         // Dark gray for readability
  textSecondary: '#4A5568',
  border: '#E2E8F0',
}
```

**Typography**:
- Font size: 18px base (larger for readability)
- Font weight: 600 (semi-bold for emphasis)
- Line height: 1.6 (generous spacing)

**Spacing**:
- Padding: Generous (24px cards, 16px elements)
- Border radius: 16px (rounded, friendly)
- Icon size: 48px (large, easy to tap)

---

#### 9-12 Years Theme: "Cool & Mature"
**Target Users**: Confident readers, developing independence, prefer "grown-up" design

**Color Palette**:
```typescript
const olderTheme = {
  primary: '#6C5CE7',      // Cool purple - Confidence and creativity
  primaryHover: '#5F4FD1',
  success: '#00B894',      // Rich green - Accomplishment
  successHover: '#00A884',
  pending: '#FDCB6E',      // Warm yellow - Friendly reminder
  pendingHover: '#FCBF49',
  background: '#DFE6E9',   // Light blue-gray - Sophisticated
  surface: '#FFFFFF',
  text: '#2D3748',
  textSecondary: '#4A5568',
  border: '#CBD5E0',
}
```

**Typography**:
- Font size: 16px base (standard readable size)
- Font weight: 500 (medium weight)
- Line height: 1.5 (comfortable spacing)

**Spacing**:
- Padding: Moderate (20px cards, 12px elements)
- Border radius: 12px (slightly rounded)
- Icon size: 40px (standard size)

---

#### Parent Theme: "Calm & Professional"
**Target Users**: Parents managing family tasks, need clarity and efficiency

**Color Palette**:
```typescript
const parentTheme = {
  primary: '#0984E3',      // Trustworthy blue - Calm and reliable
  primaryHover: '#0770D0',
  success: '#00B894',      // Forest green - Positive outcomes
  successHover: '#00A884',
  warning: '#FDCB6E',      // Soft yellow - Attention needed
  warningHover: '#FCBF49',
  urgent: '#D63031',       // Soft red - Overdue (use sparingly)
  urgentHover: '#C12728',
  background: '#FFFFFF',   // Clean white
  surface: '#F8F9FA',      // Very light gray for cards
  text: '#2D3748',
  textSecondary: '#718096',
  border: '#E2E8F0',
}
```

**Typography**:
- Font size: 14px base (efficient information density)
- Font weight: 400 (regular weight)
- Line height: 1.5 (standard spacing)

**Spacing**:
- Padding: Compact (16px cards, 8px elements)
- Border radius: 8px (subtle rounding)
- Icon size: 24px (efficient use of space)

---

## Implementation Plan

### 1. Tailwind Configuration (2 hours)

**File**: `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Young theme (5-8)
        'young': {
          primary: '#FF6B6B',
          'primary-hover': '#FF5252',
          success: '#4ECDC4',
          'success-hover': '#45B7AF',
          pending: '#FFE66D',
          'pending-hover': '#FFD93D',
          bg: '#F7F7FF',
          surface: '#FFFFFF',
        },
        // Older theme (9-12)
        'older': {
          primary: '#6C5CE7',
          'primary-hover': '#5F4FD1',
          success: '#00B894',
          'success-hover': '#00A884',
          pending: '#FDCB6E',
          'pending-hover': '#FCBF49',
          bg: '#DFE6E9',
          surface: '#FFFFFF',
        },
        // Parent theme
        'parent': {
          primary: '#0984E3',
          'primary-hover': '#0770D0',
          success: '#00B894',
          'success-hover': '#00A884',
          warning: '#FDCB6E',
          'warning-hover': '#FCBF49',
          urgent: '#D63031',
          'urgent-hover': '#C12728',
          bg: '#FFFFFF',
          surface: '#F8F9FA',
        },
      },
      fontSize: {
        'young': '18px',
        'older': '16px',
        'parent': '14px',
      },
      borderRadius: {
        'young': '16px',
        'older': '12px',
        'parent': '8px',
      },
    },
  },
  plugins: [],
}

export default config
```

---

### 2. Theme Context & Hook (3 hours)

**File**: `src/lib/theme-context.tsx`

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type ThemeType = 'young' | 'older' | 'parent'

interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  initialTheme = 'parent'
}: {
  children: React.ReactNode
  initialTheme?: ThemeType
}) {
  const [theme, setTheme] = useState<ThemeType>(initialTheme)

  // Apply theme class to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

**File**: `src/lib/theme-utils.ts`

```typescript
export type ThemeType = 'young' | 'older' | 'parent'

export const getThemeFromAge = (ageGroup: '5-8' | '9-12'): ThemeType => {
  return ageGroup === '5-8' ? 'young' : 'older'
}

export const getThemeClasses = (theme: ThemeType) => {
  const baseClasses = {
    young: {
      primary: 'bg-young-primary hover:bg-young-primary-hover text-white',
      success: 'bg-young-success hover:bg-young-success-hover text-white',
      pending: 'bg-young-pending hover:bg-young-pending-hover text-gray-900',
      bg: 'bg-young-bg',
      surface: 'bg-young-surface',
      text: 'text-gray-800',
      textSize: 'text-young',
      borderRadius: 'rounded-young',
      padding: 'p-6',
      iconSize: 'w-12 h-12',
    },
    older: {
      primary: 'bg-older-primary hover:bg-older-primary-hover text-white',
      success: 'bg-older-success hover:bg-older-success-hover text-white',
      pending: 'bg-older-pending hover:bg-older-pending-hover text-gray-900',
      bg: 'bg-older-bg',
      surface: 'bg-older-surface',
      text: 'text-gray-800',
      textSize: 'text-older',
      borderRadius: 'rounded-older',
      padding: 'p-5',
      iconSize: 'w-10 h-10',
    },
    parent: {
      primary: 'bg-parent-primary hover:bg-parent-primary-hover text-white',
      success: 'bg-parent-success hover:bg-parent-success-hover text-white',
      warning: 'bg-parent-warning hover:bg-parent-warning-hover text-gray-900',
      urgent: 'bg-parent-urgent hover:bg-parent-urgent-hover text-white',
      bg: 'bg-parent-bg',
      surface: 'bg-parent-surface',
      text: 'text-gray-800',
      textSize: 'text-parent',
      borderRadius: 'rounded-parent',
      padding: 'p-4',
      iconSize: 'w-6 h-6',
    },
  }

  return baseClasses[theme]
}
```

---

### 3. Database Schema Update (1 hour)

**File**: `database/02-theming-schema.sql`

```sql
-- Add theme preference to children table
ALTER TABLE children
ADD COLUMN theme_preference TEXT DEFAULT 'age-default'
CHECK (theme_preference IN ('age-default', 'young', 'older'));

-- Add profile photo URL
ALTER TABLE children
ADD COLUMN profile_photo_url TEXT;

-- Update existing children to have age-default theme
UPDATE children
SET theme_preference = 'age-default'
WHERE theme_preference IS NULL;

-- Create index for faster theme queries
CREATE INDEX idx_children_theme ON children(theme_preference);
```

---

### 4. Theme Components (4 hours)

**File**: `src/components/theme/ThemeButton.tsx`

```typescript
'use client'

import { useTheme } from '@/lib/theme-context'
import { getThemeClasses } from '@/lib/theme-utils'

interface ThemeButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'pending' | 'warning' | 'urgent'
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function ThemeButton({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  className = ''
}: ThemeButtonProps) {
  const { theme } = useTheme()
  const themeClasses = getThemeClasses(theme)

  const variantClasses = {
    primary: themeClasses.primary,
    success: themeClasses.success,
    pending: themeClasses.pending,
    warning: theme === 'parent' ? themeClasses.warning : themeClasses.pending,
    urgent: theme === 'parent' ? themeClasses.urgent : themeClasses.primary,
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${themeClasses.borderRadius}
        ${themeClasses.padding}
        ${themeClasses.textSize}
        font-semibold
        transition-colors
        duration-200
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  )
}
```

**File**: `src/components/theme/ThemeCard.tsx`

```typescript
'use client'

import { useTheme } from '@/lib/theme-context'
import { getThemeClasses } from '@/lib/theme-utils'

interface ThemeCardProps {
  children: React.ReactNode
  className?: string
}

export function ThemeCard({ children, className = '' }: ThemeCardProps) {
  const { theme } = useTheme()
  const themeClasses = getThemeClasses(theme)

  return (
    <div
      className={`
        ${themeClasses.surface}
        ${themeClasses.borderRadius}
        ${themeClasses.padding}
        shadow-md
        border border-gray-200
        ${className}
      `}
    >
      {children}
    </div>
  )
}
```

**File**: `src/components/theme/ThemeSwitcher.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/theme-context'
import type { ThemeType } from '@/lib/theme-utils'

interface ThemeSwitcherProps {
  childId: string
  currentPreference: string
  onSave: (preference: string) => Promise<void>
}

export function ThemeSwitcher({
  childId,
  currentPreference,
  onSave
}: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme()
  const [saving, setSaving] = useState(false)

  const handleThemeChange = async (newTheme: string) => {
    setSaving(true)
    try {
      await onSave(newTheme)
      // If not age-default, apply immediately
      if (newTheme !== 'age-default') {
        setTheme(newTheme as ThemeType)
      }
    } catch (error) {
      console.error('Failed to save theme preference:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Theme Preference
      </label>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleThemeChange('age-default')}
          disabled={saving}
          className={`
            p-3 rounded-lg border-2 transition-all
            ${currentPreference === 'age-default'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'}
            ${saving ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="text-sm font-medium">Auto</div>
          <div className="text-xs text-gray-500">Age-based</div>
        </button>

        <button
          onClick={() => handleThemeChange('young')}
          disabled={saving}
          className={`
            p-3 rounded-lg border-2 transition-all
            ${currentPreference === 'young'
              ? 'border-young-primary bg-young-bg'
              : 'border-gray-300 hover:border-gray-400'}
            ${saving ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="text-sm font-medium">Bright</div>
          <div className="text-xs text-gray-500">5-8 style</div>
        </button>

        <button
          onClick={() => handleThemeChange('older')}
          disabled={saving}
          className={`
            p-3 rounded-lg border-2 transition-all
            ${currentPreference === 'older'
              ? 'border-older-primary bg-older-bg'
              : 'border-gray-300 hover:border-gray-400'}
            ${saving ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="text-sm font-medium">Cool</div>
          <div className="text-xs text-gray-500">9-12 style</div>
        </button>
      </div>
    </div>
  )
}
```

---

### 5. API Route for Theme Updates (2 hours)

**File**: `src/app/api/children/[id]/theme/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const themeUpdateSchema = z.object({
  theme_preference: z.enum(['age-default', 'young', 'older']),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const { theme_preference } = themeUpdateSchema.parse(body)

    // Verify user has access to this child's family
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('family_id')
      .eq('id', params.id)
      .single()

    if (childError || !child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    // Verify user is member of this family
    const { data: membership } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', child.family_id)
      .eq('user_id', session.user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update theme preference
    const { data: updatedChild, error: updateError } = await supabase
      .from('children')
      .update({ theme_preference })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updatedChild)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

### 6. Responsive Navigation (10 hours)

**Desktop/Tablet - Left Sidebar Navigation**

**File**: `src/components/navigation/Sidebar.tsx`

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  UsersIcon,
  ClipboardListIcon,
  ChartBarIcon,
  CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Children', href: '/dashboard/children', icon: UsersIcon },
  { name: 'Tasks', href: '/dashboard/tasks', icon: ClipboardListIcon },
  { name: 'Reports', href: '/dashboard/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={`
        hidden md:flex md:flex-col
        fixed inset-y-0 left-0
        bg-white border-r border-gray-200
        transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo/Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gray-900">Chores Tracker</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 rounded-lg
                transition-colors duration-200
                ${isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'}
                ${collapsed ? 'justify-center' : 'justify-start'}
              `}
            >
              <Icon className="w-6 h-6 flex-shrink-0" />
              {!collapsed && (
                <span className="ml-3 text-sm font-medium">{item.name}</span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

**Mobile - Bottom Navigation Bar**

**File**: `src/components/navigation/BottomNav.tsx`

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  UsersIcon,
  ClipboardListIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Children', href: '/dashboard/children', icon: UsersIcon },
  { name: 'Tasks', href: '/dashboard/tasks', icon: ClipboardListIcon },
  { name: 'Reports', href: '/dashboard/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom">
      <div className="flex justify-around">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center
                flex-1 py-2 px-1
                transition-colors duration-200
                ${isActive ? 'text-blue-600' : 'text-gray-600'}
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

---

## Testing Checklist

### Visual Testing
- [ ] All three themes display correctly
- [ ] Color contrast meets WCAG AA standards (test with Wave or Lighthouse)
- [ ] Typography scales appropriately per theme
- [ ] Spacing and padding correct per theme

### Functional Testing
- [ ] Theme switcher saves preference to database
- [ ] Theme persists across page reloads
- [ ] Age-default theme applies correct theme based on age group
- [ ] Manual theme override works correctly

### Responsive Testing
- [ ] Left sidebar displays on desktop/tablet (≥768px)
- [ ] Sidebar collapses and expands correctly
- [ ] Bottom navigation displays on mobile (<768px)
- [ ] Navigation active states work correctly
- [ ] Touch targets are ≥48px on mobile

### Accessibility Testing
- [ ] Keyboard navigation works on all nav elements
- [ ] Screen reader announces theme changes
- [ ] Focus indicators visible on all interactive elements
- [ ] Color is not the only means of conveying information

---

## Rollout Strategy

1. **Phase 1**: Deploy theme infrastructure (context, utils, components)
2. **Phase 2**: Update children management UI to use theming
3. **Phase 3**: Add theme switcher to child profile settings
4. **Phase 4**: Migrate all existing UI components to use theming
5. **Phase 5**: User acceptance testing with families

---

## Success Metrics

- **Engagement**: 20% increase in child task completion after theming (measure post-launch)
- **Accessibility**: 100% WCAG AA compliance on all themes
- **Performance**: <50ms theme switching delay
- **Adoption**: 60% of families customize at least one child's theme

---

## Post-MVP Enhancements (Future)

- [ ] Custom color picker for parent-defined themes
- [ ] Dark mode variants for all themes
- [ ] Holiday/seasonal theme variations
- [ ] Theme animations and transitions
- [ ] Theme preview before saving
