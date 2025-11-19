# Implementation Plan - MVP 1.1

**Version**: 1.1
**Status**: Planning Phase
**Dependencies**: Completed MVP 1.0
**Total Effort**: 92-104 hours (3-4 months @ 6-8 hours/week)
**Target Release**: Q2 2025

---

## Overview

MVP 1.1 focuses on analytics, enhanced views, and gamification features to improve user engagement and provide better insights into task completion patterns. This release builds on the solid foundation of MVP 1.0 with advanced data visualization and motivational systems.

| Phase | Features | Duration | Effort | Outcome |
|-------|----------|----------|--------|---------|
| 1: Analytics & Views | 4 features | 6-8 weeks | 56-66h | Enhanced tracking & insights |
| 2: Gamification | 4 features | 5-6 weeks | 42-50h | Motivation & engagement |
| **Total** | **8 features** | **11-14 weeks** | **98-116h** | **Full-featured chore system** |

---

## Phase 1: Analytics & Enhanced Views (56-66 hours)

### Sprint 1.1: Advanced Recurring Task Patterns (14-16 hours)

**Description**: Support weekly, monthly, and custom patterns (RRULE) for task recurrence

**Priority**: MEDIUM

**Dependencies**:
- MVP 1.0 task system
- `recurring_task_instances` table (already exists)

**Technologies**:
- `date-fns` - Date manipulation and formatting
- `rrule` library - RFC 5545 recurrence rule parsing

**Features**:
- Weekly recurrence: Select specific days of week (e.g., "Mow lawn" every Sunday)
- Monthly recurrence: Select day of month (e.g., "Pay bills" on the 1st)
- Custom patterns: Every N days (e.g., "Chores rotate" every 3 days per child)
- RRULE string support for advanced patterns
- Visual pattern builder (no RRULE knowledge needed)
- Pattern preview: "Next 5 occurrences: Jun 1, Jun 8, Jun 15..."

**Implementation Tasks**:
- [ ] Install `rrule` library
- [ ] Create `RecurrencePatternPicker` component
- [ ] Update task creation form with recurrence options
- [ ] Implement RRULE generator from UI selections
- [ ] Update task instance generation logic
- [ ] Add pattern preview component
- [ ] Update database schema (add `rrule` column to tasks)
- [ ] Migration for existing daily tasks → RRULE conversion

**Example Use Cases**:
- Weekly: "Mow lawn" every Sunday
- Monthly: "Pay bills" on the 1st of each month
- Custom: "Chores rotate" every 3 days per child
- Bi-weekly: "Deep clean kitchen" every other Saturday

**Deliverables**:
- [ ] RRULE pattern builder UI
- [ ] Weekly/monthly/custom recurrence working
- [ ] Pattern preview showing next occurrences
- [ ] All existing daily tasks migrated to RRULE

---

### Sprint 1.2: Enhanced Calendar Views (18-22 hours)

**Description**: Interactive calendar grid system with seamless navigation between daily, weekly, and monthly views

**Priority**: HIGH - User-requested feature

**Dependencies**:
- MVP 1.0 daily view (already exists)
- Task completion history

**Technologies**:
- `react-calendar` - Calendar grid component
- `date-fns` - Date calculations
- `recharts` - Mini charts for calendar cells
- `@tanstack/react-query` - Data caching

**Features**:

#### Daily View ✅ (Already in MVP 1.0)
- Current day's tasks with completion status
- Progress indicator per child
- Quick action buttons

#### Weekly View Grid (NEW)
- 7-day grid view (configurable Sun-Sat or Mon-Sun)
- Each day cell shows:
  - Total tasks count badge
  - Completion percentage circular progress
  - Status indicators: ✅ completed, ⏳ pending, ❌ not started
- Click day → drill down to daily view
- Week navigation: Previous/Next week arrows
- Current week highlighted with border
- Weekly summary card:
  - "15/20 tasks completed this week (75%)"
  - Best day of the week
  - Trend vs previous week (↗️ +10% or ↘️ -5%)

#### Monthly View Grid (NEW)
- Full month calendar grid (traditional calendar layout)
- Each day cell shows:
  - Task count: "5/8 tasks"
  - Completion percentage as color intensity (heat map)
  - ⭐ visual indicator for 100% completion days
