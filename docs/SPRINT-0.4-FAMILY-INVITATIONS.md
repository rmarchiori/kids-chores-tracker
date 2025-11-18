# Sprint 0.4: Family Invitation System

**Status**: Implementation Ready
**Duration**: 16 hours estimated
**Complexity**: Medium
**Dependencies**: Sprint 0.2 (Database), Sprint 0.3 (Auth)

---

## Overview

Sprint 0.4 implements a multi-family invitation system allowing users to belong to multiple families with role-based permissions. This enables family administrators to invite new members via email, with automatic account creation support for invitees who don't yet have accounts.

### Key Deliverables

1. ✅ `family_members` junction table with role-based permissions
2. ✅ `family_invitations` table for tracking invites
3. ✅ Role definition system (Admin, Parent, Teen, Child)
4. ✅ Row-Level Security (RLS) policies for multi-family access
5. ✅ Supabase email integration with magic links
6. ✅ Family settings dashboard with member management
7. ✅ Invitation acceptance flow (registered & unregistered users)
8. ✅ Multi-family user experience improvements
9. ✅ Email templates for invitations
10. ✅ Comprehensive testing suite

---

## Architecture Overview

### Multi-Family Support Design

This system allows users to be members of multiple families with different roles in each family.

```
User (auth.users)
├─ user_id: UUID
├─ email: VARCHAR
└─ created_at: TIMESTAMP
    │
    └─→ family_members (junction table)
        ├─ user_id: UUID (FK → auth.users)
        ├─ family_id: UUID (FK → families)
        ├─ role: VARCHAR ('admin', 'parent', 'teen')
        ├─ status: VARCHAR ('active', 'invited', 'removed')
        └─ created_at: TIMESTAMP
            │
            └─→ families
                ├─ id: UUID
                ├─ name: VARCHAR
                ├─ created_by: UUID (FK → auth.users)
                └─ created_at: TIMESTAMP
```

### Role-Based Permission System

| Action | Admin | Parent | Teen | Child |
|--------|-------|--------|------|-------|
| View family members | ✅ | ❌ | ❌ | ❌ |
| Invite new members | ✅ | ❌ | ❌ | ❌ |
| Remove members | ✅ | ❌ | ❌ | ❌ |
| Manage family settings | ✅ | ❌ | ❌ | ❌ |
| Create tasks | ✅ | ✅ | ❌ | ❌ |
| Assign tasks | ✅ | ✅ | ❌ | ❌ |
| Review completions | ✅ | ✅ | ❌ | ❌ |
| View tasks | ✅ | ✅ | ✅ | ❌ |
| Update own task status | ✅ | ✅ | ✅ | ❌ |
| View family dashboard | ✅ | ✅ | ✅ | ❌ |

---

## Database Schema

### 1. family_members (New Junction Table)

Replaces the direct `parents` table structure with a flexible role-based system.

```sql
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,

  -- Role-based permissions
  role VARCHAR(20) NOT NULL DEFAULT 'parent',
  -- Values: 'admin', 'parent', 'teen'

  -- Membership status
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  -- Values: 'active', 'invited', 'removed', 'blocked'

  -- Metadata
  display_name VARCHAR(255),
  avatar_url VARCHAR(512),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Constraints
  UNIQUE(user_id, family_id),
  CONSTRAINT valid_role CHECK (role IN ('admin', 'parent', 'teen')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'invited', 'removed', 'blocked'))
);

CREATE INDEX IF NOT EXISTS family_members_user_id_idx ON family_members(user_id);
CREATE INDEX IF NOT EXISTS family_members_family_id_idx ON family_members(family_id);
CREATE INDEX IF NOT EXISTS family_members_status_idx ON family_members(status);
CREATE INDEX IF NOT EXISTS family_members_role_idx ON family_members(role);
CREATE INDEX IF NOT EXISTS family_members_joined_at_idx ON family_members(joined_at);

-- Enable RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
```

### 2. family_invitations (New Invitations Table)

Tracks pending invitations and handles both registered and unregistered user flows.

