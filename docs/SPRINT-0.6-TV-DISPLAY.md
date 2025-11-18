# Sprint 0.6: TV Display Mode

**Status**: Implementation Ready
**Duration**: 8 hours estimated
**Complexity**: Medium
**Dependencies**: Sprint 0.2 (Database), Sprint 0.3 (Auth), Sprint 0.4 (Family System)

---

## Overview

Sprint 0.6 implements a TV display mode optimized for large screens (1080p and higher) that shows all family members' tasks in a single, easy-to-read layout. The display auto-refreshes every 30 seconds to stay current with task completions. A QR code enables quick mobile login for children to mark tasks complete without needing to remember passwords.

This is a **web-based approach** without casting protocols—the parent simply opens the `/display` route in a TV browser (Samsung Smart TV, LG, Fire TV, or any connected browser) and leaves it running. Phase 2 will add Chromecast and AirPlay support.

### Why TV Display in MVP?

1. **Minimal Infrastructure**: No casting protocol implementation needed
2. **Universal Compatibility**: Works on any TV with a web browser
3. **Cost Effective**: No special hardware or integrations
4. **Fast Implementation**: 8 hours vs 20+ for casting protocols
5. **High Value**: Gamified task visibility motivates children

### Key Deliverables

1. ✅ `/display` route with TV-optimized layout
2. ✅ Auto-refresh mechanism (30 seconds)
3. ✅ QR code generation for quick login
4. ✅ Large-screen responsive design (1080p, 1440p, 4K)
5. ✅ Task cards with status indicators (color-coded)
6. ✅ Family member sections
7. ✅ Session management and token handling
8. ✅ Network error handling
9. ✅ Multiple display support (multi-TV households)
10. ✅ Comprehensive testing on TV browsers

---

## Technical Architecture

### Display Route Flow

```
GET /display?token=abc123
    ↓
Validate token (check expiration, family access)
    ↓
Fetch family + all active tasks
    ↓
Render TVDisplay component
    ↓
Start auto-refresh timer (30 seconds)
    ↓
Every 30s: Poll /api/display/tasks → Re-render
    ↓
On error: Show "Disconnected" warning, retry in 5s
```

### Component Architecture

```
TVDisplay (Main Container)
├── DisplayHeader (Family name, time, connection status)
├── QRCodePanel (Sidebar on right, shows login QR)
├── TasksGrid (Main content area)
│   ├── FamilyMemberSection (One per child)
│   │   ├── ChildName (Large, 48px)
│   │   ├── TaskCard (Completed/Pending/Overdue)
│   │   │   ├── TaskTitle (24px)
│   │   │   ├── DueDate (18px)
│   │   │   └── StatusIndicator (Color: green/yellow/red)
│   │   └── CompletionStats (X/Y tasks complete)
│   └── [Repeat for each child]
└── AutoRefreshTimer (Shows "Updating..." text)
```

### Data Flow

```
TV Display Process:
1. Parent opens /display in TV browser
2. Route validates auth token
3. Fetches family data + all tasks + all children
4. Renders grid (4-6 children per row, unlimited rows)
5. Every 30 seconds:
   - Polls /api/display/tasks
   - Updates task statuses in-place
   - Smooth transitions (no full page reload)
6. QR code on sidebar updates dynamically
   - Contains: display session URL + auto-login token
   - Child scans → opens in mobile browser
   - Child logs in with pin/face/password
   - Child marks task complete
   - TV refreshes within 30s, shows update
```

### Session Token System

**Parent Setup Flow**:
```
1. Parent clicks "Display on TV" button
2. System generates display_session token
   - uuid: unique display session
   - family_id: which family
   - created_by: parent user_id
   - expires_at: now + 8 hours
   - device_name: "Living Room TV" (optional)
3. Token stored in db.display_sessions table
4. Generate URL: https://kidschores.com/display?token=abc123xyz
5. Show QR code of this URL
6. Parent scans QR on their phone
7. Or manual entry: /display?token=abc123xyz
```

**Child Quick-Login Flow**:
```
1. TV shows QR code
2. Child scans with phone
3. Opens: /display-login?session_token=abc123xyz
4. System validates session token
5. Shows PIN entry (4 digits) OR
   Shows family member selector (if multiple children in family)
6. Child enters PIN or selects name
7. System creates temporary auth session (15 minute validity)
8. Child redirected to /dashboard/child-tasks
9. Child can mark tasks complete
10. TV auto-refreshes within 30s and shows update
```

---

## Database Schema

### display_sessions Table

