# Implementation Plan - MVP 1.0

**Version**: 1.0
**Total Effort**: 116 hours
**Duration**: 8 weeks @ 15-20 hours/week
**Target Release**: 6-8 weeks

---

## Overview

4 phases, 7 sprints, delivering M1-M4 core features.

| Phase | Sprints | Duration | Effort | Outcome |
|-------|---------|----------|--------|---------|
| 0: Setup | 0.1-0.2 | 1 week | 22h | Ready to code |
| 1: Core | 1.1-1.3 | 3 weeks | 44h | All tasks working |
| 2: Quality | 2.1-2.3 | 2 weeks | 30h | Rating & review system |
| 3: Launch | 3.1-3.2 | 2 weeks | 22h | Production ready |
| **Total** | **7** | **8 weeks** | **116h** | **Live MVP** |

---

## Phase 0: Setup & Infrastructure (Week 1, 22 hours)

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

**Tasks**:
- Create Supabase project
- Design and create database schema (8 tables: families, parents, children, tasks, task_assignments, task_completions, recurring_task_instances, subtasks)
- Enable Row-Level Security on all tables
- Create auth pages (login, register, password reset)
- Setup protected routes middleware

**Best Practices**:
- RLS policies for family-level isolation
- SCRAM-SHA-256 authentication (Supabase default)
- JSONB columns for flexible metadata

**Deliverables**:
- ✅ Supabase project created with all tables
- ✅ RLS policies enforced (test with different users)
- ✅ Email/password auth working
- ✅ Protected routes middleware functional

---

## Phase 1: Core Features (Weeks 2-4, 44 hours)

### Sprint 1.1: Family & Children Management (16 hours)

**Tasks**:
- Parent dashboard layout (responsive grid)
- Add/edit/delete children functionality
- Children list with age groups (5-8, 9-12)
- Multi-parent access verification

**Best Practices**:
- React Server Components for data fetching
- Mobile-first responsive design
- Cascade layers for CSS organization

**Deliverables**:
- ✅ Parent dashboard showing children
- ✅ Children CRUD operations working
- ✅ Age group selection functioning
- ✅ Mobile-responsive layout

---

### Sprint 1.2: Task Management with Recurrence (18 hours)

**Tasks**:
- Task creation form (title, category, priority, description, assigned children)
- Daily recurring task logic (auto-generate daily instances)
- Task list views (parent and child views)
- Task edit/delete functionality

**Best Practices**:
- Granular API routes (`/api/tasks`, `/api/tasks/[id]`)
- Zod input validation on all forms and APIs
- React Hook Form for form state management

**Deliverables**:
- ✅ Task creation working with daily recurrence
- ✅ Multiple child assignment per task
- ✅ Task lists filtered and sorted correctly
- ✅ API routes with validation

---

### Sprint 1.3: Basic Task Completion (10 hours)

**Tasks**:
- "I did this" button on child task view
- Age-appropriate positive messages (5-8 emoji-based, 9-12 mature)
- Completion timestamp tracking
- Parent completion history view

**Best Practices**:
- Code splitting (Next.js automatic)
- Dynamic imports for message components if needed

**Deliverables**:
- ✅ Child can mark task complete
- ✅ Positive messages displaying correctly
- ✅ Age-appropriate messaging by group
- ✅ Parent sees completion history

---

## Phase 2: Quality & Feedback (Weeks 5-6, 30 hours)

### Sprint 2.1: Quality Rating System (10 hours)

**Tasks**:
- 5-star rating interface (after task completion)
- Star labels: 1="I gave it a try", 5="I did my best"
- Optional notes field (up to 500 chars)
- Task status: "completed" → "pending_review"

**Best Practices**:
- Input validation (rating 1-5, notes length)
- Input sanitization on notes field

**Deliverables**:
- ✅ 5-star rating interface working
- ✅ Notes captured and stored
- ✅ Task moved to pending_review status
- ✅ Parent dashboard shows pending reviews

---

### Sprint 2.2: Parent Review Workflow (12 hours)

**Tasks**:
- Review dashboard showing pending tasks
- Review dialog (child's rating, notes, parent rating adjustment)
- Feedback capture (encouragement message)
- Task status: "pending_review" → "reviewed"
- Child view shows parent's review and feedback

**Best Practices**:
- API routes for review operations
- Zod validation for review feedback
- Track reviewer_id (which parent reviewed)

**Deliverables**:
- ✅ Parent review dashboard functional
- ✅ Review dialog with rating adjustment
- ✅ Feedback displayed to child
- ✅ Review history tracked

---

### Sprint 2.3: Daily Task View (8 hours)

**Tasks**:
- Parent daily view (all family tasks due today)
- Child daily view (their tasks due today)
- Progress indicator (X of Y tasks completed)
- Status badges (completed, pending review, not started)

**Best Practices**:
- Mobile-first responsive design
- Optimized queries for daily view performance

**Deliverables**:
- ✅ Parent daily view showing all tasks
- ✅ Child daily view showing their tasks
- ✅ Progress stats working
- ✅ Mobile-responsive

---

## Phase 3: Testing & Launch (Weeks 7-8, 22 hours)

### Sprint 3.1: Testing & Bug Fixes (10 hours)

**Tasks**:
- Manual happy path testing (complete full workflows)
- Edge case testing (empty lists, skip dates, multi-parent)
- Mobile responsive testing (iPhone, Android)
- Cross-browser testing (Chrome, Safari, Firefox)
- Bug fixes from testing

**Best Practices**:
- Performance testing on 4G throttling
- Accessibility testing (keyboard navigation, screen readers)

**Deliverables**:
- ✅ No critical bugs on happy path
- ✅ Mobile verified on real devices
- ✅ Browser compatibility checked
- ✅ Performance acceptable (<2s load on 4G)

---

### Sprint 3.2: Polish & Production Deployment (12 hours)

**Tasks**:
- Visual design polish (spacing, colors, typography)
- Age-specific styling refinement
- Accessibility review (WCAG AA compliance)
- Environment variables setup in Vercel
- Production deployment to Vercel
- Verify production deployment working

**Best Practices**:
- Mobile touch targets ≥48px
- Color contrast >4.5:1 (WCAG AA)
- Semantic HTML
- Alternative text on images

**Deliverables**:
- ✅ Polished, accessible UI
- ✅ Deployed to production
- ✅ Production environment tested
- ✅ Documentation complete

---

## Success Criteria Checklist

### Functional
- [ ] Multiple parents per family manage tasks together
- [ ] Daily recurring tasks with skip dates work
- [ ] Children self-rate quality 1-5 stars
- [ ] Parents review and adjust ratings
- [ ] Age-appropriate UI messaging (5-8 vs 9-12)
- [ ] Works on desktop and mobile

### Performance
- [ ] Response time <200ms average
- [ ] Page load <2 seconds on 4G
- [ ] Lighthouse score >90 (mobile)
- [ ] Core Web Vitals: All "Good"

### Quality
- [ ] No critical bugs on happy path
- [ ] TypeScript strict mode: zero errors
- [ ] Mobile Lighthouse: >90
- [ ] Accessibility: WCAG AA compliant
- [ ] Security: RLS enforced, no secrets exposed

### Deployment
- [ ] GitHub repository clean and documented
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] Error logging functional
- [ ] Live on vercel.com subdomain

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
