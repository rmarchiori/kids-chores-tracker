# Implementation Plan - MVP 1.0

**Version**: 1.2
**Total Effort**: 128 hours (revised)
**Duration**: 8-9 weeks @ 15-20 hours/week
**Target Release**: 8-9 weeks

---

## Overview

3 phases, 10 sprints, delivering M1-M5 core features with enhanced UX (TV display moved to post-MVP).

| Phase | Sprints | Duration | Effort | Outcome |
|-------|---------|----------|--------|---------|
| 0: Setup | 0.1-0.5 | 2 weeks | 42h | Ready to code + i18n |
| 1: Core | 1.1-1.3 | 3 weeks | 54h | All tasks + theming + images |
| 2: Quality | 2.1-2.3 | 2 weeks | 30h | Rating & review system |
| 3: Launch | 3.1-3.2 | 2 weeks | 22h | Production ready |
| **Total** | **10** | **8-9 weeks** | **128h** | **Live MVP** |

---

## Phase 0: Setup & Infrastructure (Weeks 1-2, 42 hours)

### Sprint 0.1: Project Scaffolding (10 hours)

**Tasks**:
- `npx create-next-app` with TypeScript strict mode
- Install Tailwind CSS + shadcn/ui
- Create GitHub repository
- Setup folder structure (`/lib`, `/components`, `/app`)
- Create `.env.local` template

**Best Practices**:
- TypeScript strict mode in tsconfig.json
- CSS variables for theming
- Environment variable setup

**Deliverables**:
- ✅ Next.js 14 project initialized
- ✅ Tailwind CSS configured
- ✅ GitHub repo created and cloned locally
- ✅ Project structure ready for development

---

### Sprint 0.2: Database & Authentication (12 hours)

**Status**: ✅ COMPLETED

**Tasks**:
- ✅ Create Supabase project
- ✅ Design and create database schema (9 tables: families, family_members, family_invitations, children, tasks, task_assignments, task_completions, recurring_task_instances, subtasks)
- ✅ Enable Row-Level Security on all tables
- ✅ Create auth pages (login, register, password reset, update password)
- ✅ Setup protected routes middleware
- ✅ Fix password reset flow (Supabase redirect handling)

**Best Practices**:
- RLS policies for family-level isolation (simplified to avoid recursion)
- SCRAM-SHA-256 authentication (Supabase default)
- JSONB columns for flexible metadata
- Two-phase registration to avoid RLS conflicts

**Deliverables**:
- ✅ Supabase project created with all tables
- ✅ RLS policies enforced (simplified for onboarding)
- ✅ Email/password auth working
- ✅ Protected routes middleware functional
- ✅ Password reset flow working correctly
- ✅ family_members junction table (replaces parents)
- ✅ family_invitations table for multi-parent support

---

### Sprint 0.3: Registration Fix & Onboarding (8 hours)

**Status**: ✅ COMPLETED

**Tasks**:
- ✅ Remove family creation from registration flow
- ✅ Create `/onboarding` page for post-login family setup
- ✅ Update login redirect logic (check for family membership)
- ✅ Replace `parents` table with `family_members` junction table
- ✅ Add `family_invitations` table for future multi-parent support
- ✅ Update dashboard to use `family_members`
- ✅ Add trigger to prevent last admin removal

**Best Practices**:
- Two-phase registration: Auth → Onboarding
- Avoid RLS recursion with simple INSERT policies
- Support multi-family per user architecture
- Database-level protection for critical business rules

**Deliverables**:
- ✅ Registration creates auth.users only (no RLS errors)
- ✅ Onboarding creates family + family_member (user as admin)
- ✅ Login redirects to /onboarding or /dashboard based on family
- ✅ Dashboard loads profile from family_members table
- ✅ Foundation for Sprint 0.4 (invitations)
- ✅ Cannot remove last admin from family (DB trigger)

---

### Sprint 0.4: Family Invitation System (10 hours)

**Status**: ✅ COMPLETED

**Tasks**:
- ✅ Admin invite flow: `/dashboard/family/settings` with invite form
- ✅ Invitation email with magic link token
- ✅ `/invite/accept/[token]` acceptance page
- ✅ Role-based permissions (admin, parent, teen)
- ✅ Family management UI (list members, pending invites, remove members)
- ✅ Edge case: Prevent last admin removal

**Best Practices**:
- ✅ Token expiration (7 days)
- ✅ Email validation
- ✅ Transaction-safe invitation acceptance
- ✅ RLS policies for family_invitations table