```sql
CREATE TABLE IF NOT EXISTS family_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Invitation details
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  invited_email VARCHAR(255) NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Role assignment
  role VARCHAR(20) NOT NULL DEFAULT 'parent',
  -- Values: 'admin', 'parent', 'teen'

  -- Invitation status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- Values: 'pending', 'accepted', 'rejected', 'expired', 'cancelled'

  -- Token for magic link
  token VARCHAR(255) NOT NULL UNIQUE,
  token_hash VARCHAR(255) UNIQUE, -- Hashed token for storage

  -- Acceptance details
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,

  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Metadata
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Constraints
  CONSTRAINT valid_role CHECK (role IN ('admin', 'parent', 'teen')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled')),
  CONSTRAINT valid_email CHECK (invited_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX IF NOT EXISTS family_invitations_family_id_idx ON family_invitations(family_id);
CREATE INDEX IF NOT EXISTS family_invitations_invited_email_idx ON family_invitations(invited_email);
CREATE INDEX IF NOT EXISTS family_invitations_token_idx ON family_invitations(token);
CREATE INDEX IF NOT EXISTS family_invitations_status_idx ON family_invitations(status);
CREATE INDEX IF NOT EXISTS family_invitations_expires_at_idx ON family_invitations(expires_at);
CREATE INDEX IF NOT EXISTS family_invitations_invited_by_idx ON family_invitations(invited_by);

-- Enable RLS
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;
```

### 3. families Table Updates

Add metadata to track family creation and member management:

```sql
-- Add columns to existing families table
ALTER TABLE families ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE families ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;
ALTER TABLE families ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 10;
ALTER TABLE families ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS families_created_by_idx ON families(created_by);
```

---

## Role Definitions

### Admin Role

**Permissions**:
- View all family members and their roles
- Invite new members to the family
- Assign roles to members (Admin, Parent, Teen)
- Remove members from family
- Manage family settings (name, preferences)
- Create, assign, and manage all tasks
- Review task completions and provide feedback
- Access full family dashboard and analytics

**Restrictions**:
- At least one Admin must remain in family (cannot all be removed)
- Cannot downgrade own role unless another Admin exists

**Use Cases**:
- Primary family account holder
- Family administrator managing access

---

### Parent Role

**Permissions**:
- View all family members
- Create and assign tasks
- Manage task deadlines and categories
- Review child task completions
- Provide feedback on task completions
- View family dashboard and member activity
- Update own profile information

**Restrictions**:
- Cannot invite new members
- Cannot modify family settings
- Cannot change member roles
- Cannot remove members
- Cannot view other parents' private settings

**Use Cases**:
- Secondary parent/guardian
- Authorized task manager
- Household coordinator

---

### Teen Role

**Permissions**:
- View own assigned tasks
- Update task completion status
- View own task history and ratings
- View family members list
- Update own profile

**Restrictions**:
- Cannot create tasks
- Cannot assign tasks
- Cannot review other members' completions
- Cannot modify family settings
- Cannot invite members

**Use Cases**:
- Older child with account
- Task participant
- Learning responsibility

---

### Child Role (No Account)

**Status**: No digital account

**Access Method**:
- Tasks viewed through parent app
- Managed entirely by Parents/Admins
- No direct system access

**Use Cases**:
- Younger children
- Age-inappropriate for digital accounts

---

## RLS Policies

### family_members Table RLS

```sql
-- Policy 1: Users can view members of families they belong to
CREATE POLICY "family_members_select_own_family"
ON family_members FOR SELECT
USING (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Policy 2: Admins can insert new members (through invitations)
CREATE POLICY "family_members_insert_admin"
ON family_members FOR INSERT
WITH CHECK (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
  )
);

-- Policy 3: Admins can update member roles
CREATE POLICY "family_members_update_admin"
ON family_members FOR UPDATE
USING (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
  )
)
WITH CHECK (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
  )
);

-- Policy 4: Admins can delete members
CREATE POLICY "family_members_delete_admin"
ON family_members FOR DELETE
USING (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
  )
  -- Prevent deleting all admins
  AND (
    SELECT COUNT(*) FROM family_members
    WHERE family_id = family_members.family_id AND role = 'admin' AND status = 'active'
  ) > 1
);

-- Policy 5: Users can update own profile
CREATE POLICY "family_members_update_own"
ON family_members FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() AND
  role = (SELECT role FROM family_members WHERE id = family_members.id)
  -- Prevent users from changing their own role
);
```

### family_invitations Table RLS

```sql
-- Policy 1: Admins can view invitations for their families
CREATE POLICY "family_invitations_select_admin"
ON family_invitations FOR SELECT
USING (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
  )
);

-- Policy 2: Users can view their own pending invitations
CREATE POLICY "family_invitations_select_own"
ON family_invitations FOR SELECT
USING (
  invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND status = 'pending'
);

-- Policy 3: Admins can create invitations
CREATE POLICY "family_invitations_insert_admin"
ON family_invitations FOR INSERT
WITH CHECK (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
  )
  AND invited_by = auth.uid()
);

-- Policy 4: Admins can update invitations
CREATE POLICY "family_invitations_update_admin"
ON family_invitations FOR UPDATE
USING (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
  )
)
WITH CHECK (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
  )
);

-- Policy 5: Users can accept their own invitations
CREATE POLICY "family_invitations_update_own"
ON family_invitations FOR UPDATE
USING (
  invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND status = 'pending'
)
WITH CHECK (
  invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND (status = 'accepted' OR status = 'rejected')
);
```