- Click day → go to daily view
- Click week row → go to weekly view
- Month navigation: Previous/Next month arrows
- Month-to-month comparison
- Monthly summary card:
  - "120/150 tasks completed this month (80%)"
  - Average daily completion rate
  - Perfect days count: "8 days with 100% completion"
  - Comparison: "↗️ +12% vs last month"

#### Navigation Flow
```
Monthly View (grid with heat map)
    ↕ (click week row)
Weekly View (7-day grid with details)
    ↕ (click day)
Daily View (existing MVP view)
```

**Implementation Details**:
- **Color coding**:
  - Green (80-100%): Excellent
  - Yellow (50-79%): Good
  - Red (<50%): Needs attention
  - Gray (0%): Not started
- **Mobile responsive**: Swipe gestures for month/week navigation
- **Data caching**: TanStack Query for efficient data fetching
- **Accessibility**:
  - Keyboard navigation (arrow keys to move between days)
  - ARIA labels for screen readers
  - Focus indicators
- **i18n**:
  - Date formats per locale
  - Week start day configurable (Sunday vs Monday)

**Implementation Tasks**:
- [ ] Install `react-calendar`, `@tanstack/react-query`
- [ ] Create `/calendar` route with view switcher
- [ ] Implement `WeeklyCalendarView` component
- [ ] Implement `MonthlyCalendarView` component
- [ ] Create heat map color calculation logic
- [ ] Add swipe gesture support for mobile
- [ ] Implement data fetching hooks with TanStack Query
- [ ] Add keyboard navigation
- [ ] Create summary stat cards
- [ ] Add trend calculation (week-over-week, month-over-month)

**API Routes**:
- `GET /api/calendar/weekly?date=2025-01-15` - Get week data
- `GET /api/calendar/monthly?year=2025&month=1` - Get month data
- `GET /api/calendar/trends?period=week|month` - Get trend data

**Deliverables**:
- [ ] Weekly calendar view with 7-day grid
- [ ] Monthly calendar view with heat map
- [ ] Navigation between all 3 views working
- [ ] Mobile swipe gestures functional
- [ ] Summary stats and trends displaying
- [ ] Keyboard navigation working

---

### Sprint 1.3: Analytics Dashboard (12-14 hours)

**Description**: Comprehensive view of family chore metrics and insights

**Priority**: MEDIUM

**Dependencies**:
- Enhanced calendar views (Sprint 1.2)
- Task completion history (MVP 1.0)

**Technologies**:
- `recharts` - Charts and data visualization
- `@tanstack/react-query` - Data management
- `zustand` - UI state for filters

**Features**:

#### Overview Stats (Top Cards)
- Total tasks completed (all-time)
- Tasks completed this month
- Average completion rate (family-wide)
- Current streak (consecutive days with completions)

#### Charts & Visualizations
1. **Completion Trend Chart** (Line chart)
   - Last 30 days task completion counts
   - Toggle: Daily/Weekly/Monthly view
   - Hover tooltip with details

2. **Child Performance Chart** (Bar chart)
   - Completion rate per child
   - Color-coded by age group theme
   - Shows comparison across children

3. **Category Breakdown** (Pie chart)
   - Tasks by category: Cleaning, Homework, Hygiene, etc.
   - Click slice to filter dashboard

4. **Time Patterns** (Heatmap)
   - Which days of week have highest completion
   - Which hours of day tasks completed (if time tracked)

5. **Quality Ratings** (Stacked bar chart)
   - Distribution of 1-5 star ratings over time
   - Shows quality trends

#### Top Performers Section
- "Star of the Week" - Highest completion rate
- "Consistency Champion" - Longest current streak
- "Quality Leader" - Highest average rating

#### Filters
- Date range selector (Last 7 days, 30 days, 3 months, All time)
- Child filter (All children, or select specific child)
- Category filter

**Implementation Tasks**:
- [ ] Install `recharts`, `zustand`
- [ ] Create `/analytics` route
- [ ] Implement overview stats cards
- [ ] Create completion trend line chart
- [ ] Create child performance bar chart
- [ ] Create category pie chart
- [ ] Create time patterns heatmap
- [ ] Create quality ratings chart
- [ ] Implement top performers section
- [ ] Add filter controls with Zustand state
- [ ] Create analytics API endpoints
- [ ] Add export to CSV functionality

