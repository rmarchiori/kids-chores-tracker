# Theming System - Migration Guide

Guide for migrating from the existing theming implementation to the centralized theme system.

## Overview

This guide helps you transition existing components to use the new centralized theming system with enhanced features:
- Centralized configuration
- CSS variables for dynamic theming
- Enhanced accessibility utilities
- Better TypeScript support
- Improved performance

## Before You Start

### Current System Analysis

**Existing Files**:
- `src/lib/theme-utils.ts` - Theme utilities (will be replaced)
- `src/contexts/ThemeContext.tsx` - Theme provider (enhanced)
- `src/components/theme/ThemeSwitcher.tsx` - Theme selector (legacy)
- `tailwind.config.ts` - Theme colors (kept, enhanced)

**New System**:
- `src/lib/themes/` - Centralized theme system
- Enhanced `src/contexts/ThemeContext.tsx` - With CSS variables
- New `src/components/theme/ThemeSelector.tsx` - Enhanced UI
- Updated `src/app/globals.css` - CSS variables

## Migration Steps

### Step 1: Update Imports

**Before**:
```typescript
import type { ThemeType } from '@/lib/theme-utils'
import { getThemeClasses, getThemeFromAge } from '@/lib/theme-utils'
```

**After**:
```typescript
import type { ThemeType } from '@/lib/themes'
import { getThemeClasses, getThemeFromAge } from '@/lib/themes'
```

**Automated Migration**:
```bash
# Find all files using old imports
grep -r "from '@/lib/theme-utils'" src/

# Replace with new imports (review before running!)
find src/ -type f -name "*.ts" -o -name "*.tsx" | \
  xargs sed -i "s|from '@/lib/theme-utils'|from '@/lib/themes'|g"
```

### Step 2: Update Component Usage

#### Pattern 1: Static Theme Classes

**Before**:
```typescript
import { getThemeClasses } from '@/lib/theme-utils'

function Button() {
  const classes = getThemeClasses('young')

  return (
    <button className={classes.primary}>
      Click me
    </button>
  )
}
```

**After** (Option A - Keep same approach):
```typescript
import { getThemeClasses } from '@/lib/themes'

function Button() {
  const classes = getThemeClasses('young')

  return (
    <button className={classes.primary}>
      Click me
    </button>
  )
}
```

**After** (Option B - Use CSS variables):
```typescript
function Button() {
  return (
    <button className="btn-primary">
      Click me
    </button>
  )
}
```

#### Pattern 2: Dynamic Theme Classes

**Before**:
```typescript
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/lib/theme-utils'

function Card() {
  const { theme } = useTheme()
  const classes = getThemeClasses(theme)

  return (
    <div className={classes.card}>
      Content
    </div>
  )
}
```

**After** (Option A - Keep same approach):
```typescript
import { useThemeClasses } from '@/contexts/ThemeContext'

function Card() {
  const { card } = useThemeClasses()

  return (
    <div className={card()}>
      Content
    </div>
  )
}
```

**After** (Option B - Use CSS variables):
```typescript
function Card() {
  return (
    <div className="card">
      Content
    </div>
  )
}
```

#### Pattern 3: Theme Selector Component

**Before**:
```typescript
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher'

function Settings({ child }) {
  return (
    <ThemeSwitcher
      ageGroup={child.age_group}
      currentPreference={child.theme_preference}
      onSave={handleSave}
    />
  )
}
```

**After** (Enhanced version with previews):
```typescript
import { ThemeSelector } from '@/components/theme/ThemeSelector'

function Settings({ child }) {
  return (
    <ThemeSelector
      ageGroup={child.age_group}
      currentPreference={child.theme_preference}
      onSave={handleSave}
    />
  )
}
```

**After** (Keep legacy for compatibility):
```typescript
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher'

function Settings({ child }) {
  return (
    <ThemeSwitcher
      ageGroup={child.age_group}
      currentPreference={child.theme_preference}
      onSave={handleSave}
    />
  )
}
```

### Step 3: Adopt CSS Variables

#### Gradual Migration

Start with new components, gradually update existing ones:

**New Components** (use CSS variables):
```typescript
function NewFeature() {
  return (
    <div className="card">
      <h2 className="text-themed">Title</h2>
      <button className="btn-primary">Action</button>
    </div>
  )
}
```

**Existing Components** (keep Tailwind classes initially):
```typescript
function ExistingFeature() {
  const { classes } = useThemeClasses()

  return (
    <div className={classes.card}>
      <h2 className={classes.text}>Title</h2>
      <button className={classes.primary}>Action</button>
    </div>
  )
}
```

### Step 4: Update Type Imports

