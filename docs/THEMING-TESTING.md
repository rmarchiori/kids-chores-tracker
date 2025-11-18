# Theming System - Testing Guide

Comprehensive testing strategies for the theming system.

## Accessibility Testing

### Automated Contrast Validation

```typescript
import {
  validateThemeAccessibility,
  generateAccessibilityReport,
  meetsWCAGAA,
  getContrastRatio,
  THEME_CONFIGS
} from '@/lib/themes'

describe('WCAG AA Compliance', () => {
  describe('Theme Color Contrast', () => {
    it('all themes pass WCAG AA for normal text', () => {
      Object.entries(THEME_CONFIGS).forEach(([themeName, config]) => {
        const validations = validateThemeAccessibility(config.colors)

        validations.forEach(validation => {
          expect(validation.passes).toBe(true)
          expect(validation.ratio).toBeGreaterThanOrEqual(4.5)
        })
      })
    })

    it('young theme primary color has sufficient contrast', () => {
      const ratio = getContrastRatio('#DC143C', '#FFFFFF')
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })

    it('older theme primary color has sufficient contrast', () => {
      const passes = meetsWCAGAA('#6C5CE7', '#FFFFFF')
      expect(passes).toBe(true)
    })

    it('parent theme all states have sufficient contrast', () => {
      const config = THEME_CONFIGS.parent

      const tests = [
        { fg: '#FFFFFF', bg: config.colors.primary, name: 'Primary' },
        { fg: '#FFFFFF', bg: config.colors.success, name: 'Success' },
        { fg: '#FFFFFF', bg: config.colors.urgent, name: 'Urgent' },
        { fg: config.colors.text, bg: config.colors.pending, name: 'Pending' },
      ]

      tests.forEach(({ fg, bg, name }) => {
        const ratio = getContrastRatio(fg, bg)
        expect(ratio).toBeGreaterThanOrEqual(4.5)
      })
    })
  })

  describe('Accessibility Report Generation', () => {
    it('generates complete accessibility report', () => {
      const report = generateAccessibilityReport(THEME_CONFIGS)

      expect(report).toHaveProperty('young')
      expect(report).toHaveProperty('older')
      expect(report).toHaveProperty('parent')

      expect(report.young.length).toBeGreaterThan(0)
    })
  })
})
```

### Manual Accessibility Checklist

- [ ] All text/background combinations have 4.5:1 contrast minimum
- [ ] Large text (18px+) has 3:1 contrast minimum
- [ ] Focus indicators are visible on all interactive elements
- [ ] Touch targets meet 48px minimum (young) or 44px minimum (older/parent)
- [ ] Color is not the only means of conveying information
- [ ] Theme changes are announced to screen readers