**API Routes**:
- `GET /api/analytics/overview?start=...&end=...` - Overview stats
- `GET /api/analytics/trends?period=week|month` - Trend data
- `GET /api/analytics/children?childId=...` - Per-child stats
- `GET /api/analytics/categories` - Category breakdown
- `GET /api/analytics/export?format=csv` - Export data

**Deliverables**:
- [ ] Analytics dashboard page with all charts
- [ ] Overview stats displaying correctly
- [ ] All 5 charts rendering with real data
- [ ] Filter controls working
- [ ] Top performers section functional
- [ ] CSV export working

---

### Sprint 1.4: Task Subtasks/Checklist (12-14 hours)

**Description**: Break down complex tasks into smaller, manageable steps with individual completion tracking

**Priority**: MEDIUM - Database schema exists, needs UI implementation

**Dependencies**:
- MVP 1.0 task system
- Subtasks table (already exists in database)

**Technologies**:
- `@dnd-kit/core` - Drag-and-drop for reordering
- Zod validation (already in project)

**Status**: Database table already created (migration 01-schema.sql), needs UI implementation

**Features**:
- Add unlimited subtasks to any task
- Drag-and-drop to reorder subtasks (parent view only)
- Check off individual subtasks as completed
- Show progress: "3/5 subtasks complete" with visual progress bar
- Age-appropriate UI:
  - **5-8 years**: Large checkboxes (48px) with emoji rewards per subtask ✅🎉
  - **9-12 years**: Standard checkboxes with progress bar
- Parent view shows subtask completion in review dialog
- Optional setting: Require all subtasks complete before marking main task done
- Subtasks persist across recurring task instances

**Database** (Already exists in migration 01-schema.sql):
```sql
CREATE TABLE subtasks (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  title VARCHAR(255),
  description TEXT,
  order_index INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**UI Components**:
- `SubtaskList` - Display and manage subtasks (parent + child views)
- `SubtaskItem` - Individual subtask row with checkbox and drag handle
- `AddSubtaskForm` - Inline form to create new subtasks
- `SubtaskProgress` - Visual progress bar/indicator
- `SubtaskDragHandle` - Drag handle icon (parent view only)

**Implementation Tasks**:
- [ ] Install `@dnd-kit/core`, `@dnd-kit/sortable`
- [ ] Create `SubtaskList` component
- [ ] Create `SubtaskItem` component with checkbox
- [ ] Implement drag-and-drop reordering (parent view)
- [ ] Create `AddSubtaskForm` inline component
- [ ] Create `SubtaskProgress` indicator
- [ ] Add age-appropriate styling (5-8 vs 9-12)
- [ ] Update task form to include subtask management
- [ ] Update task completion modal to show subtasks
- [ ] Add "require all subtasks" toggle to task settings
- [ ] Update review dialog to show subtask completion
- [ ] Add subtask API endpoints

**API Routes**:
- `GET /api/tasks/[id]/subtasks` - Get all subtasks for task
- `POST /api/tasks/[id]/subtasks` - Create new subtask
- `PATCH /api/subtasks/[id]` - Update subtask (title, order, completed)
- `DELETE /api/subtasks/[id]` - Delete subtask
- `PATCH /api/subtasks/[id]/reorder` - Reorder subtasks

**Example Use Cases**:
- "Clean your room" → [Make bed, Put away toys, Vacuum floor, Organize desk]
- "Homework" → [Math worksheet, Reading 20 minutes, Spelling practice]
- "Morning routine" → [Brush teeth, Get dressed, Eat breakfast, Pack backpack]
- "Wash dishes" → [Clear table, Rinse dishes, Load dishwasher, Wipe counters]

**Deliverables**:
- [ ] Subtask list displaying on task cards
- [ ] Add/edit/delete subtasks working
- [ ] Drag-and-drop reordering functional
- [ ] Subtask completion tracking working
- [ ] Progress indicators displaying correctly
- [ ] Age-appropriate UI variations working
- [ ] "Require all subtasks" setting functional

---

## Phase 2: Media & Gamification (42-50 hours)

### Sprint 2.1: Points & Reward System (14-16 hours)

**Description**: Children earn points for completed tasks, redeem for rewards

**Priority**: HIGH - Core gamification feature

**Dependencies**:
- MVP 1.0 task completion system
- MVP 1.0 quality rating system

**Technologies**:
- `zustand` - Points state management
- Supabase Edge Functions - Point calculation

**Features**:

#### Point Earning Mechanics
- **Base points**: 10 points per task completion
- **Quality bonus**:
  - 1 star: +0 points (10 total)
  - 2 stars: +2 points (12 total)
  - 3 stars: +5 points (15 total)
  - 4 stars: +8 points (18 total)
  - 5 stars: +10 points (20 total)
- **Streak bonus**: +5 points for maintaining 7-day streak
- **Perfect day bonus**: +10 points for completing all assigned tasks in one day

#### Rewards System
- **Parent-defined rewards**: Parents create custom rewards with point costs
- **Reward categories**:
  - Screen time (e.g., "30 min extra gaming" = 50 points)
  - Allowance (e.g., "$5 allowance" = 100 points)
  - Privileges (e.g., "Choose dinner" = 30 points)
  - Activities (e.g., "Movie night" = 75 points)
  - Items (e.g., "New toy" = 200 points)
- **Redemption flow**: Child browses rewards, requests redemption, parent approves
- **Redemption history**: Track all point transactions

#### Points Dashboard (Child View)
- Current point balance (large, prominent display)
- Points earned this week
- Available rewards grid with point costs
- "Request Reward" button
- Recent point transactions

#### Rewards Management (Parent View)
- Create/edit/delete rewards
- Set point costs
- Approve/deny redemption requests
- View redemption history
- Adjust child point balances (manual corrections)

**Database Changes**:
```sql
-- Add to task_completions table
ALTER TABLE task_completions ADD COLUMN points INTEGER DEFAULT 0;