```sql
CREATE TABLE IF NOT EXISTS display_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Token for URL
  token VARCHAR(255) NOT NULL UNIQUE,

  -- Display metadata
  device_name VARCHAR(255), -- "Living Room TV", "Kitchen Display"
  device_type VARCHAR(50), -- "tv", "tablet", "monitor"

  -- Control flags
  is_active BOOLEAN DEFAULT true,

  -- Session management
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- 8 hours from creation
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Constraints
  CONSTRAINT valid_device_type CHECK (device_type IN ('tv', 'tablet', 'monitor'))
);

CREATE INDEX IF NOT EXISTS display_sessions_family_id_idx ON display_sessions(family_id);
CREATE INDEX IF NOT EXISTS display_sessions_token_idx ON display_sessions(token);
CREATE INDEX IF NOT EXISTS display_sessions_created_by_idx ON display_sessions(created_by);
CREATE INDEX IF NOT EXISTS display_sessions_expires_at_idx ON display_sessions(expires_at);

-- Enable RLS
ALTER TABLE display_sessions ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

```sql
-- Users can only view display sessions for their families
CREATE POLICY "display_sessions_select_own_family"
ON display_sessions FOR SELECT
USING (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Users can create display sessions for their families (admin/parent)
CREATE POLICY "display_sessions_insert_admin"
ON display_sessions FOR INSERT
WITH CHECK (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role IN ('admin', 'parent') AND status = 'active'
  )
  AND created_by = auth.uid()
);

-- Creators can update/delete their own sessions
CREATE POLICY "display_sessions_update_own"
ON display_sessions FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "display_sessions_delete_own"
ON display_sessions FOR DELETE
USING (created_by = auth.uid());
```

---

## Design Specifications

### Screen Layout (1920x1080 as baseline)

```
┌─────────────────────────────────────────────────────────────┐
│ Kids Chores Tracker - Living Room TV          11:45 AM      │  ← Header (80px)
│ Last updated: 30s ago • Connected             ⚪ Online      │
├──────────────────────────────────────────────┬──────────────┤
│                                              │   QUICK      │
│                                              │   LOGIN      │
│  CHILD 1           CHILD 2       CHILD 3     │   ┌──────┐  │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   │   │ ▄▄▄▄ │  │
│  │ Make    │   │ Clean   │   │ Laundry │   │   │ ▄▄▄▄ │  │
│  │Breakfast│   │Bathroom │   │ Basket  │   │   │ ▄▄▄▄ │  │
│  │ Due:    │   │ Due:    │   │ Due:    │   │   └──────┘  │
│  │ Today   │   │ Today   │   │Tomorrow │   │             │
│  │   ✅    │   │   ⏳    │   │   ❌    │   │  Scan to    │
│  └─────────┘   └─────────┘   └─────────┘   │  login      │
│                                              │             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   │  PIN:       │
│  │ Dishes  │   │ Homework│   │ Pet Food│   │  ____       │
│  │ Due:    │   │ Due:    │   │ Due:    │   │             │
│  │ Today   │   │Tomorrow │   │ Today   │   │  Or select  │
│  │   ✅    │   │   ❌    │   │   ⏳    │   │  name:      │
│  └─────────┘   └─────────┘   └─────────┘   │  • Sophia   │
│                                              │  • Emma     │
│  3/5 Complete                                │  • Liam     │
└──────────────────────────────────────────────┴──────────────┘
```

### Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Header (Family Name) | 48px | Bold | #1F2937 |
| Child Name | 48px | Bold | #374151 |
| Task Title | 24px | Semi-bold | #374151 |
| Task Due Date | 18px | Normal | #6B7280 |
| Status Label | 16px | Normal | Color-coded |
| Time/Status | 14px | Normal | #9CA3AF |
| Statistics | 20px | Semi-bold | #374151 |

### Color Scheme

```css
/* Status Colors - High Contrast for TV */
--status-complete: #10B981 (Green)   /* Completed tasks */
--status-pending: #F59E0B (Amber)    /* Due today, not done */
--status-overdue: #EF4444 (Red)      /* Past due date */
--status-upcoming: #8B5CF6 (Purple)  /* Due in future */

/* Backgrounds */
--bg-card: #FFFFFF
--bg-section: #F9FAFB
--bg-main: #FFFFFF
--border: #E5E7EB

/* Text */
--text-primary: #1F2937 (Dark gray)
--text-secondary: #6B7280 (Medium gray)
--text-muted: #9CA3AF (Light gray)
```

### Responsive Breakpoints

```css
/* TV Resolutions */
@media (min-width: 1920px) {
  /* 1920x1080 - Full HD */
  --card-width: 320px;
  --cards-per-row: 6;
  --font-title: 24px;
  --font-child-name: 48px;
}

@media (min-width: 2560px) {
  /* 2560x1440 - 1440p */
  --card-width: 380px;
  --cards-per-row: 6;
  --font-title: 28px;
  --font-child-name: 56px;
}

@media (min-width: 3840px) {
  /* 3840x2160 - 4K */
  --card-width: 480px;
  --cards-per-row: 8;
  --font-title: 32px;
  --font-child-name: 64px;
}