### Keyboard Navigation Testing

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Keyboard Navigation', () => {
  it('theme selector is keyboard navigable', async () => {
    const user = userEvent.setup()

    render(<ThemeSelector {...props} />)

    const radioButtons = screen.getAllByRole('radio')

    // Tab through options
    await user.tab()
    expect(radioButtons[0]).toHaveFocus()

    await user.tab()
    expect(radioButtons[1]).toHaveFocus()

    // Arrow keys navigate within radio group
    await user.keyboard('{ArrowRight}')
    expect(radioButtons[2]).toHaveFocus()
  })

  it('buttons have visible focus indicators', async () => {
    const user = userEvent.setup()

    render(<button className="btn-primary">Test</button>)

    const button = screen.getByRole('button')
    await user.tab()

    expect(button).toHaveFocus()
    expect(button).toHaveStyle({
      outline: expect.stringContaining('solid')
    })
  })
})
```

### Screen Reader Testing

```typescript
describe('Screen Reader Announcements', () => {
  it('announces theme changes', () => {
    render(<ThemeSelector {...props} />)

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  it('provides descriptive labels for theme options', () => {
    render(<ThemeSelector {...props} />)

    const youngTheme = screen.getByLabelText(/Bright.*Playful/i)
    expect(youngTheme).toBeInTheDocument()
  })
})
```

## Component Testing

### Theme Provider Tests

```typescript
import { render, renderHook, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'

describe('ThemeProvider', () => {
  it('provides default theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    })

    expect(result.current.theme).toBe('parent')
  })

  it('accepts initial theme prop', () => {
    const wrapper = ({ children }) => (
      <ThemeProvider initialTheme="young">
        {children}
      </ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('young')
  })

  it('allows theme changes', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    })

    act(() => {
      result.current.setTheme('older')
    })

    expect(result.current.theme).toBe('older')
  })

  it('applies CSS variables on theme change', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    })

    act(() => {
      result.current.setTheme('young')
    })

    const root = document.documentElement
    expect(root.style.getPropertyValue('--color-primary')).toBe('#DC143C')
    expect(root.style.getPropertyValue('--border-radius')).toBe('16px')
  })

  it('sets data-theme attribute', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    })

    act(() => {
      result.current.setTheme('older')
    })

    expect(document.documentElement.getAttribute('data-theme')).toBe('older')
  })

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useTheme())
    }).toThrow('useTheme must be used within ThemeProvider')
  })
})
```

### Theme Selector Tests

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeSelector } from '@/components/theme/ThemeSelector'

describe('ThemeSelector', () => {
  const defaultProps = {
    ageGroup: '5-8' as const,
    currentPreference: 'age-default' as const,
    onSave: jest.fn().mockResolvedValue(undefined),
  }

  it('renders all theme options', () => {
    render(<ThemeSelector {...defaultProps} />)

    expect(screen.getByLabelText(/Auto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Bright.*Playful/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Cool.*Mature/i)).toBeInTheDocument()
  })

  it('shows current selection', () => {
    render(<ThemeSelector {...defaultProps} currentPreference="young" />)

    const youngOption = screen.getByLabelText(/Bright.*Playful/i)
    expect(youngOption).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onSave when theme changed', async () => {
    const user = userEvent.setup()
    const onSave = jest.fn().mockResolvedValue(undefined)

    render(<ThemeSelector {...defaultProps} onSave={onSave} />)

    const olderOption = screen.getByLabelText(/Cool.*Mature/i)
    await user.click(olderOption)

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('older')
    })
  })

  it('shows loading state during save', async () => {
    const user = userEvent.setup()
    const onSave = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<ThemeSelector {...defaultProps} onSave={onSave} />)

    const youngOption = screen.getByLabelText(/Bright.*Playful/i)
    await user.click(youngOption)

    expect(youngOption).toBeDisabled()
  })

  it('displays error message on save failure', async () => {
    const user = userEvent.setup()
    const onSave = jest.fn().mockRejectedValue(new Error('Save failed'))

    render(<ThemeSelector {...defaultProps} onSave={onSave} />)

    const youngOption = screen.getByLabelText(/Bright.*Playful/i)
    await user.click(youngOption)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('does not show parent theme by default', () => {
    render(<ThemeSelector {...defaultProps} />)

    expect(screen.queryByLabelText(/Professional/i)).not.toBeInTheDocument()
  })

  it('shows parent theme when requested', () => {
    render(<ThemeSelector {...defaultProps} showParentTheme />)

    expect(screen.getByLabelText(/Professional/i)).toBeInTheDocument()
  })
})
```

### Utility Function Tests