-- New rewards table
CREATE TABLE rewards (
  id UUID PRIMARY KEY,
  family_id UUID REFERENCES families(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  category VARCHAR(50),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- New point_transactions table (audit trail)
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY,
  child_id UUID REFERENCES children(id),
  family_id UUID REFERENCES families(id),
  amount INTEGER NOT NULL, -- positive for earning, negative for spending
  transaction_type VARCHAR(50), -- 'task_completion', 'bonus', 'redemption', 'manual'
  reference_id UUID, -- task_completion_id or reward_id
  description TEXT,
  created_at TIMESTAMP
);
```

**Implementation Tasks**:
- [ ] Install `zustand`
- [ ] Create database migrations for rewards and point_transactions
- [ ] Create `PointsDisplay` component (child view)
- [ ] Create `RewardsGrid` component (browse rewards)
- [ ] Create `RewardCard` component
- [ ] Create `RedemptionRequest` component
- [ ] Create `RewardsManagement` page (parent view)
- [ ] Create `RewardForm` component (create/edit)
- [ ] Implement point calculation logic
- [ ] Create point transaction hooks
- [ ] Add points to task completion flow
- [ ] Create redemption approval flow
- [ ] Add point transaction API endpoints

**API Routes**:
- `GET /api/children/[id]/points` - Get child point balance and history
- `GET /api/rewards?familyId=...` - Get all family rewards
- `POST /api/rewards` - Create reward
- `PATCH /api/rewards/[id]` - Update reward
- `DELETE /api/rewards/[id]` - Delete reward
- `POST /api/points/redeem` - Request reward redemption
- `PATCH /api/points/redemptions/[id]` - Approve/deny redemption
- `GET /api/points/transactions?childId=...` - Get transaction history

**Deliverables**:
- [ ] Point earning working on task completion
- [ ] Points dashboard displaying for children
- [ ] Rewards management working for parents
- [ ] Reward redemption request flow functional
- [ ] Parent approval/denial working
- [ ] Point transaction history displaying
- [ ] All point calculations accurate

---

### Sprint 2.2: Achievement Badges & Streaks (10-12 hours)

**Description**: Celebrate consistent effort with badges and streak counters

**Priority**: MEDIUM

**Dependencies**:
- Point system (Sprint 2.1)
- Task completion tracking (MVP 1.0)

**Technologies**:
- `zustand` - Achievement state
- `shadcn/ui` Badge component

**Features**:

#### Achievement Badges
Unlock badges for various accomplishments:

**Starter Badges**:
- "First Task" - Complete your first task
- "First Week" - Complete 7+ tasks in your first week
- "Helpful Helper" - Complete 25 tasks total

**Consistency Badges**:
- "Week Warrior" - 7+ tasks completed in one week
- "Month Champion" - 30+ tasks completed in one month
- "Perfect Week" - 100% completion rate for one week
- "Perfect Month" - 100% completion rate for one month

**Streak Badges**:
- "Streak Starter" - 3-day completion streak
- "Streak Champion" - 14-day completion streak
- "Streak Legend" - 30-day completion streak

**Quality Badges**:
- "Quality Master" - All ratings 5⭐ for one week
- "Excellence Award" - All ratings 5⭐ for one month
- "Above & Beyond" - 50 tasks with 5⭐ rating

**Category Badges** (one per category):
- "Clean Machine" - 20 cleaning tasks completed
- "Homework Hero" - 20 homework tasks completed
- "Hygiene Champion" - 20 hygiene tasks completed
- etc. (one per category)

**Special Badges**:
- "Early Bird" - 10 tasks completed before 9am
- "Night Owl" - 10 tasks completed after 8pm
- "Weekend Warrior" - 20 tasks completed on weekends

#### Streak System
- Track consecutive days of **any** task completion
- Display current streak: "3-day streak 🔥"
- Show longest streak ever: "Best: 15 days"
- Notify when streak is at risk: "Complete a task today to keep your 7-day streak!"
- Visual streak calendar showing active days
- Streak "freeze" option: Parent can preserve streak if child is sick/away (1 freeze per month)

#### Badge Display
- **Child View**: "My Badges" page showing all earned badges
  - Unlocked badges in color with unlock date
  - Locked badges in grayscale with unlock requirements
  - Progress bars: "Week Warrior: 5/7 tasks this week"
- **Parent View**: See all children's badges and achievements
- **Notification**: Toast notification when badge unlocked

**Database Changes**:
```sql
-- New achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'first_task', 'week_warrior'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  badge_icon VARCHAR(50), -- emoji or icon name
  unlock_criteria JSONB, -- flexible criteria definition
  category VARCHAR(50), -- 'starter', 'consistency', 'streak', 'quality', etc.
  created_at TIMESTAMP
);