@media (max-width: 1920px) {
  /* 1366x768 - Fallback for older displays */
  --card-width: 280px;
  --cards-per-row: 4;
  --font-title: 20px;
  --font-child-name: 40px;
}
```

### Contrast Requirements

Ensure WCAG AA compliance even from distance:
- Text-to-background: 7:1 minimum (not 4.5:1)
- Status indicators: Use color + text/icon
- No reliance on color alone for information

```css
/* Enhanced contrast */
.task-card--complete {
  background: #F0FDF4;       /* Very light green */
  border-left: 6px solid #10B981;
}

.task-card--pending {
  background: #FFFBEB;       /* Very light amber */
  border-left: 6px solid #F59E0B;
}

.task-card--overdue {
  background: #FEF2F2;       /* Very light red */
  border-left: 6px solid #EF4444;
}
```

---

## Implementation Tasks

### Task 1: Create `/display` Route (1 hour)

**File**: `src/app/display/page.tsx`

```typescript
import { notFound, redirect } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import TVDisplay from '@/components/display/TVDisplay';
import { validateDisplayToken } from '@/lib/display-service';

interface DisplayPageProps {
  searchParams: { token?: string };
}

export const metadata = {
  title: 'TV Display - Kids Chores Tracker',
};

export default async function DisplayPage({ searchParams }: DisplayPageProps) {
  const token = searchParams.token;

  if (!token) {
    return notFound();
  }

  // Validate token and get family data
  try {
    const session = await validateDisplayToken(token);
    if (!session) {
      return notFound();
    }

    return (
      <div className="display-page bg-white">
        <TVDisplay sessionToken={token} familyId={session.family_id} />
      </div>
    );
  } catch (error) {
    console.error('Display page error:', error);
    return notFound();
  }
}
```

### Task 2: TVDisplay Component (2 hours)

**File**: `src/components/display/TVDisplay.tsx`

```typescript
'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DisplayHeader from './DisplayHeader';
import TasksGrid from './TasksGrid';
import QRCodePanel from './QRCodePanel';
import DisconnectedBanner from './DisconnectedBanner';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

interface TVDisplayProps {
  sessionToken: string;
  familyId: string;
}

interface FamilyData {
  id: string;
  name: string;
  family_members: Array<{
    id: string;
    user_id: string;
    display_name: string;
  }>;
}

interface TaskData {
  id: string;
  title: string;
  assigned_to: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue';
  completed_at?: string;
}