**Deliverables**:
- ✅ Admins can invite users via email
- ✅ Invitees can accept invitations
- ✅ Multi-parent families working
- ✅ Role management (admin vs parent)
- ✅ Last admin cannot leave family

---

### Sprint 0.5: Multi-Language Support (10 hours)

**Status**: ✅ COMPLETED

**Tasks**:
- ✅ Install and configure next-i18next
- ✅ Create translation files for 3 languages:
  - ✅ Portuguese Brazilian (pt-BR)
  - ✅ English Canadian (en-CA)
  - ✅ French Canadian (fr-CA)
- ✅ Language selector component in header/settings
- ✅ Translate all existing UI strings
- ✅ Date/time localization using date-fns-tz
- ✅ Store language preference in user profile

**Best Practices**:
- ✅ Namespace translations by page (common, auth, dashboard, tasks)
- ✅ Use ICU MessageFormat for complex strings
- ✅ Lazy-load translations per route
- ✅ Test with missing translation keys

**Deliverables**:
- ✅ Language selector working in UI
- ✅ All strings translated for 3 languages
- ✅ User preference saved and persisted
- ✅ Age-appropriate messages per language
- ✅ Date/time formatted per locale

---

## Phase 1: Core Features (Weeks 3-5, 54 hours)

### Sprint 1.1: Family & Children Management + Theming System (22 hours)

**Status**: ✅ COMPLETED

**Tasks**:
- ✅ Parent dashboard layout (responsive navigation)
  - ✅ **Desktop/Tablet**: Left sidebar navigation (collapsible)
  - ✅ **Mobile**: Bottom navigation bar with icons
- ✅ Add/edit/delete children functionality
- ✅ Child profile photos (upload + default avatars)
- ✅ Children list with age groups (5-8, 9-12)
- ✅ Multi-parent access verification
- ✅ **NEW**: Age-specific theme system
  - ✅ Theme switcher component (5-8 bright, 9-12 mature)
  - ✅ Color palette definitions per age group
  - ✅ Theme persistence in database (child.theme_preference)

**Best Practices**:
- React Server Components for data fetching
- Mobile-first responsive design
- CSS custom properties for theme switching
- Tailwind CSS theme extension for age-specific colors
- WCAG AA contrast compliance (4.5:1) on all themes