-- New child_achievements table (unlocked badges)
CREATE TABLE child_achievements (
  id UUID PRIMARY KEY,
  child_id UUID REFERENCES children(id),
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMP,
  UNIQUE(child_id, achievement_id)
);

-- Add to children table
ALTER TABLE children ADD COLUMN current_streak INTEGER DEFAULT 0;
ALTER TABLE children ADD COLUMN longest_streak INTEGER DEFAULT 0;
ALTER TABLE children ADD COLUMN last_completion_date DATE;
ALTER TABLE children ADD COLUMN streak_freezes_available INTEGER DEFAULT 1;
```

**Implementation Tasks**:
- [ ] Create database migrations
- [ ] Seed initial achievement definitions
- [ ] Create achievement check logic (cron or on completion)
- [ ] Create `BadgesPage` component (child view)
- [ ] Create `BadgeCard` component (unlocked/locked states)
- [ ] Create `StreakDisplay` component
- [ ] Create `StreakCalendar` component
- [ ] Implement streak tracking logic
- [ ] Add streak notifications
- [ ] Create badge unlock notification
- [ ] Add "My Badges" to child navigation
- [ ] Create parent achievement overview page

**API Routes**:
- `GET /api/children/[id]/achievements` - Get child's achievements
- `GET /api/children/[id]/streak` - Get streak info
- `POST /api/achievements/check` - Check for newly unlocked achievements
- `POST /api/streak/freeze` - Use streak freeze

**Deliverables**:
- [ ] All achievement badges defined and seeded
- [ ] Badge unlock detection working
- [ ] Badge display page functional
- [ ] Streak tracking working correctly
- [ ] Streak notifications displaying
- [ ] Streak calendar showing active days
- [ ] Streak freeze feature working

---

### Sprint 2.3: Leaderboard & Family Competition (8-10 hours)

**Description**: Optional family-wide task completion leaderboard

**Priority**: LOW - Optional feature, use with caution

**Dependencies**:
- Points system (Sprint 2.1)
- Achievement badges (Sprint 2.2)

**Technologies**:
- `zustand` - Leaderboard state
- `framer-motion` - Rank animations

**Features**:

#### Leaderboard Views
1. **All-Time Leaderboard**
   - Total points earned (all-time)
   - Rank with position change indicator (↗️ ↘️ -)

2. **This Month Leaderboard**
   - Points earned this month
   - Rank for current month

3. **This Week Leaderboard**
   - Points earned this week
   - Rank for current week

#### Fair Competition Features
- **Age Group Filter**: Compare only within same age group (5-8 vs 9-12)
- **Effort-Based Ranking**: Option to rank by completion rate % instead of total points
- **Personal Bests**: Highlight personal improvements ("↗️ +15% from last week!")
- **Team Mode**: Optional family total (collaborative instead of competitive)

#### Leaderboard Display
- Top 3 podium display with medals 🥇🥈🥉
- Position number for all children
- Child name/avatar
- Points earned
- Rank change indicator
- Filter controls (time period, age group)
- Toggle: "Individual" vs "Team Total"

#### Parent Controls
- **Enable/Disable Leaderboard**: Full on/off toggle per family
- **Visibility Settings**:
  - "Show to all children"
  - "Show only to each child (no comparison)"
  - "Parents only (hidden from children)"
- **Mode Selection**: Competitive vs Collaborative

**Warning Notice** (shown to parents):
> ⚠️ **Use Carefully**: Leaderboards can be motivating for some children but discouraging for others. Monitor your children's reactions and disable if it creates unhealthy competition or stress.

**Database Changes**:
```sql
-- Add to families table
ALTER TABLE families ADD COLUMN leaderboard_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE families ADD COLUMN leaderboard_visibility VARCHAR(50) DEFAULT 'show_all'; -- 'show_all', 'individual', 'parents_only'
ALTER TABLE families ADD COLUMN leaderboard_mode VARCHAR(50) DEFAULT 'competitive'; -- 'competitive', 'collaborative'
```

**Implementation Tasks**:
- [ ] Install `framer-motion`
- [ ] Create database migration
- [ ] Create `LeaderboardPage` component
- [ ] Create `PodiumDisplay` component (top 3)
- [ ] Create `LeaderboardRow` component
- [ ] Create `LeaderboardFilters` component
- [ ] Implement ranking calculation logic
- [ ] Add age group filtering
- [ ] Create team total calculation
- [ ] Add parent control settings page
- [ ] Implement visibility logic
- [ ] Add rank change animations

**API Routes**:
- `GET /api/leaderboard?period=week|month|alltime&ageGroup=...` - Get rankings
- `GET /api/leaderboard/team` - Get family team total
- `PATCH /api/families/[id]/leaderboard-settings` - Update settings

**Deliverables**:
- [ ] Leaderboard page with all time periods
- [ ] Podium display for top 3
- [ ] Age group filtering working
- [ ] Team mode toggle functional
- [ ] Parent control settings page
- [ ] Visibility controls working correctly
- [ ] Warning notice displayed to parents

---

### Sprint 2.4: Chromecast Integration (10-12 hours)

**Description**: Cast family dashboard to TV via Chromecast

**Priority**: LOW - Nice-to-have feature

**Dependencies**:
- MVP 1.0 daily view
- Enhanced calendar views (Sprint 1.2)

**Technologies**:
- Google Cast SDK
- React

**Features**:

#### Chromecast Sender (Parent Phone App)
- "Cast to TV" button in dashboard header
- Device discovery and selection
- Live dashboard streaming to TV
- Remote control from phone:
  - Change view (daily/weekly/monthly)
  - Pause/resume updates
  - Refresh data
- Auto-reconnect on network changes
- Disconnect button

#### Chromecast Receiver (TV Display)
- Full-screen family dashboard optimized for TV
- Auto-rotating views:
  - Daily view (30 seconds)
  - Weekly view (30 seconds)
  - Monthly view (30 seconds)
  - Top performers (15 seconds)
  - Current streaks (15 seconds)
- Large, readable fonts (TV-optimized)
- High-contrast colors
- Real-time updates when data changes
- Family name and current time in corner
- "Casting from [Parent Name]'s phone" indicator

#### TV Display Customization (Parent Settings)
- Enable/disable auto-rotation
- Select which views to show
- Set rotation timing
- Choose display theme (match child themes or neutral)
- Toggle "Top performers" visibility

**Implementation Tasks**:
- [ ] Install Google Cast SDK: `npm install @types/chromecast-caf-sender`
- [ ] Create custom receiver app (HTML/JS for TV)
- [ ] Register receiver app with Google Cast Console
- [ ] Create `CastButton` component (sender)
- [ ] Implement device discovery
- [ ] Create connection logic
- [ ] Create TV-optimized dashboard layout (receiver)
- [ ] Implement auto-rotation logic
- [ ] Add remote control message passing
- [ ] Create cast settings page
- [ ] Test on real Chromecast device
- [ ] Handle disconnect/reconnect scenarios

**API Routes**:
- `GET /api/cast/dashboard-data` - Get optimized dashboard data for TV
- `GET /api/families/[id]/cast-settings` - Get cast display settings

**Cast Receiver Application**:
- Hosted at: `https://[your-domain]/cast-receiver.html`
- Registered with Google Cast Console
- Receives messages from sender app
- Displays optimized family dashboard

