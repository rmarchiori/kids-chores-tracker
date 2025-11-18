# Requirements - Kids Chores Tracker MVP 1.0

**Version**: 1.1 \
**Status**: Updated with i18n & TV Display \
**Effort**: 136 hours (9 weeks @ 15-20 hrs/week)

---

## Project Overview

A family chore management app where:
- **Parents** create tasks, assign to children, review quality, provide feedback
- **Children** complete tasks, self-rate quality (1-5 stars), receive encouragement
- **Multiple parents** collaborate on task management and reviews
- **Age-appropriate** UI for 5-8 and 9-12 age groups

---

## Core Features (M1-M4)

### M1: Multi-Parent Family Task Management
- Parents add, edit, delete tasks
- Daily recurring tasks with skip dates (vacation/special days)
- Assign tasks to single or multiple children (independent completion per child)
- Track which parent reviewed each task
- Support 1-10 children, 1-3 parents per family

**Database**: families, parents, children, tasks, task_assignments, recurring_task_instances

### M2: Basic Task Completion with Positive Messaging
- Children click "I did this" to mark task complete
- Age-appropriate celebratory messages:
  - Ages 5-8: Fun emoji-based celebrations
  - Ages 9-12: Mature but encouraging messages
- Parents see completion history with timestamps
- All messaging celebrates effort, not perfection

### M3: Quality-Based Completion & Parent Review
- After completion, children self-rate 1-5 stars
  - 1 = "I gave it a try"
  - 5 = "I did my best"
- Optional notes field for additional context
- Parent review dashboard showing pending tasks
- Parents can approve, adjust rating, and provide feedback
- Children see final rating and parent feedback
- Feedback captures task completion quality

**Database**: task_completions (rating, notes, reviewer_id, feedback)

### M4: Daily Task View
- **Parent View**: All family tasks due today, grouped by child or status, with progress stats
- **Child View**: Only their tasks due today with quick complete button and progress
- Mobile-responsive interface
- Age-appropriate encouragement throughout

---

## User Types & Workflows

### Parent
**Goals**: Manage household chores, track children's progress, provide feedback

**Workflows**:
1. Create recurring task (daily, assign to children)
2. View family dashboard (today's tasks, completion status)
3. Mark skip dates for vacation/special days
4. Review pending completions (rating + notes)
5. Approve/adjust ratings and provide feedback
6. Manage children profiles and ages

### Child
**Goals**: Complete tasks, get encouragement, see parents' feedback

**Workflows**:
1. View my tasks for today
2. Mark task complete ("I did this")
3. Self-rate quality 1-5 stars
4. View parent's review and feedback
5. See positive messages and encouragement

---

## Technical Constraints

### Multi-Parent Architecture
- Multiple parents per family
- Shared access to all family data
- Track which parent reviewed each task
- Requires Row-Level Security (RLS) at database level
- Database isolation by family_id

### Task Recurrence
- Daily recurring tasks (no weekly/monthly for MVP)
- Support skip dates for vacation/special days
- Auto-generate daily instances in task_completions
- One completion record per child per day

### Quality Rating System
- 5-star self-rating (required before parent review)
- Optional notes field
- Parent can adjust rating (if child inflated/deflated)
- Task moves from "completed" → "pending_review" → "reviewed"
- Track which parent reviewed each completion

### Age-Based Customization
- Support ages 5-8 and 9-12 (expandable architecture)
- Different messaging per age group
- Different UI styling (optional future: different layouts)
- Messaging tone appropriate to age

---

## Database Entities

### Core Tables
1. **families** - Family unit (one per household)
2. **parents** - Parent users (1-3 per family)
3. **children** - Child profiles (1-10 per family)
4. **tasks** - Task definitions (templates)
5. **task_assignments** - Task-to-child assignments
6. **task_completions** - Completion records with rating/feedback
7. **recurring_task_instances** - Daily instances of recurring tasks
8. **subtasks** - Simple checklist items (part of task, not independently tracked)

### Key Fields
- **tasks**: title, description, category, priority, due_date, recurring
- **task_completions**: task_id, child_id, completed_at, rating (1-5), notes, reviewer_id (parent), feedback
- **children**: name, age_group (5-8, 9-12), family_id

---

## Success Criteria

### Functional
- ✅ Multiple parents per family can manage together
- ✅ Daily recurring tasks with skip dates work correctly
- ✅ Children self-rate quality with 1-5 stars
- ✅ Parents review and adjust ratings with feedback
- ✅ Age-appropriate UI messaging (5-8 vs 9-12)
- ✅ Works on desktop and mobile browsers

### Performance
- ✅ Response time <200ms average
- ✅ Page load <2 seconds on 4G
- ✅ Lighthouse score >90 (mobile)

### Quality
- ✅ No critical bugs on happy path
- ✅ Mobile touch targets ≥48px
- ✅ Keyboard navigation working
- ✅ WCAG AA accessibility compliance

### Operations
- ✅ Deployed to production (Vercel)
- ✅ Database backups enabled
- ✅ Error logging configured
- ✅ Performance monitoring enabled

---

## Included in MVP 1.0 (Added Requirements)

### M5: Multi-Language Support
- Support for 3 languages: Portuguese Brazilian (pt-BR), English Canadian (en-CA), French Canadian (fr-CA)
- Language selector in user settings
- All UI strings internationalized
- Age-appropriate messages translated per language
- Date/time localization per language

**Technologies**: next-i18next, react-i18next
**Effort**: 10-12 hours

### M6: TV Display Mode
- Large-screen optimized layout for family TVs
- `/display` route with auto-refresh (30 seconds)
- QR code for child quick-login from mobile device
- High-contrast, large fonts for visibility across room
- Works on any browser without casting protocol (MVP)

**Technologies**: qrcode.react, CSS media queries for large screens
**Effort**: 8-10 hours

**Note**: Chromecast and AirPlay support planned for Phase 2+

---

## Out of Scope for MVP 1.0

- Photo uploads/verification
- Weekly/monthly progress views
- Analytics dashboard
- Leaderboards or streaks
- Points/reward system
- Achievements or badges
- Chromecast/AirPlay casting protocols
- Granular permission control
- Offline mode
- Native mobile apps
- Complex recurring patterns (weekly, monthly, RRULE)

**Planned for Phase 2+** - See implementation-plan-next-release.md

---

## Architecture Notes

### Multi-Parent Design
- All parents see all family data
- Supabase Row-Level Security (RLS) ensures only family members access family data
- Track reviewer_id on each completion for audit trail

### Age Groups
- Support current age groups (5-8, 9-12)
- Design database to support easy expansion (age_group as enum)
- Messaging system indexed by age_group

### Daily Recurrence
- Task templates in "tasks" table
- Daily instances generated in "task_completions" (or separate table)
- Skip dates tracked per instance

### Positive Messaging
- No failure/incomplete language
- Focus on effort, not perfection
- Age-appropriate tone and emoji usage
- Celebratory on completion

---

## Next Steps

1. Review tech-stack.md for technology choices
2. Review implementation-plan-mvp-1.0.md for sprint-by-sprint breakdown
3. Review dev-ops.md for deployment strategy
4. Start Phase 0 (Project Scaffolding)