### Updated: families, tasks, and other tables

```sql
-- families: Allow access if user is an active member
CREATE POLICY "families_select"
ON families FOR SELECT
USING (
  id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "families_update_admin"
ON families FOR UPDATE
USING (
  id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
  )
)
WITH CHECK (
  id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
  )
);

-- tasks: Allow access based on role in family
CREATE POLICY "tasks_select"
ON tasks FOR SELECT
USING (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "tasks_insert_parent_admin"
ON tasks FOR INSERT
WITH CHECK (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role IN ('admin', 'parent') AND status = 'active'
  )
);

CREATE POLICY "tasks_update_parent_admin"
ON tasks FOR UPDATE
USING (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role IN ('admin', 'parent') AND status = 'active'
  )
)
WITH CHECK (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role IN ('admin', 'parent') AND status = 'active'
  )
);
```

---

## User Flows

### Flow 1: Admin Invites New Member (Registered User)

```
1. Admin navigates to: /dashboard/family/settings/members
2. Admin clicks "Invite Member" button
3. Admin enters:
   - Email address: invited@example.com
   - Role: Parent/Teen
   - Message: Optional personal message
4. System validates:
   - Email format is valid
   - User not already a member of this family
   - User not already invited (pending)
5. System creates invitation:
   - Generates secure token (32 chars)
   - Sets expiration: 7 days from now
   - Records invited_by, email, role
6. System sends email:
   - To: invited@example.com
   - Subject: "You're invited to {FamilyName} family!"
   - Link: /invite/accept/[TOKEN]
7. Admin sees confirmation:
   - "Invitation sent to invited@example.com"
   - Invitation appears in "Pending Invitations" list
8. Invitee receives email:
   - If registered: Clicks link → logs in → accepts/rejects
   - If unregistered: Clicks link → sign up flow → accepts
9. System marks invitation as:
   - accepted_at: NOW
   - accepted_by: user_id
   - status: 'accepted'
10. System creates family_members entry:
    - user_id: accepted user
    - family_id: invitation family
    - role: invited role
    - status: 'active'
11. Invitee logged in to dashboard:
    - Sees new family in family selector
    - Can immediately see family tasks
```

### Flow 2: Admin Invites New Member (Unregistered User)

```
Same as Flow 1, Steps 1-6

Step 8 - Alternative path for unregistered user:
1. Invitee receives email and clicks link
2. System validates token:
   - Token exists in family_invitations
   - Status = 'pending'
   - Not expired
   - Email matches
3. Token invalid → Show error page:
   - "This invitation is no longer valid"
   - Suggest contacting family admin
4. Token valid → Redirect to signup:
   - /auth/register?email=invited@example.com&token=[TOKEN]
5. User fills signup form:
   - Email: pre-filled and read-only
   - Password: create password
   - Name: full name
6. System creates auth.users entry
7. System marks invitation as accepted
8. System creates family_members entry
9. User logged into dashboard with new family
```

### Flow 3: User Joins Multiple Families

```
1. User A is admin of "Family A"
   - family_members: (user_a, family_a, admin, active)

2. Admin B invites User A to "Family B"
   - family_invitations created for user_a@email.com

3. User A clicks link in invitation email
   - Already logged in
   - Redirected to: /invite/accept/[TOKEN]

4. System verifies:
   - User email matches invitation email
   - Invitation status = 'pending'
   - Not expired

5. Accept invitation:
   - Modal: "Accept invitation from Family B?"
   - Shows: Family name, role (parent)
   - Buttons: Accept / Decline

6. User clicks Accept:
   - family_invitations.status = 'accepted'
   - family_invitations.accepted_by = user_a
   - family_invitations.accepted_at = NOW
   - family_members created: (user_a, family_b, parent, active)

7. System shows success:
   - "Successfully joined Family B!"
   - Dashboard reloads
   - Family selector shows both families

8. User can now:
   - Switch between families in dashboard
   - See tasks from both families
   - Have different roles in each family
```

### Flow 4: Admin Removes Member