export default function TVDisplay({ sessionToken, familyId }: TVDisplayProps) {
  const supabase = createClientComponentClient();
  const [family, setFamily] = useState<FamilyData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(true);

  // Fetch display data
  const fetchDisplayData = useCallback(async () => {
    try {
      // Fetch family data
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select(
          `
          id,
          name,
          family_members:family_members(
            id,
            user_id,
            display_name
          )
        `
        )
        .eq('id', familyId)
        .single();

      if (familyError) throw familyError;

      // Fetch all tasks for this family
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('family_id', familyId)
        .eq('is_archived', false)
        .order('due_date', { ascending: true });

      if (tasksError) throw tasksError;

      setFamily(familyData);
      setTasks(tasksData || []);
      setLastUpdate(new Date());
      setError(null);
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to fetch display data:', err);
      setError('Failed to load data');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [familyId, supabase]);

  // Initial load
  useEffect(() => {
    fetchDisplayData();
  }, [fetchDisplayData]);

  // Auto-refresh every 30 seconds
  const { isRefreshing } = useAutoRefresh(fetchDisplayData, 30000);

  if (loading) {
    return (
      <div className="display-loading flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="text-4xl font-bold mb-4">Loading...</div>
          <p className="text-lg text-gray-600">Setting up your family display</p>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="display-error flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="text-4xl font-bold mb-4 text-red-600">Error</div>
          <p className="text-lg text-gray-600">Unable to load family data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="display-container h-screen bg-white flex flex-col">
      {/* Disconnected Banner */}
      {!isConnected && <DisconnectedBanner />}

      {/* Header */}
      <DisplayHeader
        familyName={family.name}
        lastUpdate={lastUpdate}
        isRefreshing={isRefreshing}
        isConnected={isConnected}
      />

      {/* Main Content */}
      <div className="display-content flex flex-1 overflow-hidden">
        {/* Tasks Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <TasksGrid
            family={family}
            tasks={tasks}
          />
        </div>

        {/* QR Code Sidebar */}
        <QRCodePanel
          sessionToken={sessionToken}
          familyName={family.name}
        />
      </div>
    </div>
  );
}
```

### Task 3: Display Header Component (30 minutes)

**File**: `src/components/display/DisplayHeader.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface DisplayHeaderProps {
  familyName: string;
  lastUpdate: Date;
  isRefreshing: boolean;
  isConnected: boolean;
}

export default function DisplayHeader({
  familyName,
  lastUpdate,
  isRefreshing,
  isConnected,
}: DisplayHeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="display-header bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-6 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Left: Family Name */}
        <h1 className="text-5xl font-bold">{familyName}</h1>

        {/* Center: Status */}
        <div className="text-right">
          <div className="text-2xl mb-2">
            {currentTime}
          </div>
          <div className="flex items-center justify-end gap-3 text-lg">
            <span>
              {isRefreshing ? 'Updating...' : `Last updated ${formatDistanceToNow(lastUpdate, { addSuffix: true })}`}
            </span>
            <div
              className={`w-4 h-4 rounded-full flex-shrink-0 ${
                isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`}
              title={isConnected ? 'Connected' : 'Disconnected'}
            />
          </div>
        </div>

        {/* Right: Branding */}
        <div className="text-right">
          <p className="text-sm opacity-75">Kids Chores Tracker</p>
        </div>
      </div>
    </div>
  );
}
```

### Task 4: Tasks Grid Component (1.5 hours)

**File**: `src/components/display/TasksGrid.tsx`

```typescript
'use client';

import TaskCard from './TaskCard';

interface Family {
  id: string;
  name: string;
  family_members: Array<{
    id: string;
    user_id: string;
    display_name: string;
  }>;
}

interface Task {
  id: string;
  title: string;
  assigned_to: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue';
  completed_at?: string;
}

interface TasksGridProps {
  family: Family;
  tasks: Task[];
}

export default function TasksGrid({ family, tasks }: TasksGridProps) {
  // Group tasks by assigned member
  const tasksByMember = family.family_members.reduce(
    (acc, member) => {
      acc[member.id] = tasks.filter((task) => task.assigned_to === member.user_id);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  return (
    <div className="tasks-grid">
      <div className="grid gap-6">
        {family.family_members.map((member) => {
          const memberTasks = tasksByMember[member.id] || [];
          const completedCount = memberTasks.filter(
            (t) => t.status === 'completed'
          ).length;
          const totalCount = memberTasks.length;

          return (
            <div key={member.id} className="member-section">
              {/* Member Header */}
              <div className="mb-4">
                <h2 className="text-5xl font-bold mb-2">
                  {member.display_name}
                </h2>
                <p className="text-2xl text-gray-600">
                  {completedCount} of {totalCount} tasks complete
                </p>
              </div>

              {/* Task Cards Grid */}
              {memberTasks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {memberTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <p className="text-2xl text-green-700 font-semibold">
                    No tasks assigned
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Task 5: Task Card Component (1 hour)

**File**: `src/components/display/TaskCard.tsx`

```typescript
'use client';

import { formatDistance, isPast, parseISO } from 'date-fns';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    due_date: string;
    status: 'pending' | 'completed' | 'overdue';
  };
}

export default function TaskCard({ task }: TaskCardProps) {
  const dueDate = parseISO(task.due_date);
  const isOverdue = task.status === 'overdue';
  const isCompleted = task.status === 'completed';
  const isPending = task.status === 'pending';

  const getStatusColor = () => {
    if (isCompleted) return 'bg-green-50 border-green-200 border-l-green-600';
    if (isOverdue) return 'bg-red-50 border-red-200 border-l-red-600';
    return 'bg-amber-50 border-amber-200 border-l-amber-600';
  };

  const getStatusIcon = () => {
    if (isCompleted) return '✅';
    if (isOverdue) return '❌';
    return '⏳';
  };

  const getDueDateText = () => {
    if (isCompleted) return 'Completed';
    return `Due ${formatDistance(dueDate, new Date(), { addSuffix: true })}`;
  };

  return (
    <div
      className={`task-card border-l-8 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow ${getStatusColor()}`}
    >
      {/* Status Icon */}
      <div className="text-4xl mb-3 text-center">
        {getStatusIcon()}
      </div>

      {/* Task Title */}
      <h3 className="text-2xl font-semibold text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Due Date */}
      <p className="text-lg text-gray-600 text-center">
        {getDueDateText()}
      </p>

      {/* Status Badge */}
      <div className="mt-3 text-center">
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            isCompleted
              ? 'bg-green-200 text-green-900'
              : isOverdue
              ? 'bg-red-200 text-red-900'
              : 'bg-amber-200 text-amber-900'
          }`}
        >
          {isCompleted ? 'Done' : isOverdue ? 'Overdue' : 'Pending'}
        </span>
      </div>
    </div>
  );
}
```

### Task 6: QR Code Panel (1 hour)

**File**: `src/components/display/QRCodePanel.tsx`

```typescript
'use client';

import QRCode from 'qrcode.react';
import { useEffect, useState } from 'react';

interface QRCodePanelProps {
  sessionToken: string;
  familyName: string;
}

export default function QRCodePanel({
  sessionToken,
  familyName,
}: QRCodePanelProps) {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    // Generate full URL for QR code
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const displayLoginUrl = `${baseUrl}/display-login?session=${sessionToken}`;
    setQrUrl(displayLoginUrl);
  }, [sessionToken]);

  return (
    <div className="display-qr-panel w-64 bg-gradient-to-b from-indigo-50 to-white border-l-2 border-indigo-200 p-6 flex flex-col items-center justify-between shadow-lg">
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-indigo-900 mb-2">
          Quick Login
        </h2>
        <p className="text-sm text-gray-600">
          Scan to mark tasks complete
        </p>
      </div>

      {/* QR Code */}
      {qrUrl && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <QRCode
            value={qrUrl}
            size={220}
            level="H"
            includeMargin={true}
            renderAs="canvas"
          />
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm space-y-3">
        <div>
          <p className="font-semibold text-gray-900">Instructions:</p>
          <ol className="text-gray-700 text-left space-y-2 mt-2">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Scan with phone</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Select your name</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Mark task done</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>TV updates in 30s</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Family Name */}
      <div className="mt-auto pt-4 border-t border-indigo-200 w-full text-center">
        <p className="text-xs text-gray-600">Showing</p>
        <p className="text-lg font-semibold text-indigo-900">
          {familyName}
        </p>
      </div>
    </div>
  );
}
```

### Task 7: Auto-Refresh Hook (30 minutes)

**File**: `src/hooks/useAutoRefresh.ts`

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';

export function useAutoRefresh(
  callback: () => Promise<void>,
  interval: number = 30000
) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await callback();
      retryCountRef.current = 0; // Reset retry count on success
    } catch (error) {
      console.error('Auto-refresh failed:', error);
      retryCountRef.current += 1;

      // Exponential backoff: 5s, 10s, 15s
      if (retryCountRef.current < MAX_RETRIES) {
        const backoffTime = 5000 * retryCountRef.current;
        console.log(`Retrying in ${backoffTime}ms...`);
        setTimeout(() => {
          // Try again after backoff
        }, backoffTime);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [callback]);

  useEffect(() => {
    // Set up interval
    intervalRef.current = setInterval(refresh, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refresh, interval]);

  return { isRefreshing };
}
```

### Task 8: Display Session API Route (1 hour)

**File**: `src/app/api/display/create-session/route.ts`

```typescript
import { createServiceRoleClient } from '@/lib/supabase-server';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { familyId, deviceName } = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!familyId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Verify user is admin/parent in this family
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .select('role')
      .eq('family_id', familyId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (memberError || !member || !['admin', 'parent'].includes(member.role)) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Generate unique token
    const token = nanoid(32);

    // Create display session
    const { data: session, error: insertError } = await supabase
      .from('display_sessions')
      .insert({
        family_id: familyId,
        created_by: userId,
        token,
        device_name: deviceName || 'Living Room TV',
        device_type: 'tv',
        expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      session,
      displayUrl: `/display?token=${token}`,
      qrCodeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/display-login?session=${token}`,
    });
  } catch (error) {
    console.error('Create display session error:', error);
    return NextResponse.json(
      { error: 'Failed to create display session' },
      { status: 500 }
    );
  }
}
```

### Task 9: Display Login Route (1.5 hours)

**File**: `src/app/display-login/page.tsx`

```typescript
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import FamilyMemberSelector from '@/components/display/FamilyMemberSelector';

export default function DisplayLoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const sessionToken = searchParams.get('session');
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFamily() {
      if (!sessionToken) {
        setError('No session token provided');
        return;
      }

      try {
        // Get display session
        const { data: session, error: sessionError } = await supabase
          .from('display_sessions')
          .select('*')
          .eq('token', sessionToken)
          .single();

        if (sessionError || !session) {
          setError('Invalid or expired session');
          return;
        }

        // Check expiration
        if (new Date(session.expires_at) < new Date()) {
          setError('Session has expired');
          return;
        }

        // Get family members (only children/teens)
        const { data: members, error: membersError } = await supabase
          .from('family_members')
          .select('id, user_id, display_name, role')
          .eq('family_id', session.family_id)
          .eq('status', 'active')
          .in('role', ['teen', 'parent']); // Only selectable members

        if (membersError) throw membersError;

        setFamilyMembers(members || []);
      } catch (err: any) {
        console.error('Load family error:', err);
        setError(err.message || 'Failed to load family data');
      } finally {
        setLoading(false);
      }
    }

    loadFamily();
  }, [sessionToken, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-700">
        <div className="text-center">
          <div className="text-white text-3xl font-bold mb-4">
            Loading...
          </div>
          <p className="text-indigo-100">Setting up your login</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-700">
        <div className="text-center bg-white rounded-lg shadow-xl p-8">
          <div className="text-4xl font-bold text-red-600 mb-4">Error</div>
          <p className="text-gray-700 text-lg mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <FamilyMemberSelector
      sessionToken={sessionToken || ''}
      members={familyMembers}
    />
  );
}
```

### Task 10: Family Member Selector Component (1 hour)

**File**: `src/components/display/FamilyMemberSelector.tsx`

```typescript
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface FamilyMemberSelectorProps {
  sessionToken: string;
  members: Array<{
    id: string;
    user_id: string;
    display_name: string;
    role: string;
  }>;
}

export default function FamilyMemberSelector({
  sessionToken,
  members,
}: FamilyMemberSelectorProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pin, setPIN] = useState<string>('');

  const handleMemberSelect = async (memberId: string) => {
    setSelectedMember(memberId);
    setLoading(true);

    try {
      // Create temporary session for child
      const { data, error } = await supabase
        .from('child_sessions')
        .insert({
          family_member_id: memberId,
          session_token: sessionToken,
          expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        })
        .select()
        .single();

      if (error) throw error;

      // Redirect to dashboard
      router.push('/dashboard?child_session=' + data.id);
    } catch (error: any) {
      console.error('Session creation error:', error);
      alert('Failed to create session');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Who are you?
          </h1>
          <p className="text-gray-600 text-lg">
            Select your name to continue
          </p>
        </div>

        {/* Member Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => handleMemberSelect(member.id)}
              disabled={loading}
              className={`p-6 rounded-xl border-4 font-bold text-xl transition-all transform hover:scale-105 ${
                selectedMember === member.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-900 border-gray-200 hover:border-indigo-400'
              } ${loading && selectedMember !== member.id ? 'opacity-50' : ''}`}
            >
              {member.display_name}
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Task 11: Disconnected Banner Component (15 minutes)

**File**: `src/components/display/DisconnectedBanner.tsx`

```typescript
export default function DisconnectedBanner() {
  return (
    <div className="bg-red-500 text-white px-6 py-4 text-center shadow-lg">
      <p className="text-xl font-semibold">
        Connection lost - Retrying...
      </p>
      <p className="text-sm opacity-90">
        Display will update when connection restored
      </p>
    </div>
  );
}
```

### Task 12: CSS Styling (1 hour)

**File**: `src/styles/display.css`

```css
/* TV Display Styles */

:root {
  /* Colors */
  --color-complete: #10B981;
  --color-pending: #F59E0B;
  --color-overdue: #EF4444;
  --color-upcoming: #8B5CF6;

  --bg-main: #FFFFFF;
  --bg-section: #F9FAFB;
  --bg-card: #FFFFFF;

  --text-primary: #1F2937;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;

  --border-color: #E5E7EB;
}

/* Layout */
.display-page {
  background-color: var(--bg-main);
  overflow: hidden;
}

.display-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.display-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.display-content > div:first-child {
  flex: 1;
  overflow-y: auto;
}

/* Header */
.display-header {
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  color: white;
  padding: 24px 32px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.display-header h1 {
  font-size: 48px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.display-header .time {
  font-size: 24px;
  font-weight: 600;
}

.display-header .status {
  font-size: 16px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.online {
  background-color: #10B981;
  animation: pulse 2s infinite;
}

.status-indicator.offline {
  background-color: #EF4444;
}

/* QR Panel */
.display-qr-panel {
  width: 280px;
  background: linear-gradient(180deg, #F0F4FF 0%, #FFFFFF 100%);
  border-left: 3px solid #DDD6FE;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.display-qr-panel h2 {
  font-size: 24px;
  font-weight: 700;
  color: #312E81;
  margin: 0;
}

.display-qr-panel canvas {
  border: 3px solid #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Tasks Grid */
.member-section {
  margin-bottom: 48px;
}

.member-section h2 {
  font-size: 48px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.member-section > p {
  font-size: 22px;
  color: var(--text-secondary);
  margin: 0 0 24px 0;
}

/* Task Card */
.task-card {
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-left: 8px solid;
  border-radius: 8px;
  padding: 16px;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.task-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.task-card.complete {
  background-color: #F0FDF4;
  border-left-color: var(--color-complete);
  border-color: #DCFCE7;
}

.task-card.pending {
  background-color: #FFFBEB;
  border-left-color: var(--color-pending);
  border-color: #FEF3C7;
}

.task-card.overdue {
  background-color: #FEF2F2;
  border-left-color: var(--color-overdue);
  border-color: #FEDEDE;
}

.task-card .status-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.task-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-card .due-date {
  font-size: 16px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 12px;
}

.task-card .status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.task-card.complete .status-badge {
  background-color: #D1FAE5;
  color: #065F46;
}

.task-card.pending .status-badge {
  background-color: #FCD34D;
  color: #78350F;
}

.task-card.overdue .status-badge {
  background-color: #FECACA;
  color: #7F1D1D;
}

/* Disconnected Banner */
.disconnected-banner {
  background-color: #EF4444;
  color: white;
  padding: 12px 24px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Responsive */
@media (min-width: 2560px) {
  .display-header h1 {
    font-size: 56px;
  }

  .member-section h2 {
    font-size: 56px;
  }

  .task-card {
    min-height: 280px;
  }

  .task-card h3 {
    font-size: 24px;
  }

  .task-card .due-date {
    font-size: 18px;
  }
}

@media (min-width: 3840px) {
  .display-header {
    padding: 32px 48px;
  }

  .display-header h1 {
    font-size: 72px;
  }

  .member-section h2 {
    font-size: 72px;
  }

  .task-card {
    min-height: 320px;
  }

  .task-card h3 {
    font-size: 32px;
  }

  .task-card .due-date {
    font-size: 20px;
  }
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Print Styles */
@media print {
  .display-qr-panel {
    display: none;
  }
}
```

---

## Edge Cases & Error Handling

### Edge Case 1: Network Disconnection

**Problem**: TV loses network connection

**Solution**:
```typescript
const [connectionAttempts, setConnectionAttempts] = useState(0);

const handleRefreshError = async () => {
  if (connectionAttempts < 5) {
    // Exponential backoff: 5s, 10s, 15s, 20s, 25s
    const backoffTime = 5000 * (connectionAttempts + 1);
    setTimeout(fetchDisplayData, backoffTime);
    setConnectionAttempts(prev => prev + 1);
  }
  // After 5 attempts, show persistent error
};
```

**User Experience**:
- Show "Disconnected" banner at top
- Display red status indicator
- Keep showing last known state
- Auto-retry in background
- Show "Connected" when restored

### Edge Case 2: Session Timeout

**Problem**: 8-hour session expires

**Solution**:
```typescript
useEffect(() => {
  const checkExpiration = async () => {
    const { data } = await supabase
      .from('display_sessions')
      .select('expires_at')
      .eq('token', sessionToken)
      .single();

    if (data && new Date(data.expires_at) < new Date()) {
      // Session expired
      window.location.href = '/display-expired';
    }
  };

  const interval = setInterval(checkExpiration, 5 * 60 * 1000); // Check every 5 min
  return () => clearInterval(interval);
}, [sessionToken]);
```

### Edge Case 3: No Tasks Assigned

**Problem**: Display is empty

**Solution**:
Show "No tasks assigned" message with friendly icon and suggestion to create tasks.

### Edge Case 4: Multiple Displays in Same Family

**Problem**: Two TVs running display for same family

**Solution**:
- Each gets unique token
- Independent sessions
- All see same data
- Auto-refresh pulls latest from server

### Edge Case 5: Child Mobile Session Expires

**Problem**: Child's 15-minute session expires during use

**Solution**:
```typescript
// Check session validity on each action
const checkSessionValidity = async () => {
  const session = localStorage.getItem('child_session_id');
  const { data } = await supabase
    .from('child_sessions')
    .select('expires_at')
    .eq('id', session)
    .single();

  if (!data || new Date(data.expires_at) < new Date()) {
    // Session expired, redirect to login
    localStorage.removeItem('child_session_id');
    router.push(`/display-login?session=${displaySessionToken}`);
  }
};
```

---

## Component Examples

### Display Settings Button (Dashboard Integration)

**File**: `src/components/dashboard/DisplayButton.tsx`

```typescript
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import QRCodeModal from './QRCodeModal';

export default function DisplayButton({ familyId }: { familyId: string }) {
  const supabase = createClientComponentClient();
  const [showModal, setShowModal] = useState(false);
  const [displayUrl, setDisplayUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleCreateDisplay = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/display/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId }),
      });

      const data = await response.json();
      setDisplayUrl(data.displayUrl);
      setShowModal(true);
    } catch (error) {
      console.error('Failed to create display:', error);
      alert('Failed to create display session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleCreateDisplay}
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Display on TV'}
      </button>

      {showModal && (
        <QRCodeModal
          displayUrl={displayUrl}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
```

---

## Testing Checklist

### Unit Tests

- [ ] Token generation creates valid 32-char tokens
- [ ] Session expiration calculated correctly (8 hours)
- [ ] Task status determination logic (pending/completed/overdue)
- [ ] Date formatting for display
- [ ] Color mapping by status
- [ ] QR code URL generation

### Integration Tests

#### Display Session Creation
- [ ] Admin can create session
- [ ] Parent can create session
- [ ] Teen cannot create session
- [ ] Session stores correct family_id
- [ ] Token is unique
- [ ] Expiration set to 8 hours

#### Display Rendering
- [ ] Correct family loads
- [ ] All active family members shown
- [ ] All family tasks shown
- [ ] Tasks grouped by member
- [ ] Completion stats calculated correctly
- [ ] Status colors applied correctly

#### Auto-Refresh
- [ ] Refresh happens every 30 seconds
- [ ] New tasks appear without page reload
- [ ] Completed tasks update immediately
- [ ] Overdue tasks calculated correctly
- [ ] Fails gracefully on network error
- [ ] Retries with exponential backoff

#### QR Code Login
- [ ] QR code scannable
- [ ] Session token valid for 8 hours
- [ ] Child can select name from list
- [ ] Child session created (15 min timeout)
- [ ] Child redirected to dashboard
- [ ] Child can mark task complete
- [ ] TV updates within 30 seconds of completion

#### Error Handling
- [ ] Disconnected banner shows on network error
- [ ] Auto-reconnect works
- [ ] Session timeout shows error page
- [ ] Invalid token shows error
- [ ] Expired session shows error message

### UI/UX Tests

#### Display Layout
- [ ] All children visible on 1920x1080
- [ ] No horizontal scrolling needed
- [ ] Text readable from 10 feet away
- [ ] Status colors visible from distance
- [ ] QR code readable on different phones
- [ ] Responsive on 1366x768 (fallback)
- [ ] Works on 2560x1440 (1440p)
- [ ] Works on 3840x2160 (4K)

#### Accessibility
- [ ] Color-blind accessible (not color-only)
- [ ] Sufficient contrast (7:1)
- [ ] Large fonts readable
- [ ] QR code functional on low-light
- [ ] Time/date clear and large

#### Performance
- [ ] Initial load < 2 seconds
- [ ] Auto-refresh completes < 500ms
- [ ] No layout shift during refresh
- [ ] No memory leaks
- [ ] Battery/power efficient (for tablets)
- [ ] Smooth animations

### Browser Testing (TV)

- [ ] Samsung Smart TV (Tizen browser)
- [ ] LG Smart TV (WebOS browser)
- [ ] Amazon Fire TV
- [ ] Android TV
- [ ] Apple TV (Safari)
- [ ] Chromecast with Google TV
- [ ] Desktop Chrome (1920x1080)

### Device Testing

- [ ] 55" TV (viewing distance ~8 feet)
- [ ] 65" TV (viewing distance ~10 feet)
- [ ] 75" TV (viewing distance ~12 feet)
- [ ] Tablet (as fallback display)
- [ ] Monitor (as backup)

### Mobile (Child) Testing

- [ ] iOS Safari
- [ ] Android Chrome
- [ ] QR code scans correctly
- [ ] Family member selector loads
- [ ] Task marking works
- [ ] Session timeout handled

### Load Testing

- [ ] Display with 1 child: responsive
- [ ] Display with 5 children: responsive
- [ ] Display with 10 children: responsive
- [ ] 10 concurrent display sessions
- [ ] Rapid auto-refresh cycles
- [ ] Multiple children submitting simultaneously

---

## Future: Chromecast & AirPlay (Phase 2)

This MVP uses web-based display, which is simple and universal. Phase 2 will add:

### Chromecast Support
- Use Google Cast SDK
- More seamless integration
- No need to enter URL manually
- Automatic device discovery

### AirPlay Support
- Apple AirPlay protocol
- Works with Apple TV
- Seamless on Apple devices
- Requires SSL certificate

### Implementation Notes
- Separate routes for casting
- Fallback to web display
- Casting API discovery
- Device pairing/authentication

---

## Deployment Checklist

- [ ] Database migration: Create display_sessions table
- [ ] RLS policies configured
- [ ] Environment variables set (NEXT_PUBLIC_BASE_URL)
- [ ] QR code library installed (qrcode.react)
- [ ] API routes deployed
- [ ] TV display route accessible
- [ ] Display login route accessible
- [ ] Auto-refresh tested at 30s interval
- [ ] Error handling verified
- [ ] Mobile QR login tested
- [ ] Performance tested on actual TV
- [ ] All browsers tested
- [ ] Documentation updated

---

## Summary Table

| Component | Status | Priority | Effort |
|-----------|--------|----------|--------|
| display_sessions table | Ready | High | 30 min |
| /display route | Ready | High | 1 hour |
| TVDisplay component | Ready | High | 2 hours |
| DisplayHeader component | Ready | High | 30 min |
| TasksGrid component | Ready | High | 1.5 hours |
| TaskCard component | Ready | High | 1 hour |
| QRCodePanel component | Ready | High | 1 hour |
| Auto-refresh hook | Ready | High | 30 min |
| Display session API | Ready | High | 1 hour |
| Display login page | Ready | High | 1.5 hours |
| FamilyMemberSelector | Ready | High | 1 hour |
| DisconnectedBanner | Ready | Medium | 15 min |
| Display CSS styling | Ready | High | 1 hour |
| Testing suite | Ready | High | 8 hours |
| Documentation | Complete | Medium | Done |

**Total Estimated Effort**: 8 hours

---

## References

- [Next.js 13+ App Router](https://nextjs.org/docs/app)
- [Supabase Real-time Documentation](https://supabase.com/docs/guides/realtime)
- [QR Code React](https://github.com/jsvite/qrcode.react)
- [Tailwind CSS](https://tailwindcss.com/)
- [Web Standards for TV](https://www.w3.org/TR/tvui/)
- Project: Kids Chores Tracker
- Owner: Development Team
