# Tech Stack - Kids Chores Tracker

**Version**: 1.1
**Alignment**: 90% with 2025 industry best practices
**Cost**: $0/month (MVP free tier sufficient)

---

## Frontend (MVP)

### Next.js 14 + React 19
- **Why**: Modern framework with App Router, Server Components, automatic code splitting
- **Features**: File-based routing, SSR, SSG, API routes, image optimization
- **When**: Sprint 0.1 (project initialization)
- **Best Practice**: React Server Components by default, minimize 'use client' directives

### TypeScript 5.0+
- **Why**: Full type safety, better IDE support, fewer runtime errors
- **When**: Sprint 0.1 (enable strict mode in tsconfig.json)
- **Strict Mode**: Enable `strict: true`, `noUncheckedIndexedAccess: true`
- **Best Practice**: Type all props, function parameters, and return types

### Tailwind CSS 3.4+
- **Why**: Utility-first, small bundle (<15KB), excellent mobile support
- **Features**: Responsive design, dark mode ready, CSS variables support
- **When**: Sprint 0.1 configuration
- **Best Practice**: Mobile-first design, use CSS variables for theming

### shadcn/ui 0.8+
- **Why**: 80+ pre-built accessible components, built on Radix UI
- **Features**: Form components, dialogs, buttons, dropdowns, all customizable
- **When**: Sprint 0.1 installation
- **Best Practice**: Use as-is for accessibility compliance (WCAG AA)

---

## Internationalization (i18n) - MVP

### next-i18next v15.3+
- **Why**: Official Next.js i18n solution, excellent App Router support, minimal config
- **Features**: Route-based locale detection, namespace organization, SSR/SSG support
- **When**: Sprint 0.5 (multi-language support)
- **Bundle Size**: ~12 kB gzipped (core + react-i18next)
- **Languages (MVP)**: Portuguese Brazilian (pt-BR), English Canadian (en-CA), French Canadian (fr-CA)
- **Cost**: Free, open-source
- **Install**: `npm install next-i18next react-i18next i18next`

```typescript
// app/i18n/settings.ts
export const fallbackLng = 'en-CA'
export const languages = ['pt-BR', 'en-CA', 'fr-CA']
export const defaultNS = 'common'

// Usage in components
import { useTranslation } from 'react-i18next'

export function Welcome() {
  const { t } = useTranslation('common')
  return <h1>{t('welcome')}</h1>
}
```

### date-fns v3.6+
- **Why**: Modern date library, tree-shakeable, i18n support for 100+ locales
- **Features**: Date formatting, locale-aware date manipulation
- **When**: Sprint 0.5 (date/time localization)
- **Bundle Size**: ~5 kB (minimal imports)
- **Use Case**: Format dates per user's language (e.g., "23/11/2025" vs "11/23/2025")
- **Install**: `npm install date-fns`

```typescript
import { format } from 'date-fns'
import { ptBR, enCA, frCA } from 'date-fns/locale'

const locales = { 'pt-BR': ptBR, 'en-CA': enCA, 'fr-CA': frCA }

export function formatDate(date: Date, locale: string) {
  return format(date, 'PPP', { locale: locales[locale] })
}
```

### Translation File Structure
```
/public
  /locales
    /pt-BR
      common.json
      auth.json
      dashboard.json
      tasks.json
      messages.json
    /en-CA
      [same structure]
    /fr-CA
      [same structure]
```

**Translation Management**:
- JSON files for all UI strings (70+ keys per namespace)
- ICU MessageFormat for complex strings (plurals, gender, numbers)
- Lazy loading per route to minimize bundle size
- Missing key fallback to en-CA

---

## TV Display Mode - MVP

### qrcode.react v4.0+
- **Why**: React component for QR code generation, zero dependencies
- **Features**: SVG/Canvas rendering, error correction, customizable size
- **When**: Sprint 0.6 (TV display QR login)
- **Bundle Size**: ~3 kB gzipped
- **Use Case**: Generate QR code for child quick-login from mobile devices
- **Cost**: Free, open-source
- **Install**: `npm install qrcode.react`

