# Theming System - Quick Start Guide

Fast implementation reference for the Kids Chores Tracker theming system.

## 5-Minute Setup

### 1. Import and Use Theme Hook

```typescript
import { useTheme } from '@/contexts/ThemeContext'

function MyComponent() {
  const { theme, setTheme } = useTheme()
  // theme is 'young' | 'older' | 'parent'
}
```

### 2. Apply Theme Classes

```typescript
// Use predefined Tailwind classes
<button className="bg-young-primary text-white rounded-young p-young-card">
  Young Theme Button
</button>

<button className="bg-older-primary text-white rounded-older p-older-card">
  Older Theme Button
</button>

<button className="bg-parent-primary text-white rounded-parent p-parent-card">
  Parent Theme Button
</button>
```

### 3. Use CSS Variables (Recommended)

```typescript
// Dynamic theming - works with any active theme
<button className="btn-primary">
  Adapts to Active Theme
</button>

<div className="card">
  <h2 className="text-themed">Title</h2>
  <p className="text-themed-secondary">Description</p>
</div>
```

### 4. Get Theme-Specific Classes Programmatically

```typescript
import { useThemeClasses } from '@/contexts/ThemeContext'

function DynamicButton() {
  const { button, card } = useThemeClasses()

  return (
    <>
      <button className={button('primary')}>Primary Button</button>
      <div className={card()}>Card Content</div>
    </>
  )
}
```

## Common Patterns

### Pattern 1: Theme Selector in Settings

```typescript
import { ThemeSelector } from '@/components/theme/ThemeSelector'

function ChildSettings({ child }) {
  const handleSave = async (preference) => {
    await fetch(`/api/children/${child.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ theme_preference: preference })
    })
  }

  return (
    <ThemeSelector
      ageGroup={child.age_group}
      currentPreference={child.theme_preference}
      onSave={handleSave}
    />
  )
}
```

### Pattern 2: Load Theme from Database

```typescript
'use client'

import { useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { resolveTheme } from '@/lib/themes'

export function ThemeLoader({ child }) {
  const { setTheme } = useTheme()

  useEffect(() => {
    const actualTheme = resolveTheme(
      child.theme_preference,
      child.age_group
    )
    setTheme(actualTheme)
  }, [child, setTheme])

  return null
}

// Usage in layout
<ThemeProvider>
  <ThemeLoader child={currentChild} />
  {children}
</ThemeProvider>
```

### Pattern 3: Conditional Content by Theme

```typescript
import { useTheme } from '@/contexts/ThemeContext'

function AdaptiveIcon() {
  const { theme } = useTheme()

  return (
    <div className={
      theme === 'young' ? 'w-12 h-12' :
      theme === 'older' ? 'w-10 h-10' :
      'w-6 h-6'
    }>
      {/* Icon content */}
    </div>
  )
}
```

### Pattern 4: Theme-Aware Card

```typescript
function TaskCard({ task }) {
  const { classes } = useThemeClasses()

  return (
    <div className={classes.card}>
      <h3 className={classes.text}>{task.title}</h3>
      <p className={classes.textSecondary}>{task.description}</p>
      <button className={classes.primary}>
        Complete Task
      </button>
    </div>
  )
}
```

## Component Examples

### Example 1: Simple Button

```typescript
// Using CSS variables (best practice)
<button className="btn-primary">
  Click Me
</button>

// Using theme-specific classes
<button className="bg-young-primary hover:bg-young-primary-hover text-white rounded-young p-4">
  Click Me
</button>
```

### Example 2: Card Component

```typescript
function Card({ title, children }) {
  return (
    <div className="card">
      <h3 className="text-themed font-semibold mb-2">{title}</h3>
      <div className="text-themed-secondary">
        {children}
      </div>
    </div>
  )
}
```

### Example 3: Form Input

```typescript
function ThemedInput({ label, ...props }) {
  const { theme } = useTheme()

  return (
    <div className="space-y-2">
      <label className="text-themed font-medium">
        {label}
      </label>
      <input
        {...props}
        className="
          w-full px-4 py-2
          border border-themed
          rounded-[var(--border-radius)]
          focus:ring-2 focus:ring-[var(--focus-ring-color)]
          text-themed
          bg-themed-surface
        "
        style={{ minHeight: 'var(--touch-target-min)' }}
      />
    </div>
  )
}
```

### Example 4: Status Badge

```typescript
function StatusBadge({ status }) {
  const getStatusClass = () => {
    switch (status) {
      case 'completed':
        return 'bg-themed-success text-white'
      case 'pending':
        return 'bg-[var(--color-pending)] text-gray-900'
      case 'rejected':
        return 'bg-[var(--color-urgent)] text-white'
      default:
        return 'bg-gray-200 text-gray-900'
    }
  }

  return (
    <span className={`
      px-3 py-1 rounded-full text-sm font-medium
      ${getStatusClass()}
    `}>
      {status}
    </span>
  )
}
```

## API Reference

### Hooks

#### `useTheme()`
```typescript
const { theme, setTheme } = useTheme()
// theme: 'young' | 'older' | 'parent'
// setTheme: (theme: ThemeType) => void
```

#### `useThemeClasses()`
```typescript
const { theme, classes, button, card } = useThemeClasses()
// classes: Complete theme class object
// button: (variant?) => string
// card: () => string
```

### Utility Functions

#### `getThemeConfig(theme)`
```typescript
import { getThemeConfig } from '@/lib/themes'

const config = getThemeConfig('young')
// Returns complete theme configuration object
```

#### `resolveTheme(preference, ageGroup)`
```typescript
import { resolveTheme } from '@/lib/themes'

const theme = resolveTheme('age-default', '5-8')
// Returns 'young'
```

#### `getThemeClasses(theme)`
```typescript
import { getThemeClasses } from '@/lib/themes'

const classes = getThemeClasses('young')
// Returns object with all theme classes
```

### CSS Variables

All available CSS variables:

```css
/* Colors */
var(--color-primary)
var(--color-primary-hover)
var(--color-success)
var(--color-success-hover)
var(--color-pending)
var(--color-warning)
var(--color-urgent)
var(--color-bg)
var(--color-surface)
var(--color-text)
var(--color-text-secondary)
var(--color-border)

/* Typography */
var(--font-size-base)
var(--font-weight-base)
var(--line-height-base)

/* Spacing */
var(--border-radius)
var(--card-padding)
var(--icon-size)

/* Accessibility */
var(--touch-target-min)
var(--focus-ring-color)
var(--focus-ring-width)
```

## Tailwind Classes Reference

### Color Classes

```typescript
// Young theme
'bg-young-primary'
'bg-young-success'
'bg-young-pending'
'text-young-text'

// Older theme
'bg-older-primary'
'bg-older-success'
'bg-older-pending'
'text-older-text'

// Parent theme
'bg-parent-primary'
'bg-parent-success'
'bg-parent-warning'
'bg-parent-urgent'
'text-parent-text'
```

### Spacing Classes

```typescript
// Border radius
'rounded-young'  // 16px
'rounded-older'  // 12px
'rounded-parent' // 8px

// Padding
'p-young-card'  // 24px
'p-older-card'  // 20px
'p-parent-card' // 16px
```

### Typography Classes

```typescript
// Font size
'text-young'  // 18px
'text-older'  // 16px
'text-parent' // 14px

// Font weight
'font-young'  // 600
'font-older'  // 500
'font-parent' // 400
```

## Troubleshooting

### Issue: Theme not applying
**Solution**: Check ThemeProvider is in layout.tsx

### Issue: Wrong theme on page load
**Solution**: Set initialTheme or load from database

### Issue: CSS variables not working
**Solution**: Check globals.css is imported in layout.tsx

### Issue: TypeScript errors
**Solution**: Import types from `@/lib/themes`

## Best Practices

1. **Use CSS variables for dynamic content** - They adapt automatically
2. **Use theme-specific classes for static content** - Better performance
3. **Always provide fallbacks** - Handle missing theme gracefully
4. **Test all themes** - Verify appearance in each theme
5. **Respect accessibility** - Use provided touch targets and focus styles
6. **Memoize expensive operations** - Use useMemo for class generation
7. **Validate contrast** - Use accessibility utilities for custom colors

## Next Steps

- Read full documentation: `docs/THEMING-SYSTEM.md`
- Review accessibility: `src/lib/themes/accessibility.ts`
- Check examples: `src/components/theme/`
- Test with: `npm run test`