```
1. Admin navigates to: /dashboard/family/settings/members
2. Admin sees list of family members with roles
3. Admin clicks "Remove" on a member
4. Confirmation dialog:
   - "Remove John from family?"
   - Shows what John can currently do
   - Buttons: Cancel / Remove

5. Admin clicks Remove:
   - Check if member is only admin:
     - If yes: Show error: "Cannot remove only admin"
   - If valid: Update family_members
     - status: 'active' → 'removed'
     - updated_at: NOW

6. System removes access:
   - Tasks/data still visible in history
   - Invitations from this member cancelled
   - Cannot log in to this family

7. Removed member experience:
   - Family disappears from family selector
   - Cannot access family's tasks
   - Other families still accessible

8. Admin sees confirmation:
   - "John has been removed from family"
   - Member moves to "Former Members" section
```

### Flow 5: User Leaves Family

```
1. User navigates to: /dashboard/family/settings
2. Sees current role in family
3. Clicks: "Leave Family" (if not only admin)

4. Confirmation dialog:
   - "Are you sure you want to leave {FamilyName}?"
   - Shows that you won't see tasks from this family
   - Buttons: Cancel / Leave

5. User clicks Leave:
   - Check if user is only admin:
     - If yes: Show error: "You must promote another admin before leaving"
     - If not: Proceed
   - Update family_members:
     - status: 'active' → 'removed'
     - left_at: NOW

6. User redirected:
   - Dashboard with family removed
   - Message: "Successfully left {FamilyName}"

7. User state:
   - Family no longer in selector
   - Can rejoin if re-invited
   - Other families unaffected
```

---

## UI Components & Pages

### 1. /dashboard/family/settings (New)

**Purpose**: Family management hub

```typescript
// Layout
- Header: "{FamilyName} Settings"
- Sidebar:
  - Family Info
  - Members
  - Invitations
  - Settings
  - Danger Zone

// Family Info Tab
- Family name (editable by admin)
- Created date
- Member count
- Join code (future feature)

// Members Tab
- Active members table:
  - Name
  - Email
  - Role (with edit/remove for admin)
  - Joined date
- Pending invitations:
  - Email
  - Role
  - Sent date
  - Expires date
  - Actions: Resend / Cancel
- Former members:
  - Name
  - Removed date
  - Actions: Re-invite

// Invitations Tab
- Create new invitation form:
  - Email input with validation
  - Role dropdown
  - Message textarea
  - Submit button
- Pending list:
  - Shows all pending invitations
  - Status indicators
  - Expiration warnings

// Settings Tab
- Family name
- Max members (future)
- Preferences (future)
- Notification settings (future)

// Danger Zone Tab
- Leave family (if not only admin)
- Delete family (admin only, if >0 members)
```

### 2. /invite/accept/[token] (New)

**Purpose**: Handle invitation acceptance

```typescript
// Flow 1: Authenticated user
- Check token validity
- If invalid: Error page
- If valid:
  - Show: "Accept invitation from {FamilyName}?"
  - Show: Role that will be assigned
  - Buttons: Accept / Decline
- On Accept:
  - Create family_members
  - Redirect to /dashboard
  - Show toast: "Welcome to {FamilyName}!"

// Flow 2: Unauthenticated user
- Check token validity
- If invalid: Error page
- If valid:
  - Redirect to signup with params:
    - email: pre-filled
    - token: passed through
  - After signup:
    - Automatically accept invitation
    - Create family_members
    - Redirect to /dashboard

// Error cases:
- Expired token: "Invitation expired. Contact admin."
- Invalid token: "Invalid invitation link."
- Already member: "You're already a member of this family."
- User email mismatch: "Sign in with the invited email address."
```

### 3. /dashboard/family/invite (Alternative simpler UI)

**Purpose**: Standalone invitation form

```typescript
// Simple form:
- Title: "Invite Family Member"
- Email input
- Role dropdown
- Message textarea
- Submit button

// After submit:
- Modal: "Invitation sent to {email}"
- Buttons: Invite another / Done

// Errors:
- Invalid email format
- Already invited (pending)
- Already a member
- Invalid role
```

### 4. Updated: /dashboard/family-selector (Component Update)

**Purpose**: Allow switching between multiple families

```typescript
// New component in dashboard header
- Dropdown showing all families user is in
- Active family highlighted
- Click to switch families
- Shows user's role in each family
- Quick access to family settings

// Structure:
- Current family: {Name} ({Role})
- Divider
- Other families:
  - Family A (Parent)
  - Family B (Admin)
  - Family C (Teen)
- Divider
- Create new family
- Family settings

// Example display:
┌─────────────────────────────┐
│ My Family (Admin)           │
├─────────────────────────────┤
│ Family B (Parent)           │
│ Extended Family (Teen)      │
├─────────────────────────────┤
│ + Create Family             │
│ ⚙️ Settings                  │
└─────────────────────────────┘
```