```typescript
import { QRCodeSVG } from 'qrcode.react'

export function QuickLoginQR({ sessionToken }: { sessionToken: string }) {
  const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/display/login/${sessionToken}`

  return (
    <QRCodeSVG
      value={loginUrl}
      size={256}
      level="H" // High error correction
      includeMargin
    />
  )
}
```

### TV Display Architecture
- **Route**: `/display` (public-facing, auto-refresh every 30 seconds)
- **Layout**: Grid layout showing all family members' tasks
- **Responsive**: CSS media queries for large screens (1080p+, 1440p, 4K)
- **Fonts**: System fonts, large sizes (24px-48px)
- **Colors**: High contrast (WCAG AAA compliance at 7:1 ratio)
- **Auto-Refresh**: Client-side polling with 30-second interval

```typescript
// app/display/page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function TVDisplay() {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch('/api/display/tasks')
      setTasks(await res.json())
    }

    fetchTasks() // Initial load
    const interval = setInterval(fetchTasks, 30000) // Refresh every 30s

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="tv-display"> {/* Large fonts, grid layout */}
      {/* Family dashboard content */}
    </div>
  )
}
```

### TV Display CSS Specifications
```css
/* Tailwind custom screens for TV sizes */
@media (min-width: 1920px) { /* 1080p */
  .tv-display {
    font-size: 1.5rem; /* 24px base */
    padding: 4rem;
  }

  .tv-display h1 {
    font-size: 3rem; /* 48px */
  }

  .tv-display .task-card {
    min-height: 200px;
    font-size: 2rem; /* 32px */
  }
}

@media (min-width: 2560px) { /* 1440p */
  .tv-display {
    font-size: 2rem; /* 32px base */
  }
}
```

### Display Session Management
**Database Table**: `display_sessions`
```sql
CREATE TABLE display_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Session Flow**:
1. Parent opens `/display` → generates unique token → shows QR code
2. Child scans QR → redirects to `/display/login/{token}`
3. Child authenticates → session valid for 8 hours
4. TV auto-refreshes task data every 30 seconds

**Security**: Token-based access, no persistent credentials stored

---

## Form Management & Validation

### React Hook Form v7.52+ (MVP)
- **Why**: Minimal re-renders, zero dependencies, perfect for multi-field forms
- **Bundle Size**: 8.6 kB gzipped
- **When**: Sprint 0.1 (with Zod integration)
- **Integration**: Works seamlessly with Zod for validation
- **Example**: Task creation form, auth forms, rating form
- **Install**: `npm install react-hook-form @hookform/resolvers`

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TaskSchema } from '@/lib/schemas'

export function TaskForm() {
  const form = useForm({
    resolver: zodResolver(TaskSchema),
    defaultValues: { title: '', dueDate: new Date() }
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('title')} />
      {form.formState.errors.title && <span>{form.formState.errors.title.message}</span>}
    </form>
  )
}
```

### Zod v3.23+ (MVP)
- **Why**: Type-safe validation, TypeScript inference, small bundle, better than Yup
- **Bundle Size**: ~10 kB
- **When**: Sprint 0.1 (create validation schemas)
- **Features**: Server-side and client-side validation, composable schemas
- **Install**: `npm install zod`

```typescript
import { z } from 'zod'

export const TaskSchema = z.object({
  title: z.string().min(1, 'Title required').max(255),
  dueDate: z.coerce.date(),
  category: z.enum(['cleaning', 'homework', 'pets', 'other']),
  priority: z.enum(['low', 'medium', 'high']),
  childIds: z.array(z.string().uuid())
})