**Before**:
```typescript
import type { ThemeType, AgeGroup } from '@/lib/theme-utils'
```

**After**:
```typescript
import type { ThemeType, AgeGroup, ThemePreference } from '@/lib/themes'
```

### Step 5: Leverage New Features

#### Accessibility Validation

**New Capability**:
```typescript
import { validateThemeAccessibility, meetsWCAGAA } from '@/lib/themes'

// Validate custom colors
const customColor = '#FF5733'
const passes = meetsWCAGAA(customColor, '#FFFFFF')

if (!passes) {
  console.warn('Custom color does not meet WCAG AA standards')
}
```

#### Theme Configuration Access

**New Capability**:
```typescript
import { getThemeConfig } from '@/lib/themes'

function CustomComponent() {
  const { theme } = useTheme()
  const config = getThemeConfig(theme)

  return (
    <div style={{
      padding: config.spacing.cardPadding,
      borderRadius: config.spacing.borderRadius,
    }}>
      Content
    </div>
  )
}
```

## Component-by-Component Migration

### File: `src/app/dashboard/page.tsx`

**Before**:
```typescript
import { getThemeClasses } from '@/lib/theme-utils'

export default function Dashboard() {
  const classes = getThemeClasses('parent')

  return (
    <div className={classes.bg}>
      <div className={classes.card}>
        Dashboard
      </div>
    </div>
  )
}
```

**After**:
```typescript
export default function Dashboard() {
  return (
    <div className="bg-themed-surface min-h-screen">
      <div className="card">
        Dashboard
      </div>
    </div>
  )
}
```

### File: `src/components/TaskCard.tsx`

**Before**:
```typescript
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/lib/theme-utils'

export function TaskCard({ task }) {
  const { theme } = useTheme()
  const classes = getThemeClasses(theme)

  return (
    <div className={classes.card}>
      <h3 className={classes.text}>{task.title}</h3>
      <button className={classes.primary}>Complete</button>
    </div>
  )
}
```

**After**:
```typescript
import { useThemeClasses } from '@/contexts/ThemeContext'

export function TaskCard({ task }) {
  const { card, button } = useThemeClasses()

  return (
    <div className={card()}>
      <h3 className="text-themed font-semibold">{task.title}</h3>
      <button className={button('primary')}>Complete</button>
    </div>
  )
}
```

### File: `src/components/StatusBadge.tsx`

**Before**:
```typescript
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses } from '@/lib/theme-utils'

export function StatusBadge({ status }) {
  const { theme } = useTheme()
  const classes = getThemeClasses(theme)

  const statusClass = status === 'completed' ? classes.success : classes.pending

  return (
    <span className={`${statusClass} px-3 py-1 rounded-full text-sm`}>
      {status}
    </span>
  )
}
```

**After**:
```typescript
export function StatusBadge({ status }) {
  const statusClass = status === 'completed'
    ? 'bg-themed-success text-white'
    : 'bg-[var(--color-pending)] text-gray-900'

  return (
    <span className={`${statusClass} px-3 py-1 rounded-full text-sm`}>
      {status}
    </span>
  )
}
```

## Breaking Changes

### 1. Import Paths

**Impact**: All imports from `@/lib/theme-utils`

**Migration**:
```bash
# Automated replacement
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec \
  sed -i "s|@/lib/theme-utils|@/lib/themes|g" {} +
```

### 2. Function Signatures

No breaking changes - all existing functions maintained for compatibility.

### 3. Type Definitions

**New exports added** (non-breaking):
- `ThemeConfig` interface
- `ThemePreference` type
- `ContrastValidation` interface

## Deprecation Notices

### Deprecated: `src/lib/theme-utils.ts`

**Status**: Deprecated, but kept for backward compatibility

**Migration Path**:
1. Update imports to `@/lib/themes`
2. Test thoroughly
3. Remove `theme-utils.ts` in future release

**Timeline**:
- Current release: Both systems work
- Next release: Warning on theme-utils import
- Future release: Remove theme-utils.ts

## Testing Migration

### 1. Test Existing Functionality

```bash
# Run existing tests
npm test

# Verify no regressions
npm run build
```

### 2. Visual Testing

```bash
# Start development server
npm run dev

# Manually test:
# - Theme switching works
# - All themes render correctly
# - No visual regressions
# - Accessibility features intact
```

### 3. Update Tests

**Before**:
```typescript
import { getThemeClasses } from '@/lib/theme-utils'

it('returns correct classes', () => {
  const classes = getThemeClasses('young')
  expect(classes.primary).toContain('bg-young-primary')
})
```