---

## Email Integration

### Supabase Email Configuration

**Setup in Supabase Dashboard**:

1. Go to: Authentication → Email Templates
2. Configure SMTP (optional for production):
   - Email provider: SendGrid / Mailgun / AWS SES
   - API keys configured
3. Default: Supabase sends via built-in SMTP

### Email Template: Family Invitation

**Template Name**: `family_invitation`

**HTML Template**:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4f46e5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px; }
        .button { background-color: #4f46e5; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 20px 0; }
        .footer { color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>You're Invited!</h1>
        </div>
        <div class="content">
            <p>Hi,</p>
            <p><strong>{{ invited_by_name }}</strong> has invited you to join <strong>{{ family_name }}</strong> on Kids Chores Tracker!</p>
            <p>You'll be added as a <strong>{{ role }}</strong>, which means you can:</p>
            <ul id="permissions-list"></ul>

            {{ #if personal_message }}
            <blockquote style="border-left: 4px solid #e5e7eb; padding-left: 20px; color: #6b7280;">
                <p>{{ personal_message }}</p>
            </blockquote>
            {{ /if }}

            <p>
                <a href="{{ accept_link }}" class="button">Accept Invitation</a>
            </p>

            <p style="color: #6b7280; font-size: 14px;">
                This invitation expires in 7 days. If you don't accept by then, you'll need to ask your family to send a new invitation.
            </p>

            <p style="color: #6b7280; font-size: 14px;">
                Not sure what this is? <a href="{{ help_link }}">Learn more about Kids Chores Tracker</a>.
            </p>
        </div>
        <div class="footer">
            <p>Kids Chores Tracker • Family Chore Management</p>
            <p>If you have questions, contact your family admin or email support@kidschores.com</p>
        </div>
    </div>

    <script>
        const rolePermissions = {
            admin: [
                'Invite new family members',
                'Create and assign chores',
                'Review completions',
                'Manage family settings'
            ],
            parent: [
                'Create and assign chores',
                'Review completions',
                'View family dashboard'
            ],
            teen: [
                'View assigned chores',
                'Mark chores complete',
                'View family dashboard'
            ]
        };

        const list = document.getElementById('permissions-list');
        const perms = rolePermissions['{{ role }}'] || [];
        perms.forEach(perm => {
            const li = document.createElement('li');
            li.textContent = perm;
            list.appendChild(li);
        });
    </script>
</body>
</html>
```

### Email Variables

```typescript
interface EmailVariables {
  // Core
  family_name: string;
  invited_email: string;
  invited_by_name: string;
  role: 'admin' | 'parent' | 'teen';

  // Links
  accept_link: string; // Full URL with token
  help_link: string;

  // Optional
  personal_message?: string;

  // Permissions list (generated by template)
  // Shows what role can do
}

// Example:
{
  family_name: "The Smith Family",
  invited_email: "john@example.com",
  invited_by_name: "Sarah Smith",
  role: "parent",
  accept_link: "https://kidschores.com/invite/accept/abc123token456",
  help_link: "https://kidschores.com/help",
  personal_message: "We could use your help managing chores!"
}
```

### Sending Invitations via Supabase Functions (Server-Side)

```typescript
// app/api/invitations/send/route.ts
import { createServiceRoleClient } from '@/lib/supabase-server';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

export async function POST(request: Request) {
  const supabase = createServiceRoleClient();
  const { familyId, email, role, message } = await request.json();
  const userId = request.headers.get('x-user-id');

  // Validate
  if (!familyId || !email || !role) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Check if user is admin of this family
  const { data: member } = await supabase
    .from('family_members')
    .select('*')
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single();

  if (!member) {
    return Response.json({ error: 'Not authorized' }, { status: 403 });
  }

  // Check if already invited or member
  const { data: existing } = await supabase
    .from('family_members')
    .select('*')
    .eq('family_id', familyId)
    .eq('user_id', (
      await supabase.auth.admin.getUserByEmail(email)
    ).user?.id || '');

  if (existing?.length) {
    return Response.json({ error: 'Already a member' }, { status: 400 });
  }

  // Generate token
  const token = nanoid(32);
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Create invitation
  const { data: invitation, error } = await supabase
    .from('family_invitations')
    .insert({
      family_id: familyId,
      invited_email: email,
      invited_by: userId,
      role,
      token,
      token_hash: tokenHash,
      expires_at: expiresAt,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Send email via Supabase
  const acceptLink = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/accept/${token}`;

  // Use Supabase email or external service
  // Option 1: Direct email via Supabase auth
  try {
    await supabase.auth.signInWithOtp({
      email,
      options: {
        // Custom email template variables
        data: {
          family_name: familyId, // Would fetch actual name
          invite_token: token,
        }
      }
    });
  } catch (e) {
    // Handle email send failure
    console.error('Email send failed:', e);
  }

  return Response.json({ success: true, invitation });
}
```

---

## Edge Cases & Validation

### Edge Case 1: Last Admin Leaves Family

**Problem**: If the only admin leaves, no one can manage the family.

**Validation**:

```typescript
async function validateAdminRemoval(familyId: string, userId: string) {
  const supabase = createServiceRoleClient();

  // Count active admins in family
  const { count } = await supabase
    .from('family_members')
    .select('*', { count: 'exact' })
    .eq('family_id', familyId)
    .eq('role', 'admin')
    .eq('status', 'active');

  if (count === 1) {
    throw new Error('Cannot remove the only admin. Promote another member first.');
  }
}
```

**User Experience**:

- Show warning: "You're the only admin. Promote another member before leaving."
- Provide dropdown to select new admin
- Require confirmation

### Edge Case 2: Invitation to Already Member

**Problem**: Admin invites someone already in family.

**Validation**:

```typescript
async function checkExistingMembership(familyId: string, email: string) {
  const supabase = createServiceRoleClient();

  // Get user by email
  const { data: user } = await supabase.auth.admin.getUserByEmail(email);

  if (!user) {
    return { isMember: false };
  }

  // Check if already member
  const { data: member } = await supabase
    .from('family_members')
    .select('*')
    .eq('family_id', familyId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (member) {
    return { isMember: true, memberData: member };
  }

  // Check if pending invitation
  const { data: invitation } = await supabase
    .from('family_invitations')
    .select('*')
    .eq('family_id', familyId)
    .eq('invited_email', email)
    .eq('status', 'pending')
    .single();

  if (invitation) {
    return { isPending: true, invitationData: invitation };
  }

  return { isMember: false, isPending: false };
}
```

**User Experience**:

```
If already member:
- Error: "John is already a member of this family (Parent)"
- Button: View member

If invitation pending:
- Warning: "Invitation already sent on Nov 16"
- Options: Resend / Cancel
```

### Edge Case 3: Expired Invitation

**Problem**: User clicks 7+ day old invitation link.

**Validation**:

```typescript
async function acceptInvitation(token: string, userId: string) {
  const supabase = createServiceRoleClient();

  const { data: invitation, error } = await supabase
    .from('family_invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single();

  if (error || !invitation) {
    throw new Error('Invitation not found');
  }

  // Check expiration
  if (new Date(invitation.expires_at) < new Date()) {
    // Update status to expired
    await supabase
      .from('family_invitations')
      .update({ status: 'expired' })
      .eq('id', invitation.id);

    throw new Error('Invitation has expired');
  }

  // Email mismatch check
  const { user } = await supabase.auth.getUser();
  if (user?.email !== invitation.invited_email) {
    throw new Error('Please sign in with the invited email address');
  }

  // Rest of acceptance logic...
}
```

**User Experience**:

```
Error page:
- Message: "This invitation has expired"
- Sub-text: "Invitations are valid for 7 days"
- Button: "Contact your family admin to send a new invitation"
```

### Edge Case 4: Invalid Token

**Problem**: User modifies token in URL.

**Validation**:

```typescript
async function validateToken(token: string) {
  // Token format validation
  if (token.length !== 32 || !/^[a-zA-Z0-9_-]+$/.test(token)) {
    throw new Error('Invalid token format');
  }

  const supabase = createServiceRoleClient();
  const { count } = await supabase
    .from('family_invitations')
    .select('*', { count: 'exact' })
    .eq('token', token);

  if (!count) {
    throw new Error('Token not found');
  }
}
```

**User Experience**:

```
Error page:
- Message: "Invalid or corrupted invitation link"
- Sub-text: "Please request a new invitation from your family admin"
- Button: "Back to login"
```

### Edge Case 5: Role-Based Permission Violation

**Problem**: Non-admin tries to perform admin action.

**Validation (Database Level)**:

```sql
-- RLS policies prevent this, but app should validate too
CREATE POLICY "prevent_non_admin_operations"
ON family_invitations FOR INSERT
WITH CHECK (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND status = 'active'
  )
);
```

**Validation (Application Level)**:

```typescript
async function checkAdminPermission(familyId: string, userId: string) {
  const supabase = createServiceRoleClient();

  const { data: member } = await supabase
    .from('family_members')
    .select('role, status')
    .eq('family_id', familyId)
    .eq('user_id', userId)
    .single();

  if (!member || member.status !== 'active' || member.role !== 'admin') {
    throw new Error('Admin permission required');
  }

  return true;
}
```

### Edge Case 6: Rapid Duplicate Invitations

**Problem**: User submits invite form multiple times.

**Validation**:

```typescript
async function checkPendingInvitation(familyId: string, email: string) {
  const supabase = createServiceRoleClient();

  const { count } = await supabase
    .from('family_invitations')
    .select('*', { count: 'exact' })
    .eq('family_id', familyId)
    .eq('invited_email', email)
    .eq('status', 'pending');

  if (count && count > 0) {
    throw new Error('Invitation already pending for this email');
  }
}
```

**User Experience**:

- Disable button after first click
- Show: "Sending invitation..."
- Show: "Invitation sent" confirmation

---

## Permission Matrix

### Detailed Access Control

| Feature | Admin | Parent | Teen | Child |
|---------|-------|--------|------|-------|
| **Family Management** |
| View members | ✅ | ✅ | ✅ | ❌ |
| Invite members | ✅ | ❌ | ❌ | ❌ |
| Remove members | ✅ | ❌ | ❌ | ❌ |
| Change member roles | ✅ | ❌ | ❌ | ❌ |
| Edit family name | ✅ | ❌ | ❌ | ❌ |
| Leave family | ✅* | ✅ | ✅ | N/A |
| Delete family | ✅ | ❌ | ❌ | ❌ |
| **Task Management** |
| View all tasks | ✅ | ✅ | ✅ | ❌ |
| View own tasks | ✅ | ✅ | ✅ | ❌ |
| Create tasks | ✅ | ✅ | ❌ | ❌ |
| Assign tasks | ✅ | ✅ | ❌ | ❌ |
| Edit tasks | ✅ | ✅* | ❌ | ❌ |
| Delete tasks | ✅ | ✅* | ❌ | ❌ |
| **Completion Management** |
| View completions | ✅ | ✅ | ✅ | ❌ |
| Mark complete | ✅ | ✅ | ✅ | ❌ |
| Review completions | ✅ | ✅ | ❌ | ❌ |
| Rate/give feedback | ✅ | ✅ | ❌ | ❌ |
| **Profile Management** |
| Edit own profile | ✅ | ✅ | ✅ | ❌ |
| View family dashboard | ✅ | ✅ | ✅ | ❌ |
| View analytics | ✅ | ✅ | ✅ | ❌ |
| Change password | ✅ | ✅ | ✅ | ❌ |

*Notation:
- ✅ = Full access
- ✅* = With restrictions (e.g., can't delete own assigned tasks, can't be only admin)
- ❌ = No access
- N/A = Not applicable

### RLS Implementation by Table

```sql
-- family_members: Check role for each operation
-- family_invitations: Only admins can create/update
-- families: Check membership and role
-- tasks: Check membership and parent/admin role
-- task_assignments: Check membership and parent/admin role
-- task_completions: Check membership, review only for parent/admin
```

---

## Testing Checklist

### Unit Tests

- [ ] Role validation logic
  - [ ] Valid roles accepted (admin, parent, teen)
  - [ ] Invalid roles rejected
  - [ ] Role constraints enforced

- [ ] Token generation
  - [ ] Tokens are 32 characters
  - [ ] Tokens are unique
  - [ ] Token hash is generated correctly

- [ ] Email validation
  - [ ] Valid emails accepted
  - [ ] Invalid emails rejected
  - [ ] Email format validation

### Integration Tests

#### Invitation Creation
- [ ] Admin can create invitation
- [ ] Non-admin cannot create invitation
- [ ] Cannot invite already member
- [ ] Cannot invite pending invite
- [ ] Email sent successfully
- [ ] Invitation record created with correct fields

#### Invitation Acceptance (Registered User)
- [ ] User can accept own invitation
- [ ] User cannot accept other's invitation
- [ ] Expired invitation rejected
- [ ] Invalid token rejected
- [ ] family_members record created
- [ ] User can access family after acceptance

#### Invitation Acceptance (Unregistered User)
- [ ] Unregistered user redirected to signup
- [ ] Email pre-filled from invitation
- [ ] After signup, invitation auto-accepted
- [ ] family_members record created
- [ ] User added to family dashboard

#### Multi-Family Access
- [ ] User can belong to multiple families
- [ ] User sees all families in selector
- [ ] User can switch between families
- [ ] Different roles in different families
- [ ] Tasks isolated by family
- [ ] Permissions enforced per family

#### Member Removal
- [ ] Admin can remove members
- [ ] Non-admin cannot remove
- [ ] Cannot remove only admin
- [ ] Removed member loses access
- [ ] Removed member can be re-invited
- [ ] Historical data preserved

#### User Leave Family
- [ ] User can leave family (if not only admin)
- [ ] Only admin cannot leave without promotion
- [ ] family_members status updated
- [ ] User removed from family access
- [ ] Can re-join if re-invited

### RLS Policy Tests

- [ ] Users can only see families they're in
- [ ] Users can only see members of own families
- [ ] Admins can create invitations
- [ ] Non-admins cannot create invitations
- [ ] Admins can modify members
- [ ] Non-admins cannot modify members
- [ ] Parents can view/create tasks
- [ ] Teens can view only assigned tasks
- [ ] Children have no access

### UI/UX Tests

#### Settings Page
- [ ] Members list displays correctly
- [ ] Pending invitations shown with expiry
- [ ] Admin controls visible to admins only
- [ ] Non-admin sees "Leave family" option
- [ ] Cannot leave if only admin

#### Invite Form
- [ ] Email validation works
- [ ] Role dropdown functions
- [ ] Submit disabled during send
- [ ] Success message displays
- [ ] Error messages clear

#### Invitation Link
- [ ] Valid token accepted
- [ ] Invalid token shows error
- [ ] Expired token shows error
- [ ] Email mismatch error shown
- [ ] Already member error shown

#### Family Selector
- [ ] All families displayed
- [ ] Correct current family indicated
- [ ] Switching changes context
- [ ] Shows user's role in each family

### Edge Case Tests

- [ ] Rapid duplicate invitations prevented
- [ ] Last admin cannot leave
- [ ] Cannot invite duplicate email
- [ ] Token expiration works (7 days)
- [ ] Deleted family removes access
- [ ] Service role key bypasses RLS (server-side)

### Email Tests

- [ ] Email sent to correct address
- [ ] Email contains correct family name
- [ ] Email contains correct role
- [ ] Accept link is valid
- [ ] Accept link expires correctly
- [ ] Email template renders correctly

### Performance Tests

- [ ] Family selector loads <200ms
- [ ] Settings page loads <500ms
- [ ] Invitation creation <1s
- [ ] Token validation <200ms
- [ ] RLS policies execute <100ms

---

## Migration Path

### From Current Schema (Sprint 0.2) to New Schema (Sprint 0.4)

**Current State**:
```
families
└─ parents (user_id + family_id)
```

**New State**:
```
families
└─ family_members (user_id + family_id + role)
└─ family_invitations (email + token)
```

### Migration Steps

```sql
-- Step 1: Create new tables
CREATE TABLE family_members (...);
CREATE TABLE family_invitations (...);

-- Step 2: Migrate existing data
INSERT INTO family_members (user_id, family_id, role, status, created_at, updated_at)
SELECT user_id, family_id, 'admin', 'active', created_at, updated_at
FROM parents;

-- Step 3: Update RLS policies
-- Drop old policies from parents table
-- Add new policies to family_members

-- Step 4: Verify data integrity
SELECT COUNT(*) FROM family_members;
SELECT COUNT(*) FROM parents; -- Should match

-- Step 5: Keep parents table for backwards compatibility
-- OR drop after app is fully migrated
ALTER TABLE parents DISABLE TRIGGER ALL;
-- App queries updated to use family_members
```

---

## Summary Table

| Component | Status | Priority | Effort |
|-----------|--------|----------|--------|
| family_members table | Ready | High | 2 hours |
| family_invitations table | Ready | High | 2 hours |
| RLS policies | Ready | High | 3 hours |
| Invitation creation API | Ready | High | 3 hours |
| Acceptance endpoint | Ready | High | 3 hours |
| Settings UI | Ready | High | 4 hours |
| Email integration | Ready | High | 2 hours |
| Family selector component | Ready | Medium | 2 hours |
| Testing suite | Ready | High | 8 hours |
| Documentation | Complete | Medium | Done |

**Total Estimated Effort**: 16 hours

---

## Next Steps

1. Create migration SQL file
2. Implement family_members and family_invitations tables
3. Set up RLS policies
4. Build invitation creation API
5. Implement acceptance endpoints
6. Create settings UI components
7. Configure email integration
8. Build family selector component
9. Comprehensive testing
10. Deploy to production

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Email Templates Guide](https://supabase.com/docs/reference/self-hosted-auth/custom-emails)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-createrole.html)
- Project: Kids Chores Tracker
- Owner: Development Team