export type Task = z.infer<typeof TaskSchema>
```

---

## Backend (MVP)

### Vercel Serverless Functions
- **Why**: Optimal for Next.js, auto-scaling, free tier sufficient
- **Rate Limits** (Free Tier):
  - Deployments: 100/day
  - Function invocations: 1M/month
  - Data transfer: 100GB/month
  - Cold start: <1 second
- **When**: Sprint 0.1+ (API routes)
- **Cost**: $0/month (free tier handles MVP)
- **Upgrade Path**: Vercel Pro ($20/mo) for >100 concurrent users

### API Route Pattern
- **Structure**: `/app/api/[resource]/route.ts`
- **Methods**: GET, POST, PUT, DELETE
- **Validation**: Zod schema validation on all inputs
- **Example**: `/api/tasks/`, `/api/children/`, `/api/completions/`
- **Best Practice**: Granular routes, REST principles, type-safe request/response

---

## Database (MVP)

### Supabase PostgreSQL
- **Why**: PostgreSQL reliability, built-in auth, Row-Level Security, real-time APIs
- **Free Tier Limits**:
  - Storage: 500MB
  - API Requests: Unlimited
  - Concurrent Users: 50K
  - Data Transfer: 10GB/month
  - Cost: $0/month
- **When**: Sprint 0.2 (database setup)
- **Upgrade Path**: Supabase Pro ($25/mo) for >5GB data

### Security Features
- **Row-Level Security (RLS)**: Database-level access control per family
- **Authentication**: SCRAM-SHA-256 (Supabase default)
- **Parameterized Queries**: Automatic via Supabase client (prevents SQL injection)
- **Secrets**: Environment variables for API keys

### Database Schema
```
families (id, name, created_at)
parents (id, email, family_id, created_at)
children (id, name, age_group, family_id, created_at)
tasks (id, title, category, family_id, created_at)
task_assignments (id, task_id, child_id, created_at)
task_completions (id, task_id, child_id, rating, notes, reviewed_by, feedback, created_at)
recurring_task_instances (id, task_id, date, created_at)
subtasks (id, task_id, title, created_at)
```

---

## TV Display Deferred Features (Phase 4)

### Google Cast SDK (Chromecast)
- **Why**: Native Chromecast streaming with remote control
- **When**: Phase 4.1 (after MVP web display mode)
- **Bundle Size**: ~50 kB
- **Use Case**: Cast dashboard to TV with phone as remote control
- **Cost**: Free, open-source
- **Install**: `npm install @types/chromecast-caf-sender`

### Safari AirPlay API
- **Why**: Native AirPlay streaming for Apple TV
- **When**: Phase 4.2 (after MVP web display mode)
- **Bundle Size**: Native browser API (0 kB)
- **Use Case**: Mirror dashboard to Apple TV
- **Cost**: Free (browser native)
- **Note**: Basic AirPlay mirroring already works in Safari without integration

---

## Phase 2 Libraries (Deferred)

### TanStack Query v5
- **Why**: Intelligent caching, automatic refetching, optimistic updates
- **When**: Phase 2 (when analytics/progress views need complex data fetching)
- **Use Case**: Weekly progress, monthly reports, multiple data sources
- **Bundle Size**: ~35 kB gzipped
- **Cost**: Free, open-source
- **Install**: `npm install @tanstack/react-query`

### Zustand 4.5+
- **Why**: Minimal global state management, no boilerplate, 2.2 kB
- **When**: Phase 2 (when UI state becomes complex)
- **Use Case**: Selected child, sidebar state, theme, notifications
- **Cost**: Free, open-source
- **Install**: `npm install zustand`

### Recharts 2.10+
- **Why**: Component-based charting, responsive, D3-powered
- **When**: Phase 2 (for progress views and analytics)
- **Use Case**: Weekly/monthly task completion charts
- **Bundle Size**: ~60 kB gzipped
- **Cost**: Free, open-source
- **Install**: `npm install recharts`

---

## DevOps & Deployment

### GitHub
- **Purpose**: Version control, CI/CD integration
- **Branching**: feature/*, bugfix/*, hotfix/* branches
- **When**: Sprint 0.1 (repository creation)
- **Cost**: Free (public or private)

### Vercel
- **Purpose**: Hosting, auto-deployment from GitHub
- **Features**: Preview deployments, automatic HTTPS, edge functions
- **When**: Sprint 3.2 (production deployment)
- **Cost**: $0/month (free tier)
- **Setup**: Connect GitHub repo, auto-deploy on push to main

### Environment Variables
**Development** (.env.local - git-ignored):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Production** (Vercel dashboard):
- Set same variables in Vercel project settings
- Never expose service role key to client

---

## 2025 Best Practices Coverage

| Practice | MVP | Phase 2 | Implementation |
|----------|-----|---------|-----------------|
| React Server Components | ✅ | ✅ | Default, minimize 'use client' |
| TypeScript Strict Mode | ✅ | ✅ | Enabled in tsconfig.json |
| Mobile-First Design | ✅ | ✅ | Tailwind responsive classes |
| CSS Variables | ✅ | ✅ | Tailwind theme configuration |
| Cascade Layers (@layer) | ✅ | ✅ | CSS organization |
| Image Optimization | ✅ | ✅ | next/image component |
| Granular API Routes | ✅ | ✅ | RESTful endpoint structure |
| Input Validation (Zod) | ✅ | ✅ | All forms and APIs |
| SCRAM-SHA-256 | ✅ | ✅ | Supabase default |
| Input Sanitization | ✅ | ✅ | Parameterized queries |
| Row-Level Security | ✅ | ✅ | Database-level enforcement |
| JSONB Data | ✅ | ✅ | Metadata columns |
| Environment Variables | ✅ | ✅ | Secrets management |
| Code Splitting | ✅ | ✅ | Next.js automatic |
| Dynamic Imports | ✅ | ✅ | React.lazy for modals |
| Automated Testing | ⏳ | ✅ | Vitest + Playwright (Phase 2) |

---

## Installation Commands (MVP)

```bash
# Initialize Next.js project
npx create-next-app@latest kids-chores-tracker --typescript --tailwind