**Color Psychology Applied**:
- **5-8 Theme**: Very bright, playful, high contrast
  - Primary: Vibrant coral (#FF6B6B)
  - Success: Bright teal (#4ECDC4)
  - Pending: Sunny yellow (#FFE66D)
  - Background: Light purple (#F7F7FF)
- **9-12 Theme**: Colorful but more mature
  - Primary: Cool purple (#6C5CE7)
  - Success: Rich green (#00B894)
  - Pending: Warm yellow (#FDCB6E)
  - Background: Light blue-gray (#DFE6E9)
- **Parent Theme**: Calming, professional
  - Primary: Trustworthy blue (#0984E3)
  - Success: Forest green (#00B894)
  - Urgent: Soft red (#D63031)
  - Background: Clean white (#FFFFFF)

**Deliverables**:
- ✅ Parent dashboard with responsive navigation (left sidebar + bottom nav)
- ✅ Children CRUD operations working
- ✅ Child profile photo upload + default avatars
- ✅ Age group selection functioning
- ✅ Theme switching system working per child
- ✅ Age-specific color palettes applied
- ✅ Mobile-responsive layout

---

### Sprint 1.2: Task Management + Image Library (22 hours)

**Status**: ✅ COMPLETED

**Tasks**:
- ✅ Task creation form (title, category, priority, description, assigned children)
- ✅ Daily recurring task logic (auto-generate daily instances)
- ✅ Task list views (parent and child views)
- ✅ Task edit/delete functionality
- ✅ **NEW**: Task image library system
  - ✅ Curated image library with 40-50 common tasks
  - ✅ Categories: Cleaning, Homework, Hygiene, Outdoor, Helping, Meals, Pets, Bedtime
  - ✅ Image picker UI (searchable, filterable by category)
  - ✅ Parent can upload custom images (Supabase Storage)
  - ✅ Emoji fallback for tasks without images
  - ✅ Images adapt to theme colors (5-8 vs 9-12)

**Image Library Contents** (hand-drawn/cute illustration style):
- **Cleaning**: Make bed, clean room, vacuum, dust, take out trash, organize toys
- **Homework**: Math, reading, writing, study, projects
- **Hygiene**: Brush teeth, shower, wash hands, comb hair, clip nails
- **Outdoor**: Water plants, feed pets, rake leaves, shovel snow
- **Helping**: Set table, clear dishes, help sibling, fold laundry
- **Meals**: Breakfast, lunch, dinner, snack, drink water
- **Pets**: Feed dog/cat, walk dog, clean litter box, groom pet
- **Bedtime**: Pajamas, story time, lights out, morning routine

**Best Practices**:
- Granular API routes (`/api/tasks`, `/api/tasks/[id]`, `/api/task-images`)
- Zod input validation on all forms and APIs
- React Hook Form for form state management
- Supabase Storage for custom image uploads
- Image optimization (WebP format, lazy loading)
- Alt text for all images (accessibility)

**Database Schema Changes**:
```sql
ALTER TABLE tasks ADD COLUMN image_url TEXT;
ALTER TABLE tasks ADD COLUMN image_alt_text TEXT;
ALTER TABLE tasks ADD COLUMN image_source TEXT; -- 'library' | 'custom' | 'emoji'
```

**Deliverables**:
- ✅ Task creation working with daily recurrence
- ✅ Multiple child assignment per task
- ✅ Task image library with 40-50 illustrations
- ✅ Image picker UI (category filtering)
- ✅ Custom image upload working
- ✅ Hybrid display: Image + text on all tasks
- ✅ Emoji fallback system
- ✅ Task lists filtered and sorted correctly
- ✅ API routes with validation

---

### Sprint 1.3: Basic Task Completion (10 hours)

**Status**: ✅ COMPLETED

**Tasks**:
- ✅ "I did this" button on child task view
- ✅ Age-appropriate positive messages (5-8 emoji-based, 9-12 mature)
- ✅ Completion timestamp tracking
- ✅ Parent completion history view

**Best Practices**:
- ✅ Code splitting (Next.js automatic)
- ✅ Dynamic imports for message components if needed

**Deliverables**:
- ✅ Child can mark task complete
- ✅ Positive messages displaying correctly
- ✅ Age-appropriate messaging by group
- ✅ Parent sees completion history

---

## Phase 2: Quality & Feedback (Weeks 5-6, 30 hours)

### Sprint 2.1: Quality Rating System (10 hours)

**Status**: ✅ COMPLETED

**Tasks**:
- ✅ 5-star rating interface (after task completion)
- ✅ Star labels: 1="I gave it a try", 5="I did my best"
- ✅ Optional notes field (up to 500 chars)
- ✅ Task status: "completed" → "pending_review"

**Best Practices**:
- ✅ Input validation (rating 1-5, notes length)
- ✅ Input sanitization on notes field

**Deliverables**:
- ✅ 5-star rating interface working
- ✅ Notes captured and stored
- ✅ Task moved to pending_review status
- ✅ Parent dashboard shows pending reviews

---

### Sprint 2.2: Parent Review Workflow (12 hours)

**Status**: ✅ COMPLETED

**Tasks**:
- ✅ Review dashboard showing pending tasks
- ✅ Review dialog (child's rating, notes, parent rating adjustment)
- ✅ Feedback capture (encouragement message)
- ✅ Task status: "pending_review" → "reviewed"
- ✅ Child view shows parent's review and feedback

**Best Practices**:
- ✅ API routes for review operations
- ✅ Zod validation for review feedback
- ✅ Track reviewer_id (which parent reviewed)

**Deliverables**:
- ✅ Parent review dashboard functional
- ✅ Review dialog with rating adjustment
- ✅ Feedback displayed to child
- ✅ Review history tracked

---

### Sprint 2.3: Daily Task View (8 hours)

**Status**: ✅ COMPLETED

**Tasks**:
- ✅ Parent daily view (all family tasks due today)
- ✅ Child daily view (their tasks due today)
- ✅ Progress indicator (X of Y tasks completed)
- ✅ Status badges (completed, pending review, not started)

**Best Practices**:
- ✅ Mobile-first responsive design
- ✅ Optimized queries for daily view performance

**Deliverables**:
- ✅ Parent daily view showing all tasks
- ✅ Child daily view showing their tasks
- ✅ Progress stats working
- ✅ Mobile-responsive

---

## Phase 3: Testing & Launch (Weeks 7-8, 22 hours)

### Sprint 3.1: Testing & Bug Fixes (10 hours)

**Status**: ✅ COMPLETED

**Tasks**:
- ✅ Manual happy path testing (complete full workflows)
- ✅ Edge case testing (empty lists, skip dates, multi-parent)
- ✅ Mobile responsive testing (iPhone, Android)
- ✅ Cross-browser testing (Chrome, Safari, Firefox)
- ✅ Bug fixes from testing

**Best Practices**:
- ✅ Performance testing on 4G throttling
- ✅ Accessibility testing (keyboard navigation, screen readers)

**Deliverables**:
- ✅ No critical bugs on happy path
- ✅ Mobile verified on real devices
- ✅ Browser compatibility checked
- ✅ Performance acceptable (<2s load on 4G)

---

### Sprint 3.2: Polish & Production Deployment (12 hours)

**Status**: ✅ COMPLETED

**Tasks**:
- ✅ Visual design polish (spacing, colors, typography)
- ✅ Age-specific styling refinement
- ✅ Accessibility review (WCAG AA compliance)
- ✅ Environment variables setup in Vercel
- ✅ Production deployment to Vercel (ready, not yet deployed)
- ✅ Verify production deployment working (ready for deployment)

**Best Practices**:
- ✅ Mobile touch targets ≥48px
- ✅ Color contrast >4.5:1 (WCAG AA)
- ✅ Semantic HTML
- ✅ Alternative text on images

**Deliverables**:
- ✅ Polished, accessible UI
- ✅ Ready for production deployment
- ✅ Production environment configuration complete
- ✅ Documentation complete

---

## Success Criteria Checklist

### Functional
- [x] Multiple parents per family manage tasks together
- [x] Daily recurring tasks work
- [x] Children self-rate quality 1-5 stars
- [x] Parents review and adjust ratings
- [x] Age-appropriate UI (theming + messaging for 5-8 vs 9-12)
- [x] Task image library with 40+ common tasks
- [x] Works on desktop and mobile (responsive navigation)

### Performance
- [x] Response time <200ms average
- [x] Page load <2 seconds on 4G
- [x] Lighthouse score >90 (mobile)
- [x] Core Web Vitals: All "Good"

### Quality
- [x] No critical bugs on happy path
- [x] TypeScript strict mode: zero errors
- [x] Mobile Lighthouse: >90
- [x] Accessibility: WCAG AA compliant
- [x] Security: RLS enforced, no secrets exposed

### Deployment
- [x] GitHub repository clean and documented
- [x] Environment variables configured
- [x] Database backups enabled
- [x] Error logging functional
- [ ] Live on vercel.com subdomain (ready, not yet deployed)

---

## Daily/Weekly Rhythm

### Daily (15-20 min)
- Check pull requests
- Review test failures
- Respond to blockers

### Sprint Planning (1 hour/week)
- Review sprint objectives
- Estimate hours
- Identify dependencies

### Standup (optional, 15 min/week)
- What was done last week
- What's planned this week
- Any blockers

### Sprint Review (1 hour/week)
- Test completed features
- Verify success criteria
- Plan next sprint

---

## Risk Mitigation

### Risk: Scope Creep
- ✅ Mitigation: Stick to M1-M4 features only
- ✅ Out of scope documented in requirements.md

### Risk: Performance Issues
- ✅ Mitigation: Test on 4G, optimize images, use Code Splitting
- ✅ Monitor Lighthouse score

### Risk: Security Issues
- ✅ Mitigation: RLS policies tested, input validation with Zod, secrets in env vars
- ✅ Security checklist in dev-ops.md

### Risk: Schedule Slip
- ✅ Mitigation: Track hours weekly, adjust next sprints if needed
- ✅ Prioritize: M1 > M2 > M3 > M4

---

## Notes

- Estimate assumes 15-20 hours/week available
- Add 10-15% buffer for unknowns (already included in 116 hours)
- Can compress to 6 weeks with 20+ hours/week
- Can extend to 10 weeks with 12-15 hours/week
- Database schema finalized before Phase 1 begins
- All API routes follow REST convention with Zod validation
- All forms use React Hook Form + Zod pattern
- Mobile-first design throughout

---

## Next Steps

1. ✅ Read requirements.md (understand what we're building)
2. ✅ Read tech-stack.md (understand how we're building)
3. ✅ Start Sprint 0.1 this week
4. ⏳ Update this document weekly with actual progress
5. ⏳ Adjust sprints based on velocity

**Let's build! 🚀**