**Deliverables**:
- [ ] Cast button working on parent app
- [ ] Device discovery functional
- [ ] TV receiver app displaying correctly
- [ ] Auto-rotation working
- [ ] Remote control from phone functional
- [ ] Cast settings page complete
- [ ] Tested on physical Chromecast device

---

## Technology Stack Additions

### New Dependencies for MVP 1.1

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.5.0",
    "recharts": "^2.10.0",
    "date-fns": "^3.0.0",
    "rrule": "^2.8.0",
    "react-calendar": "^4.8.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "@types/chromecast-caf-sender": "^1.0.0"
  }
}
```

### Technology Rationale

**TanStack Query v5**:
- Automatic caching for calendar/analytics data
- Background refetching keeps data fresh
- Optimistic updates for better UX
- Minimal boilerplate compared to Redux

**Zustand**:
- Lightweight (2.2 kB) state management
- Perfect for points, filters, UI state
- No Provider boilerplate needed
- DevTools support

**Recharts**:
- Component-based API (React-friendly)
- Responsive charts out of the box
- Customizable and themeable
- Smaller than Chart.js

**date-fns**:
- Modern, functional API
- Tree-shakeable (small bundle)
- Excellent timezone support
- Required for RRULE integration

**rrule**:
- RFC 5545 compliant
- Handles complex recurrence patterns
- Used by Google Calendar
- Well-maintained

**@dnd-kit**:
- Modern drag-and-drop for React
- Accessibility-first design
- Touch-friendly
- Better than react-dnd for our use case

---

## Development Timeline

### Phase 1: Analytics & Enhanced Views (6-8 weeks)

**Weeks 1-2**: Sprint 1.1 - Advanced Recurring Patterns
- Install dependencies
- Build RRULE pattern picker UI
- Update task creation flow
- Migrate existing tasks

**Weeks 3-4**: Sprint 1.2 - Enhanced Calendar Views
- Build weekly calendar grid
- Build monthly calendar with heat map
- Implement navigation between views
- Add mobile gestures

**Weeks 5-6**: Sprint 1.3 - Analytics Dashboard
- Create analytics page layout
- Build all 5 charts
- Implement filters
- Add top performers section

**Weeks 7-8**: Sprint 1.4 - Task Subtasks
- Build subtask UI components
- Implement drag-and-drop
- Add subtask API endpoints
- Integrate with task flow

**Milestone**: v1.1 Phase 1 Complete - Enhanced tracking and insights

---

### Phase 2: Gamification (5-6 weeks)

**Weeks 9-10**: Sprint 2.1 - Points & Rewards
- Create database schema
- Build points dashboard
- Build rewards management
- Implement redemption flow

**Weeks 11-12**: Sprint 2.2 - Badges & Streaks
- Seed achievement definitions
- Build badge display page
- Implement streak tracking
- Add notifications

**Week 13**: Sprint 2.3 - Leaderboard
- Build leaderboard page
- Add parent controls
- Implement age group filtering
- Add team mode

**Week 14**: Sprint 2.4 - Chromecast (Optional)
- Build cast sender
- Create TV receiver app
- Test on device

**Milestone**: v1.1 Complete - Full-featured gamification system

---

## Effort Summary

| Sprint | Feature | Effort | Priority |
|--------|---------|--------|----------|
| 1.1 | Advanced Recurring Patterns | 14-16h | Medium |
| 1.2 | Enhanced Calendar Views | 18-22h | **HIGH** |
| 1.3 | Analytics Dashboard | 12-14h | Medium |
| 1.4 | Task Subtasks | 12-14h | Medium |
| 2.1 | Points & Rewards | 14-16h | **HIGH** |
| 2.2 | Badges & Streaks | 10-12h | Medium |
| 2.3 | Leaderboard | 8-10h | Low |
| 2.4 | Chromecast | 10-12h | Low |
| **Total** | **8 features** | **98-116h** | - |

**Recommended Implementation Order** (by priority):
1. Sprint 1.2 - Enhanced Calendar Views (HIGH)
2. Sprint 2.1 - Points & Rewards (HIGH)
3. Sprint 1.1 - Advanced Recurring Patterns (MEDIUM)
4. Sprint 1.3 - Analytics Dashboard (MEDIUM)
5. Sprint 1.4 - Task Subtasks (MEDIUM)
6. Sprint 2.2 - Badges & Streaks (MEDIUM)
7. Sprint 2.3 - Leaderboard (LOW, optional)
8. Sprint 2.4 - Chromecast (LOW, optional)

---

## Success Criteria

### Functional Requirements
- [ ] Weekly/monthly recurring patterns working
- [ ] Calendar views navigable (daily → weekly → monthly)
- [ ] Analytics dashboard showing accurate metrics
- [ ] Subtasks can be added, reordered, and tracked
- [ ] Points earned and displayed correctly
- [ ] Rewards can be created and redeemed
- [ ] Achievement badges unlock properly
- [ ] Streak tracking accurate

### Performance Requirements
- [ ] Calendar loads <500ms
- [ ] Analytics charts render <1s
- [ ] Point calculations instant
- [ ] No lag when checking subtasks

### Quality Requirements
- [ ] All new features mobile-responsive
- [ ] WCAG AA accessibility maintained
- [ ] TypeScript strict mode: zero errors
- [ ] Age-appropriate theming applied
- [ ] i18n support for all new strings

### User Experience
- [ ] Gamification feels motivating, not stressful
- [ ] Parents have control over competitive features
- [ ] Children understand point system clearly
- [ ] Calendar navigation intuitive

---

## Risk Mitigation

### Risk: Gamification Backfire
**Concern**: Points/leaderboards may discourage low-performing children

**Mitigation**:
- Parent controls to disable features
- Age group filtering for fair competition
- "Team mode" collaborative option
- Focus on personal improvement, not just ranking
- Warning notices for parents

### Risk: Complexity Overload
**Concern**: Too many features may confuse younger children (5-8)

**Mitigation**:
- Age-appropriate UI simplification
- Progressive disclosure (hide advanced features for younger kids)
- Parent-controlled feature toggles
- Clear onboarding for new features

### Risk: Performance Degradation
**Concern**: Complex charts/calendars may slow down app

**Mitigation**:
- TanStack Query caching
- Code splitting for analytics/calendar pages
- Lazy loading charts
- Pagination for large datasets
- Performance testing with 1000+ completions

### Risk: Scope Creep
**Concern**: Sprints may expand beyond estimates

**Mitigation**:
- Prioritization matrix (HIGH > MEDIUM > LOW)
- Optional features clearly marked (Leaderboard, Chromecast)
- Can ship Phase 1 without Phase 2 if needed
- Weekly time tracking

---

## Notes

- **Phased Rollout**: Can release Phase 1 (Analytics) separately from Phase 2 (Gamification)
- **User Feedback**: Collect feedback after Phase 1 before building Phase 2
- **Optional Features**: Leaderboard and Chromecast can be skipped if time-constrained
- **Database Ready**: Subtasks table already exists from MVP 1.0
- **Backward Compatible**: All features additive, no breaking changes to MVP 1.0

---

## Next Steps

1. ✅ Review and approve MVP 1.1 plan
2. ⏳ Collect user feedback from MVP 1.0 deployment (recommended 1-2 months)
3. ⏳ Prioritize Phase 1 vs Phase 2 based on user needs
4. ⏳ Begin Sprint 1.1 (or 1.2 if calendar is higher priority)
5. ⏳ Update plan weekly with actual progress

**Ready to enhance! 🚀**