# Install form management & validation
npm install react-hook-form zod @hookform/resolvers

# Supabase client
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# shadcn/ui (after project creation)
npx shadcn-ui@latest init

# Sprint 0.5: Internationalization (i18n)
npm install next-i18next react-i18next i18next
npm install date-fns  # Date/time localization

# Sprint 0.6: TV Display Mode
npm install qrcode.react

# Dev dependencies (optional for Phase 2)
npm install -D vitest @playwright/test
```

---

## Performance Targets

- **Bundle Size**: <100KB (main app code)
- **Page Load**: <2 seconds on 4G
- **API Response**: <200ms average
- **Lighthouse Score**: >90 (mobile and desktop)
- **Core Web Vitals**: Good (all 3 metrics)

---

## Cost Analysis

### MVP 1.0 (Free Tier)
| Service | Limit | Usage | Cost |
|---------|-------|-------|------|
| Vercel | 1M invocations/month | ~100K | $0 |
| Supabase | 500MB storage | ~50MB | $0 |
| GitHub | Unlimited | Unlimited | $0 |
| **Total** | - | - | **$0/month** |

### Growth Scenarios
| Users | Vercel | Supabase | Total |
|-------|--------|----------|-------|
| 10 | Free | Free | $0 |
| 100 | Free | Free | $0 |
| 500 | Pro $20 | Free | $20 |
| 1000 | Pro $20 | Pro $25 | $45 |

---

## Summary

**MVP Tech Stack**: Proven, modern, zero-cost, excellent developer experience
- Next.js 14 + React 19 + TypeScript (type-safe, performant)
- Tailwind CSS + shadcn/ui (beautiful, accessible, responsive)
- React Hook Form + Zod (excellent form UX, runtime validation)
- Supabase PostgreSQL (reliable, secure, free tier sufficient)
- Vercel hosting (optimal for Next.js, free tier)
- **next-i18next + date-fns** (3-language support: pt-BR, en-CA, fr-CA)
- **qrcode.react** (TV display QR login, web-based casting)

**Total Cost**: $0/month for MVP
**90% Alignment**: With 2025 industry best practices
**Ready**: For production deployment after Phase 3

**Added in v1.1**:
- Multi-language support (Sprint 0.5): next-i18next, date-fns
- TV Display Mode (Sprint 0.6): qrcode.react, large-screen CSS, auto-refresh
- Chromecast/AirPlay deferred to Phase 4 (web display sufficient for MVP)
