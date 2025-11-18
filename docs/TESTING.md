# Testing Guide - Kids Chores Tracker

**Phase 3.1: Testing & Bug Fixes**
**Last Updated**: 2025-11-18

---

## Table of Contents

1. [Manual Testing Checklist](#manual-testing-checklist)
2. [Happy Path Testing](#happy-path-testing)
3. [Edge Case Testing](#edge-case-testing)
4. [Mobile Responsive Testing](#mobile-responsive-testing)
5. [Cross-Browser Testing](#cross-browser-testing)
6. [Performance Testing](#performance-testing)
7. [Accessibility Testing](#accessibility-testing)
8. [Bug Tracking](#bug-tracking)

---

## Manual Testing Checklist

### Pre-Testing Setup
- [ ] Clean database state (or use seeded test data)
- [ ] Clear browser cache and cookies
- [ ] Test with stable internet connection (for baseline)
- [ ] Test with throttled connection (4G simulation)
- [ ] Have test accounts ready (admin, parent, teen roles)

---

## Happy Path Testing

### 1. User Registration & Onboarding
**Goal**: New user can register and set up their family

- [ ] Navigate to registration page
- [ ] Enter valid email and password
- [ ] Verify email confirmation sent
- [ ] Complete onboarding flow:
  - [ ] Create family name
  - [ ] Set user role (admin)
  - [ ] Add first child (name, age group, photo)
- [ ] Verify redirect to dashboard
- [ ] Verify family created in database

**Expected Result**: User successfully registered with family and child created

---

### 2. Family Invitation Flow
**Goal**: Admin can invite another parent to join the family

#### As Admin:
- [ ] Navigate to family settings/members page
- [ ] Click "Invite Parent"
- [ ] Enter valid email address
- [ ] Select role (parent or admin)
- [ ] Submit invitation
- [ ] Verify invitation appears in "Pending Invitations"
- [ ] Copy invitation link (for testing)

#### As Invited Parent:
- [ ] Open invitation link in incognito/private window
- [ ] Register new account (if needed) or login
- [ ] Accept invitation
- [ ] Verify redirect to dashboard
- [ ] Verify family membership in database
- [ ] Verify can see family's children and tasks

**Expected Result**: Second parent successfully joins family with appropriate permissions

---

### 3. Child Management
**Goal**: Parents can add, edit, and manage children

- [ ] Add a new child:
  - [ ] Name: "Alex"
  - [ ] Age group: 5-8
  - [ ] Upload profile photo (or use default)
- [ ] Verify child appears in dashboard
- [ ] Edit child details:
  - [ ] Change name
  - [ ] Change age group (5-8 → 9-12)
  - [ ] Verify theme updates
- [ ] Verify child list shows updated information

**Expected Result**: Children can be created and edited successfully

---

### 4. Task Creation
**Goal**: Parents can create tasks with all features

- [ ] Navigate to "Create Task" page
- [ ] Fill in task details:
  - [ ] Title: "Make Your Bed"
  - [ ] Description: "Straighten sheets and pillows"
  - [ ] Category: "Cleaning"
  - [ ] Priority: "high"
  - [ ] Recurrence: "Daily"
  - [ ] Select image from library (bed icon)
- [ ] Assign to child (Alex)
- [ ] Submit task
- [ ] Verify task appears in:
  - [ ] Parent task list
  - [ ] Child's task list
  - [ ] Daily tasks view
- [ ] Verify task has correct image

**Expected Result**: Task created and visible to parent and child

---

### 5. Task Completion Flow (Child View)
**Goal**: Child can complete task with self-rating

#### Access Child View:
- [ ] Navigate to `/children/[child-id]/tasks`
- [ ] Verify authorization check works
- [ ] Verify child's assigned tasks visible

#### Complete Task:
- [ ] Click "I Did This!" button
- [ ] Modal opens with:
  - [ ] Task title and image
  - [ ] 5-star rating interface
  - [ ] Optional notes field
- [ ] Test keyboard navigation:
  - [ ] Tab through stars
  - [ ] Press Enter/Space to select star
  - [ ] ESC to close modal
- [ ] Select 4 stars
- [ ] Add note: "I made it really neat!"
- [ ] Submit completion
- [ ] Verify positive message displays (age-appropriate)
- [ ] Verify task moves to "Completed" section
- [ ] Verify task status is "pending_review"

**Expected Result**: Task marked complete with child's rating, awaiting parent review

---

### 6. Parent Review Workflow
**Goal**: Parent can review completed tasks and provide feedback

#### Access Reviews:
- [ ] Navigate to `/reviews` page
- [ ] Verify pending review appears with:
  - [ ] Child name and photo
  - [ ] Task title and image
  - [ ] Child's self-rating (4 stars)
  - [ ] Child's notes
  - [ ] "Pending Review" badge

#### Submit Review:
- [ ] Click "Review Task" button
- [ ] Review dialog opens
- [ ] Test accessibility:
  - [ ] ESC key closes modal
  - [ ] Tab navigation works
  - [ ] Focus trap keeps focus in modal
  - [ ] Backdrop click closes modal
- [ ] Adjust rating (keep at 4 stars or change)
- [ ] Add parent feedback:
  - "Great job making your bed! I love how you tucked in the corners. Keep up the good work!"
- [ ] Submit review
- [ ] Verify review disappears from pending list
- [ ] Verify task status is "completed"

**Expected Result**: Parent successfully reviews task with feedback

---

### 7. Completion History
**Goal**: Parents can view all completed tasks with ratings

- [ ] Navigate to `/completions` page
- [ ] Verify completed task appears with:
  - [ ] Child name and photo
  - [ ] Task title and category
  - [ ] Child's rating (stars displayed)
  - [ ] Child's notes (if provided)
  - [ ] Parent's rating (stars displayed)
  - [ ] Parent's feedback
  - [ ] Completion timestamp
- [ ] Test filter by child:
  - [ ] Select specific child from dropdown
  - [ ] Verify only that child's completions show
  - [ ] Select "All Children"
  - [ ] Verify all completions show again

**Expected Result**: All completion history visible with filters working

---

### 8. Daily Tasks View
**Goal**: Parents can see today's task overview

- [ ] Navigate to `/daily` page
- [ ] Verify displays:
  - [ ] Today's date
  - [ ] Progress cards for each child showing:
    - [ ] Child name and photo
    - [ ] Progress bar (X/Y tasks)
    - [ ] Breakdown (completed, pending review, not started)
  - [ ] All task assignments with status badges
- [ ] Test filter by child
- [ ] Verify status badges are correct:
  - [ ] Green "Completed" for reviewed tasks
  - [ ] Yellow "Pending Review" for child-completed tasks
  - [ ] Gray "Not Started" for incomplete tasks

**Expected Result**: Daily overview shows accurate task status for all children

---

### 9. Multi-Language Support
**Goal**: UI updates when language is changed

- [ ] Locate language selector in UI
- [ ] Change to Portuguese (pt-BR):
  - [ ] Verify navigation labels update
  - [ ] Verify button text updates
  - [ ] Verify form labels update
- [ ] Change to French (fr-CA):
  - [ ] Verify all text updates
- [ ] Change back to English (en-CA)
- [ ] Verify language preference persists on page reload

**Expected Result**: All UI text translates correctly, preference persists

---

### 10. Age-Specific Theming
**Goal**: UI adapts based on child age group

#### For 5-8 Age Group:
- [ ] View child's task page
- [ ] Verify playful colors (coral, teal, yellow)
- [ ] Verify large, colorful buttons
- [ ] Verify emoji-rich positive messages
- [ ] Complete a task
- [ ] Verify large star rating interface
- [ ] Verify celebration message is emoji-heavy

#### For 9-12 Age Group:
- [ ] Edit child to age group 9-12
- [ ] View child's task page
- [ ] Verify more mature colors (purple, green)
- [ ] Verify cleaner, less playful design
- [ ] Verify positive messages are text-based
- [ ] Complete a task
- [ ] Verify more subdued success messaging

**Expected Result**: Theme appropriately adjusts based on age group

---

## Edge Case Testing

### 1. Empty States
- [ ] Family with no children:
  - [ ] Dashboard shows empty state
  - [ ] Prompts to add first child
- [ ] Child with no assigned tasks:
  - [ ] Task page shows empty state
  - [ ] Suggests creating tasks
- [ ] No pending reviews:
  - [ ] Reviews page shows "All caught up!" message
- [ ] No completion history:
  - [ ] Completions page shows appropriate message

**Expected Result**: All empty states display helpful messages

---

### 2. Data Validation
- [ ] Task creation with missing required fields:
  - [ ] Title required
  - [ ] Category required
  - [ ] Verify error messages display
- [ ] Task completion without rating:
  - [ ] Verify rating is required
  - [ ] Error message displays
- [ ] Review without feedback:
  - [ ] Verify feedback is required
  - [ ] Error message displays
- [ ] Notes exceeding character limits:
  - [ ] Child notes (500 chars)
  - [ ] Parent feedback (1000 chars)
  - [ ] Verify character counter updates
  - [ ] Verify submission blocked if over limit

**Expected Result**: All validation rules enforced with clear error messages

---

### 3. Concurrent Operations
- [ ] Two parents reviewing same task simultaneously:
  - [ ] First parent submits review
  - [ ] Second parent attempts to submit
  - [ ] Verify optimistic locking prevents conflict
  - [ ] Error message: "Task may have been reviewed by another parent"
- [ ] Child completing same task twice in one day:
  - [ ] First completion succeeds
  - [ ] Second attempt shows error
  - [ ] Error message: "Task already completed today"

**Expected Result**: Race conditions handled gracefully with clear errors

---

### 4. Authorization Tests
- [ ] Access child tasks page with wrong family:
  - [ ] URL manipulation: Change child ID in `/children/[id]/tasks`
  - [ ] Verify redirects to dashboard
  - [ ] Console shows authorization error
- [ ] Teen role attempting admin actions:
  - [ ] Teen cannot create tasks
  - [ ] Teen cannot invite family members
  - [ ] Teen cannot delete children
- [ ] Unauthenticated access:
  - [ ] Direct URL to protected page
  - [ ] Verify redirects to login

**Expected Result**: All unauthorized access properly blocked and redirected

---

### 5. Network Failure Scenarios
- [ ] Submit task completion offline:
  - [ ] Disconnect network
  - [ ] Attempt completion
  - [ ] Verify error handling
  - [ ] Reconnect network
  - [ ] Retry submission
- [ ] Load page with slow connection:
  - [ ] Throttle to Slow 3G
  - [ ] Verify loading states display
  - [ ] Verify timeout handling
- [ ] API timeout:
  - [ ] Long-running request
  - [ ] Verify timeout message

**Expected Result**: Network failures handled gracefully with retry options

---

## Mobile Responsive Testing

### Devices to Test
- [ ] iPhone SE (375x667) - Small phone
- [ ] iPhone 12/13 (390x844) - Standard phone
- [ ] iPhone 14 Pro Max (430x932) - Large phone
- [ ] iPad Mini (768x1024) - Small tablet
- [ ] iPad Pro (1024x1366) - Large tablet
- [ ] Android Galaxy S21 (360x800)
- [ ] Android Pixel 6 (412x915)

### Critical Flows to Test on Mobile

#### 1. Navigation
- [ ] Bottom navigation visible on mobile (<768px)
- [ ] All navigation items accessible
- [ ] Active state clearly indicated
- [ ] Touch targets ≥48px
- [ ] No horizontal scrolling

#### 2. Task Completion Modal
- [ ] Modal fits on screen (max-height: 80vh)
- [ ] Star rating large enough to tap easily
- [ ] Keyboard doesn't obscure form fields
- [ ] Modal scrollable if content overflows
- [ ] Close button easily tappable

#### 3. Forms
- [ ] All input fields accessible
- [ ] Labels clearly visible
- [ ] Error messages display properly
- [ ] Submit buttons always visible
- [ ] No form fields cut off

#### 4. Lists and Cards
- [ ] Task cards stack vertically on mobile
- [ ] Images scale appropriately
- [ ] Text remains readable (≥16px)
- [ ] Spacing adequate for touch targets
- [ ] No layout breaking

#### 5. Images
- [ ] Profile photos load and display correctly
- [ ] Task images render properly
- [ ] Emoji fallbacks work
- [ ] No image overflow

**Expected Result**: All features fully functional and usable on mobile devices

---

## Cross-Browser Testing

### Browsers to Test
- [ ] **Chrome** (latest) - Windows/Mac/Android
- [ ] **Safari** (latest) - Mac/iOS
- [ ] **Firefox** (latest) - Windows/Mac
- [ ] **Edge** (latest) - Windows
- [ ] **Samsung Internet** - Android

### Features to Verify Per Browser
- [ ] Authentication flow
- [ ] Task creation and completion
- [ ] Modal components (focus trap, ESC key)
- [ ] Image uploads
- [ ] Date handling
- [ ] SWR caching behavior
- [ ] CSS Grid/Flexbox layouts
- [ ] Smooth scrolling
- [ ] Touch events (mobile browsers)

### Known Browser Quirks to Check
- [ ] **Safari**: Date parsing (ISO 8601 format)
- [ ] **Safari**: Autofill behavior on forms
- [ ] **iOS Safari**: Fixed positioning with keyboard
- [ ] **Safari**: Font rendering differences
- [ ] **Firefox**: Flexbox gap support
- [ ] **Edge**: Legacy compatibility mode

**Expected Result**: Consistent experience across all major browsers

---

## Performance Testing

### Tools
- Chrome DevTools Lighthouse
- Chrome DevTools Performance tab
- Network throttling (Slow 3G, Fast 3G, 4G)
- WebPageTest.org (optional)

### Metrics to Test

#### 1. Lighthouse Scores (Target: >90)
- [ ] Performance: ___ (target: >90)
- [ ] Accessibility: ___ (target: >90)
- [ ] Best Practices: ___ (target: >90)
- [ ] SEO: ___ (target: >90)

#### 2. Core Web Vitals
- [ ] **LCP** (Largest Contentful Paint): ___ (target: <2.5s)
- [ ] **FID** (First Input Delay): ___ (target: <100ms)
- [ ] **CLS** (Cumulative Layout Shift): ___ (target: <0.1)

#### 3. Page Load Times (4G Throttled)
- [ ] Homepage/Dashboard: ___ (target: <2s)
- [ ] Task creation page: ___ (target: <2s)
- [ ] Child tasks page: ___ (target: <2s)
- [ ] Reviews page: ___ (target: <2s)
- [ ] Daily tasks page: ___ (target: <2s)

#### 4. API Response Times
- [ ] GET /api/tasks: ___ (target: <200ms)
- [ ] POST /api/tasks/[id]/complete: ___ (target: <200ms)
- [ ] GET /api/completions: ___ (target: <200ms)
- [ ] POST /api/completions/[id]/review: ___ (target: <200ms)

#### 5. Bundle Size Analysis
- [ ] Run: `npm run build`
- [ ] Check `.next/static/chunks` sizes
- [ ] First Load JS: ___ (target: <200KB)
- [ ] Verify code splitting working
- [ ] Verify tree shaking working

### Performance Optimizations to Verify
- [ ] Images lazy loaded
- [ ] SWR caching prevents redundant requests
- [ ] Database queries use indexes
- [ ] No N+1 query problems
- [ ] useEffect cleanup functions prevent memory leaks
- [ ] Translation cache working (not reloading on each render)

**Expected Result**: All performance metrics meet or exceed targets

---

## Accessibility Testing

### Tools
- Chrome DevTools Lighthouse (Accessibility score)
- axe DevTools browser extension
- Keyboard navigation only (no mouse)
- Screen reader (NVDA on Windows, VoiceOver on Mac)

### WCAG AA Compliance Checklist

#### 1. Keyboard Navigation
- [ ] All interactive elements focusable via Tab
- [ ] Focus order is logical
- [ ] Focus indicators clearly visible (outline/ring)
- [ ] No keyboard traps
- [ ] ESC key closes modals
- [ ] Enter/Space activates buttons
- [ ] Arrow keys work in star rating

#### 2. Screen Reader Support
- [ ] Page titles descriptive
- [ ] Landmarks properly labeled (nav, main, aside)
- [ ] Headings hierarchical (h1 → h2 → h3)
- [ ] Form labels associated with inputs
- [ ] Error messages announced
- [ ] Loading states announced
- [ ] Modal dialogs announced with role="dialog"
- [ ] ARIA labels on icon-only buttons

#### 3. Color Contrast
- [ ] All text has ≥4.5:1 contrast ratio
- [ ] Large text (≥18pt) has ≥3:1 contrast
- [ ] UI components have ≥3:1 contrast
- [ ] Focus indicators have ≥3:1 contrast
- [ ] Check with contrast checker tool

#### 4. Touch Targets
- [ ] All buttons ≥48x48px on mobile
- [ ] Adequate spacing between clickable elements
- [ ] No accidental taps on adjacent elements

#### 5. Forms
- [ ] Labels visible and descriptive
- [ ] Required fields indicated
- [ ] Error messages specific and helpful
- [ ] Autocomplete attributes set appropriately
- [ ] Fieldsets group related inputs

#### 6. Images
- [ ] All images have alt text
- [ ] Decorative images have alt=""
- [ ] Icons have aria-label when used alone

#### 7. Modals
- [ ] Focus moves to modal on open
- [ ] Focus trap keeps focus in modal
- [ ] ESC closes modal
- [ ] Focus returns to trigger on close
- [ ] aria-modal="true" set
- [ ] aria-labelledby references title

**Expected Result**: No critical accessibility violations, WCAG AA compliant

---

## Bug Tracking

### Bug Report Template

```markdown
**Bug Title**: [Short, descriptive title]

**Severity**: [Critical | High | Medium | Low]

**Priority**: [P0 - Blocker | P1 - Critical | P2 - Important | P3 - Nice to have]

**Environment**:
- Browser: [Chrome 120, Safari 17, etc.]
- Device: [Desktop, iPhone 13, etc.]
- OS: [Windows 11, macOS 14, iOS 17, etc.]

**Steps to Reproduce**:
1. Navigate to...
2. Click on...
3. Enter...
4. Observe...

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots/Video**:
[Attach if applicable]

**Console Errors**:
[Paste any errors from browser console]

**Workaround** (if known):
[How to work around this bug temporarily]
```

### Bug Severity Definitions

- **Critical**: App unusable, data loss, security vulnerability
- **High**: Major feature broken, impacts multiple users
- **Medium**: Feature partially broken, has workaround
- **Low**: Cosmetic issue, minor inconvenience

### Testing Session Log

**Date**: __________
**Tester**: __________
**Browser**: __________
**Device**: __________

#### Bugs Found:
1. [Bug ID] - [Title] - [Severity]
2. [Bug ID] - [Title] - [Severity]
3. ...

#### Test Cases Passed: ___ / ___
#### Test Cases Failed: ___
#### Blocking Issues: ___

---

## Success Criteria

### Phase 3.1 Complete When:
- [ ] All happy path test cases pass
- [ ] All critical edge cases handled
- [ ] Mobile responsive on all tested devices
- [ ] Works correctly in all major browsers
- [ ] Performance targets met (<2s page load on 4G)
- [ ] Accessibility score >90, no critical violations
- [ ] Zero P0/P1 bugs remaining
- [ ] Documentation complete

**Ready for Sprint 3.2: Polish & Production Deployment**