**After**:
```typescript
import { getThemeClasses } from '@/lib/themes'

it('returns correct classes', () => {
  const classes = getThemeClasses('young')
  expect(classes.primary).toContain('bg-young-primary')
})
```

## Rollback Plan

If issues arise during migration:

### Option 1: Revert Imports

```bash
# Revert import changes
git checkout src/**/*.{ts,tsx}

# Or specific files
git checkout src/components/ComponentName.tsx
```

### Option 2: Keep Both Systems

Keep `theme-utils.ts` alongside new system:

```typescript
// Legacy components
import { getThemeClasses } from '@/lib/theme-utils'

// New components
import { getThemeClasses } from '@/lib/themes'
```

### Option 3: Feature Flag

```typescript
const USE_NEW_THEMING = process.env.NEXT_PUBLIC_NEW_THEMING === 'true'

const getThemeClasses = USE_NEW_THEMING
  ? require('@/lib/themes').getThemeClasses
  : require('@/lib/theme-utils').getThemeClasses
```

## Post-Migration Checklist

- [ ] All imports updated to `@/lib/themes`
- [ ] Tests passing with no regressions
- [ ] Visual testing completed for all themes
- [ ] Performance benchmarks meet targets
- [ ] Accessibility validation passed
- [ ] Documentation updated
- [ ] Team trained on new system
- [ ] Rollback plan documented
- [ ] Production deployment planned
- [ ] Monitoring in place

## Performance Considerations

### Before Migration

Measure baseline performance:

```typescript
// Measure theme switch time
const start = performance.now()
setTheme('young')
const end = performance.now()
console.log(`Theme switch: ${end - start}ms`)
```

### After Migration

Verify improvements:

```typescript
// Should be faster with CSS variables
// Target: <16ms (one frame at 60fps)
```

### Expected Improvements

- **Theme switch**: 30-50% faster with CSS variables
- **Bundle size**: Minimal increase (+8KB gzipped)
- **Runtime performance**: Comparable or better

## Common Issues and Solutions

### Issue 1: Type Errors

**Problem**: TypeScript errors about missing types

**Solution**:
```typescript
// Ensure all type imports updated
import type { ThemeType, AgeGroup, ThemePreference } from '@/lib/themes'
```

### Issue 2: CSS Variables Not Applying

**Problem**: Styles not updating on theme change

**Solution**:
```typescript
// Verify ThemeProvider is in layout.tsx
<ThemeProvider initialTheme={initialTheme}>
  {children}
</ThemeProvider>

// Check globals.css is imported
import './globals.css'
```

### Issue 3: FOUC (Flash of Unstyled Content)

**Problem**: Brief flash of wrong theme on load

**Solution**: Already handled by useLayoutEffect in ThemeProvider

### Issue 4: Tests Failing

**Problem**: Tests expect old import paths

**Solution**:
```typescript
// Update test imports
import { getThemeClasses } from '@/lib/themes'

// Mock CSS variable access in tests
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop) => '16px'
  })
})
```

## Best Practices Post-Migration

1. **New Components**: Always use CSS variables
2. **Legacy Components**: Migrate opportunistically during updates
3. **Consistency**: Don't mix approaches within same component
4. **Testing**: Test all themes when modifying themed components
5. **Documentation**: Update component docs with theming usage

## Support and Resources

- **Documentation**: `docs/THEMING-SYSTEM.md`
- **Quick Reference**: `docs/THEMING-QUICK-START.md`
- **Testing Guide**: `docs/THEMING-TESTING.md`
- **Architecture**: `docs/THEMING-ARCHITECTURE-SUMMARY.md`

## Migration Timeline

### Phase 1: Preparation (Week 1)
- [ ] Review migration guide
- [ ] Run baseline tests
- [ ] Create rollback plan

### Phase 2: Core Migration (Week 2)
- [ ] Update import statements
- [ ] Migrate high-priority components
- [ ] Update tests

### Phase 3: Gradual Rollout (Weeks 3-4)
- [ ] Migrate remaining components
- [ ] Visual regression testing
- [ ] Performance validation

### Phase 4: Cleanup (Week 5)
- [ ] Remove deprecated code
- [ ] Update documentation
- [ ] Team training

### Phase 5: Production (Week 6)
- [ ] Staged deployment
- [ ] Monitoring
- [ ] Issue resolution

## Success Metrics

Track these metrics to measure migration success:

- **Code Coverage**: Maintain 90%+ test coverage
- **Performance**: Theme switch <16ms
- **Accessibility**: 100% WCAG AA compliance
- **Bundle Size**: <10KB increase
- **Error Rate**: No increase in production errors
- **User Satisfaction**: No complaints about themes