```typescript
import {
  getThemeFromAge,
  resolveTheme,
  getThemeClasses,
  isValidThemeForAge,
} from '@/lib/themes'

describe('Theme Utilities', () => {
  describe('getThemeFromAge', () => {
    it('returns young for 5-8', () => {
      expect(getThemeFromAge('5-8')).toBe('young')
    })

    it('returns older for 9-12', () => {
      expect(getThemeFromAge('9-12')).toBe('older')
    })
  })

  describe('resolveTheme', () => {
    it('resolves age-default to young for 5-8', () => {
      expect(resolveTheme('age-default', '5-8')).toBe('young')
    })

    it('resolves age-default to older for 9-12', () => {
      expect(resolveTheme('age-default', '9-12')).toBe('older')
    })

    it('uses explicit theme when specified', () => {
      expect(resolveTheme('older', '5-8')).toBe('older')
      expect(resolveTheme('young', '9-12')).toBe('young')
    })

    it('handles parent theme', () => {
      expect(resolveTheme('parent', '5-8')).toBe('parent')
    })
  })

  describe('getThemeClasses', () => {
    it('returns correct classes for young theme', () => {
      const classes = getThemeClasses('young')

      expect(classes.primary).toContain('bg-young-primary')
      expect(classes.borderRadius).toBe('rounded-young')
      expect(classes.textSize).toBe('text-young')
    })

    it('returns all required class properties', () => {
      const classes = getThemeClasses('parent')

      expect(classes).toHaveProperty('primary')
      expect(classes).toHaveProperty('success')
      expect(classes).toHaveProperty('card')
      expect(classes).toHaveProperty('button')
    })
  })

  describe('isValidThemeForAge', () => {
    it('age-default is always valid', () => {
      expect(isValidThemeForAge('age-default', '5-8')).toBe(true)
      expect(isValidThemeForAge('age-default', '9-12')).toBe(true)
    })

    it('parent theme is never valid for children', () => {
      expect(isValidThemeForAge('parent', '5-8')).toBe(false)
      expect(isValidThemeForAge('parent', '9-12')).toBe(false)
    })

    it('allows cross-age theme selection', () => {
      expect(isValidThemeForAge('young', '9-12')).toBe(true)
      expect(isValidThemeForAge('older', '5-8')).toBe(true)
    })
  })
})
```

## Visual Regression Testing

### Setup with Playwright

```typescript
// tests/visual/theme.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Theme Visual Regression', () => {
  test('young theme renders correctly', async ({ page }) => {
    await page.goto('/theme-test?theme=young')
    await expect(page).toHaveScreenshot('young-theme.png')
  })

  test('older theme renders correctly', async ({ page }) => {
    await page.goto('/theme-test?theme=older')
    await expect(page).toHaveScreenshot('older-theme.png')
  })

  test('parent theme renders correctly', async ({ page }) => {
    await page.goto('/theme-test?theme=parent')
    await expect(page).toHaveScreenshot('parent-theme.png')
  })

  test('theme switching has no visual glitches', async ({ page }) => {
    await page.goto('/theme-test')

    // Start with young theme
    await page.getByRole('button', { name: /young/i }).click()
    await page.waitForTimeout(100)

    // Switch to older
    await page.getByRole('button', { name: /older/i }).click()
    await page.waitForTimeout(100)

    await expect(page).toHaveScreenshot('theme-switch.png')
  })
})
```

## Performance Testing

```typescript
describe('Theme Performance', () => {
  it('theme switch completes within one frame', async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    })

    const startTime = performance.now()

    act(() => {
      result.current.setTheme('young')
    })

    const endTime = performance.now()
    const duration = endTime - startTime

    // Should complete within 16ms (60fps)
    expect(duration).toBeLessThan(16)
  })

  it('CSS variable updates are batched', () => {
    const setSpy = jest.spyOn(CSSStyleDeclaration.prototype, 'setProperty')

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    })

    act(() => {
      result.current.setTheme('young')
    })

    // All variables set in one batch
    expect(setSpy).toHaveBeenCalledTimes(
      Object.keys(getThemeCSSVariables('young')).length
    )

    setSpy.mockRestore()
  })
})
```

## Integration Testing

```typescript
describe('Theme Integration', () => {
  it('theme persists to database', async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    })

    // Mock API
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ theme_preference: 'young' })
    })

    // Change theme
    act(() => {
      result.current.setTheme('young')
    })

    // Verify API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/children'),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('young')
        })
      )
    })
  })

  it('theme loads from database on login', async () => {
    const mockChild = {
      id: '123',
      theme_preference: 'older',
      age_group: '9-12'
    }

    // Render with child data
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider initialTheme={resolveTheme(
          mockChild.theme_preference,
          mockChild.age_group
        )}>
          {children}
        </ThemeProvider>
      )
    })

    expect(result.current.theme).toBe('older')
  })
})
```

## Test Coverage Goals

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: All critical paths
- **Accessibility**: 100% WCAG AA compliance
- **Visual Regression**: All theme variations
- **Performance**: <16ms theme switches

## Running Tests

```bash
# All tests
npm test

# Accessibility only
npm test -- accessibility

# Visual regression
npm run test:visual

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

## Continuous Integration

```yaml
# .github/workflows/theme-tests.yml
name: Theme Tests

on: [push, pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- accessibility

  visual:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:visual

  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- performance
```
