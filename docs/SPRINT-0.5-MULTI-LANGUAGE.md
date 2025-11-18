# Sprint 0.5: Multi-Language Support (i18n)

**Status**: Implementation Ready
**Duration**: 10 hours estimated
**Complexity**: Medium
**Dependencies**: Sprint 0.2 (Database), Sprint 0.3 (Auth), Sprint 0.4 (Family System)

**Priority**: High - Now part of MVP 1.0

---

## Overview

Sprint 0.5 adds comprehensive multi-language support to Kids Chores Tracker, enabling families across North America to use the platform in their preferred language. The system uses **next-i18next** for seamless integration with Next.js 14 App Router, supporting server and client components with automatic language detection and user preference persistence.

### Why i18n is Critical for MVP

1. **Target Market**: Canadian and Brazilian families (francophone, anglophone, and Portuguese-speaking)
2. **Cultural Relevance**: Age-appropriate messaging varies significantly by language/culture
3. **User Experience**: Non-English speakers make up 40% of target demographic
4. **Regulatory**: French language support required for Quebec operations
5. **Competitive Advantage**: Most competing chore apps lack multi-language support

### Target Languages

| Code | Language | Region | Priority |
|------|----------|--------|----------|
| en-CA | English Canadian | Canada | Critical |
| fr-CA | French Canadian | Quebec, Canada | Critical |
| pt-BR | Portuguese Brazilian | Brazil | Critical |

### Key Deliverables

1. ✅ next-i18next configuration for App Router
2. ✅ Namespace-based translation structure (common, auth, dashboard, tasks)
3. ✅ Language detection (browser, saved preference, fallback)
4. ✅ Language selector component with instant switching
5. ✅ Database storage of user language preference
6. ✅ Translation of all UI strings (not content)
7. ✅ Date/time formatting per language
8. ✅ Age-appropriate messaging translation
9. ✅ RTL preparation (future-ready, not implemented)
10. ✅ Comprehensive testing

---

## Technical Architecture

### Translation File Structure

```
/public/locales
├── /en-CA
│   ├── common.json          # Global UI strings
│   ├── auth.json            # Auth pages
│   ├── dashboard.json       # Dashboard & navigation
│   ├── tasks.json           # Task management
│   └── family.json          # Family management
├── /fr-CA
│   ├── common.json
│   ├── auth.json
│   ├── dashboard.json
│   ├── tasks.json
│   └── family.json
└── /pt-BR
    ├── common.json
    ├── auth.json
    ├── dashboard.json
    ├── tasks.json
    └── family.json
```

### Language Detection Strategy

```
User Language Selection Flow:

1. Check user's database preference (preferred_language)
   ↓ (if authenticated)
2. Check localStorage saved preference
   ↓ (if not found)
3. Check browser language preference
   ↓ (if not a supported language)
4. Default to English Canadian (en-CA)
```

### Implementation Flow

```typescript
// User Journey
1. User first visits app
   → Browser language: pt-BR detected
   → Portuguese interface loads

2. User navigates to settings
   → Language selector shows current: "Português (Brasil)"
   → User clicks "English Canadian"
   → UI updates instantly
   → Preference saves to localStorage
   → On login, saved to database

3. User logs in on different device
   → App loads from database preference
   → Portuguese interface loads
   → Matches their previous choice
```

---

## Database Changes

### Migration: Add Language Preference Column

```sql
-- Add preferred_language to family_members and auth.users metadata

ALTER TABLE family_members
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10)
DEFAULT 'en-CA',
ADD CONSTRAINT valid_language
CHECK (preferred_language IN ('en-CA', 'fr-CA', 'pt-BR'));

-- Also store in auth.users via metadata (if needed)
-- This allows language selection even before family membership
```

### Complete Migration SQL

```sql
-- Migration: 20240115_add_i18n_support.sql

BEGIN;

-- Add language preference to family_members
ALTER TABLE family_members
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en-CA';

-- Add constraint for valid languages
ALTER TABLE family_members
ADD CONSTRAINT family_members_valid_language
CHECK (preferred_language IN ('en-CA', 'fr-CA', 'pt-BR'));

-- Create index for language preference queries
CREATE INDEX IF NOT EXISTS family_members_language_idx
ON family_members(preferred_language);

-- Create index for user-specific lookups
CREATE INDEX IF NOT EXISTS family_members_user_language_idx
ON family_members(user_id, preferred_language);

-- Update existing records
UPDATE family_members
SET preferred_language = 'en-CA'
WHERE preferred_language IS NULL;

COMMIT;
```

### Querying User's Language Preference

```typescript
// Get user's preferred language
async function getUserLanguage(userId: string) {
  const supabase = createClient();

  const { data: member } = await supabase
    .from('family_members')
    .select('preferred_language')
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(1)
    .single();

  return member?.preferred_language || 'en-CA';
}

// Update user's language preference
async function updateUserLanguage(userId: string, language: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('family_members')
    .update({ preferred_language: language })
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) throw error;
}
```

---

## Installation & Configuration

### Step 1: Install Dependencies

```bash
npm install next-i18next i18next i18next-browser-languagedetector i18next-http-backend
npm install --save-dev i18next-scanner
```

### Step 2: Create next-i18next Configuration

Create `/next-i18next.config.js`:

```javascript
const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en-CA',
    locales: ['en-CA', 'fr-CA', 'pt-BR'],
    localeDetection: true, // Auto-detect from browser
  },
  localePath: path.resolve('./public/locales'),
  ns: ['common', 'auth', 'dashboard', 'tasks', 'family'],
  defaultNS: 'common',

  // Advanced configuration
  interpolation: {
    escapeValue: false, // React already handles XSS
    formatSeparator: ',',
  },

  // Backend configuration
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },

  // React specific
  react: {
    useSuspense: false, // Prevent hydration issues
    transEmptyNodeValue: '', // Empty string for empty nodes
  },
};
```

### Step 3: Update next.config.js

```javascript
const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
```

### Step 4: Create Server i18n Instance

Create `/src/lib/i18n-server.ts`:

```typescript
import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { FlatNamespace, KeyPrefix } from 'i18next';

// Import all locales
import enCACommon from '@/public/locales/en-CA/common.json';
import enCAAuth from '@/public/locales/en-CA/auth.json';
import enCADashboard from '@/public/locales/en-CA/dashboard.json';
import enCATasks from '@/public/locales/en-CA/tasks.json';
import enCAFamily from '@/public/locales/en-CA/family.json';

import frCACommon from '@/public/locales/fr-CA/common.json';
import frCAAuth from '@/public/locales/fr-CA/auth.json';
import frCADashboard from '@/public/locales/fr-CA/dashboard.json';
import frCATasks from '@/public/locales/fr-CA/tasks.json';
import frCAFamily from '@/public/locales/fr-CA/family.json';

import ptBRCommon from '@/public/locales/pt-BR/common.json';
import ptBRAuth from '@/public/locales/pt-BR/auth.json';
import ptBRDashboard from '@/public/locales/pt-BR/dashboard.json';
import ptBRTasks from '@/public/locales/pt-BR/tasks.json';
import ptBRFamily from '@/public/locales/pt-BR/family.json';

const resources = {
  'en-CA': {
    common: enCACommon,
    auth: enCAAuth,
    dashboard: enCADashboard,
    tasks: enCATasks,
    family: enCAFamily,
  },
  'fr-CA': {
    common: frCACommon,
    auth: frCAAuth,
    dashboard: frCADashboard,
    tasks: frCATasks,
    family: frCAFamily,
  },
  'pt-BR': {
    common: ptBRCommon,
    auth: ptBRAuth,
    dashboard: ptBRDashboard,
    tasks: ptBRTasks,
    family: ptBRFamily,
  },
};

async function initI18n(language: string = 'en-CA') {
  const i18nInstance = createInstance();

  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) => {
      return resources[language as keyof typeof resources]?.[
        namespace as keyof typeof resources['en-CA']
      ] || {};
    }))
    .init({
      lng: language,
      fallbackLng: 'en-CA',
      ns: ['common', 'auth', 'dashboard', 'tasks', 'family'],
      defaultNS: 'common',
      interpolation: {
        escapeValue: false,
      },
    });

  return i18nInstance;
}

export const useTranslationServer = async (
  namespace: FlatNamespace | FlatNamespace[] = 'common',
  language: string = 'en-CA'
) => {
  const i18nInstance = await initI18n(language);
  const t = i18nInstance.getFixedT(language, namespace);

  return { t };
};
```

### Step 5: Create Client i18n Context

Create `/src/lib/i18n-context.tsx`:

```typescript
'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useTranslation as useTranslationHook } from 'react-i18next';

export type Language = 'en-CA' | 'fr-CA' | 'pt-BR';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children, defaultLanguage = 'en-CA' }: {
  children: ReactNode;
  defaultLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('preferred-language');
    if (saved && ['en-CA', 'fr-CA', 'pt-BR'].includes(saved)) {
      setLanguageState(saved as Language);
    }
    setIsLoading(false);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferred-language', lang);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// Combined hook for translations + context
export function useTranslation(namespace: string = 'common') {
  const { language, setLanguage } = useI18n();
  const { t, i18n } = useTranslationHook(namespace);

  return { t, i18n, language, setLanguage };
}
```

### Step 6: Update Root Layout

Update `/src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { I18nProvider } from '@/lib/i18n-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kids Chores Tracker',
  description: 'Family chore management for parents and children',
  languages: {
    'en-CA': 'English (Canada)',
    'fr-CA': 'Français (Canada)',
    'pt-BR': 'Português (Brasil)',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <I18nProvider defaultLanguage="en-CA">
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
```

---

## Translation Files

### Common Namespace: `/public/locales/en-CA/common.json`

```json
{
  "app": {
    "title": "Kids Chores Tracker",
    "subtitle": "Family chore management made easy"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "tasks": "Chores",
    "family": "Family",
    "settings": "Settings",
    "profile": "Profile",
    "logout": "Sign Out"
  },
  "buttons": {
    "submit": "Submit",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",
    "back": "Back",
    "next": "Next",
    "continue": "Continue",
    "confirm": "Confirm",
    "close": "Close"
  },
  "forms": {
    "email": "Email",
    "password": "Password",
    "name": "Full Name",
    "confirmPassword": "Confirm Password",
    "required": "This field is required",
    "invalidEmail": "Please enter a valid email address"
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success!",
    "warning": "Warning",
    "info": "Information",
    "noResults": "No results found",
    "language": "Language"
  }
}
```

### Auth Namespace: `/public/locales/en-CA/auth.json`

```json
{
  "login": {
    "title": "Sign In",
    "subtitle": "Welcome back to Kids Chores Tracker",
    "email": "Email Address",
    "password": "Password",
    "rememberMe": "Remember me",
    "forgotPassword": "Forgot your password?",
    "submit": "Sign In",
    "noAccount": "Don't have an account?",
    "signUp": "Sign up here",
    "error": "Invalid email or password"
  },
  "register": {
    "title": "Create Account",
    "subtitle": "Join Kids Chores Tracker",
    "email": "Email Address",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "firstName": "First Name",
    "lastName": "Last Name",
    "agreeToTerms": "I agree to the Terms of Service",
    "submit": "Create Account",
    "haveAccount": "Already have an account?",
    "signIn": "Sign in here",
    "passwordMismatch": "Passwords do not match",
    "passwordTooShort": "Password must be at least 8 characters",
    "accountExists": "An account with this email already exists"
  },
  "resetPassword": {
    "title": "Reset Password",
    "subtitle": "Enter your email to receive reset instructions",
    "email": "Email Address",
    "submit": "Send Reset Link",
    "sentMessage": "Check your email for reset instructions",
    "expired": "This reset link has expired",
    "newPassword": "New Password",
    "confirmPassword": "Confirm Password",
    "success": "Password reset successfully"
  }
}
```

### Dashboard Namespace: `/public/locales/en-CA/dashboard.json`

```json
{
  "dashboard": {
    "welcome": "Welcome, {{name}}!",
    "today": "Today",
    "upcoming": "Upcoming Chores",
    "completed": "Completed Today",
    "stats": "Family Stats"
  },
  "familySelector": {
    "selectFamily": "Select Family",
    "addFamily": "Add New Family",
    "settings": "Family Settings",
    "currentRole": "Your Role: {{role}}"
  },
  "roles": {
    "admin": "Administrator",
    "parent": "Parent",
    "teen": "Teen",
    "child": "Child"
  },
  "sidebar": {
    "overview": "Overview",
    "myChores": "My Chores",
    "allChores": "All Chores",
    "reports": "Reports",
    "familySettings": "Family Settings",
    "help": "Help & Support"
  }
}
```

### Tasks Namespace: `/public/locales/en-CA/tasks.json`

```json
{
  "tasks": {
    "title": "Chores",
    "myTasks": "My Chores",
    "allTasks": "All Family Chores",
    "create": "Add New Chore",
    "edit": "Edit Chore",
    "delete": "Delete Chore",
    "due": "Due"
  },
  "taskForm": {
    "title": "Chore Title",
    "description": "Description",
    "category": "Category",
    "priority": "Priority",
    "dueDate": "Due Date",
    "assignTo": "Assign to",
    "recurring": "Repeats Every",
    "required": "This field is required",
    "selectCategory": "Select a category...",
    "selectPriority": "Select priority..."
  },
  "categories": {
    "cleaning": "Cleaning",
    "homework": "Homework",
    "pets": "Pets",
    "other": "Other"
  },
  "priority": {
    "low": "Low",
    "medium": "Medium",
    "high": "High"
  },
  "status": {
    "pending": "Not Started",
    "inProgress": "In Progress",
    "completed": "Completed",
    "overdue": "Overdue"
  },
  "recurring": {
    "none": "Once",
    "daily": "Daily"
  },
  "messages": {
    "taskCreated": "Chore created successfully!",
    "taskUpdated": "Chore updated successfully!",
    "taskDeleted": "Chore deleted successfully!",
    "taskCompleted": "Great job! Chore completed.",
    "confirmDelete": "Are you sure you want to delete this chore?"
  }
}
```

### Family Namespace: `/public/locales/en-CA/family.json`

```json
{
  "family": {
    "settings": "Family Settings",
    "members": "Family Members",
    "invite": "Invite Member",
    "name": "Family Name",
    "memberCount": "Members: {{count}}"
  },
  "members": {
    "title": "Family Members",
    "addMember": "Add Member",
    "role": "Role",
    "joined": "Joined",
    "remove": "Remove",
    "confirmRemove": "Are you sure you want to remove {{name}} from the family?",
    "pendingInvitations": "Pending Invitations",
    "resend": "Resend",
    "cancel": "Cancel"
  },
  "invite": {
    "title": "Invite Family Member",
    "email": "Email Address",
    "role": "Role",
    "message": "Personal Message (optional)",
    "send": "Send Invitation",
    "success": "Invitation sent to {{email}}!",
    "error": "Could not send invitation",
    "alreadyMember": "This person is already a family member"
  }
}
```

---

## Component Examples

### Language Selector Component

Create `/src/components/LanguageSelector.tsx`:

```typescript
'use client';

import { Language, useI18n } from '@/lib/i18n-context';
import { updateUserLanguage } from '@/lib/api/user';
import { useState } from 'react';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en-CA', label: 'English (Canada)', flag: '🇨🇦' },
  { code: 'fr-CA', label: 'Français (Canada)', flag: '🇨🇦' },
  { code: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
];

export function LanguageSelector() {
  const { language, setLanguage } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = async (newLang: Language) => {
    setIsLoading(true);
    try {
      // Update localStorage
      setLanguage(newLang);

      // Update database if user is authenticated
      const response = await fetch('/api/user/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: newLang }),
      });

      if (!response.ok) {
        console.error('Failed to save language preference');
      }

      // Refresh page content in new language
      window.location.reload();
    } catch (error) {
      console.error('Error changing language:', error);
      setLanguage(language); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language" className="text-sm font-medium">
        Language:
      </label>
      <select
        id="language"
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value as Language)}
        disabled={isLoading}
        className="px-3 py-2 border rounded-md text-sm"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### Using Translations in Client Components

Create `/src/app/dashboard/page.tsx`:

```typescript
'use client';

import { useTranslation } from '@/lib/i18n-context';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user data
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    // Call your API
    setUserName('John');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {t('dashboard.welcome', { name: userName || 'User' })}
      </h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title={t('dashboard.today')}
          value="5"
          description={t('dashboard.completed')}
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}
```

### Server Component with Translation

Create `/src/app/dashboard/layout.tsx`:

```typescript
import { useTranslationServer } from '@/lib/i18n-server';
import { getUserLanguage } from '@/lib/api/user';
import { LanguageSelector } from '@/components/LanguageSelector';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userLanguage = await getUserLanguage();
  const { t } = await useTranslationServer('dashboard', userLanguage);

  return (
    <div>
      <header className="flex justify-between items-center p-4 bg-gray-50">
        <h1 className="text-xl font-bold">{t('dashboard.title')}</h1>
        <LanguageSelector />
      </header>
      <main>{children}</main>
    </div>
  );
}
```

---

## Date & Time Formatting

### Locale-Aware Date Formatter

Create `/src/lib/date-formatter.ts`:

```typescript
import { Language } from '@/lib/i18n-context';

export function formatDate(
  date: Date | string,
  language: Language,
  format: 'short' | 'long' | 'full' = 'short'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const localeMap: Record<Language, string> = {
    'en-CA': 'en-CA',
    'fr-CA': 'fr-CA',
    'pt-BR': 'pt-BR',
  };

  const formatOptions: Record<
    'short' | 'long' | 'full',
    Intl.DateTimeFormatOptions
  > = {
    short: {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    },
    long: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
    full: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  };

  return new Intl.DateTimeFormat(
    localeMap[language],
    formatOptions[format]
  ).format(dateObj);
}

export function formatTime(
  date: Date | string,
  language: Language
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const localeMap: Record<Language, string> = {
    'en-CA': 'en-CA',
    'fr-CA': 'fr-CA',
    'pt-BR': 'pt-BR',
  };

  return new Intl.DateTimeFormat(localeMap[language], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: language === 'en-CA', // 12-hour for English, 24-hour for others
  }).format(dateObj);
}

export function formatRelativeTime(
  date: Date | string,
  language: Language
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(
    language === 'pt-BR' ? 'pt-BR' : language,
    { numeric: 'auto' }
  );

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return rtf.format(-diffHours, 'hour');
  }

  return rtf.format(-diffDays, 'day');
}
```

### Using Date Formatter in Components

```typescript
'use client';

import { useI18n } from '@/lib/i18n-context';
import { formatDate, formatTime } from '@/lib/date-formatter';

export function TaskDueDate({ dueDate }: { dueDate: Date }) {
  const { language } = useI18n();

  return (
    <div>
      <p>Due: {formatDate(dueDate, language, 'long')}</p>
      <p className="text-sm text-gray-600">
        {formatTime(dueDate, language)}
      </p>
    </div>
  );
}
```

---

## Age-Appropriate Messaging

### Translation Structure for Age Groups

Language files support nested keys for age-specific content:

```json
{
  "messages": {
    "taskComplete": {
      "child": "Awesome job! You finished your chore!",
      "preteen": "Great work! You've completed your task.",
      "teen": "Task completed successfully."
    },
    "encouragement": {
      "child": "Keep it up, superstar!",
      "preteen": "You're doing a great job staying on top of your responsibilities!",
      "teen": "Excellent consistency with your tasks."
    }
  }
}
```

### Age-Aware Message Function

Create `/src/lib/messages.ts`:

```typescript
import { Language, useI18n } from '@/lib/i18n-context';

export type AgeGroup = 'child' | 'preteen' | 'teen';

export function getAgeAppropriateMessage(
  t: (key: string) => string,
  messageKey: string,
  ageGroup: AgeGroup
): string {
  const fullKey = `${messageKey}.${ageGroup}`;

  try {
    return t(fullKey);
  } catch {
    // Fallback to default if age-specific not found
    return t(messageKey);
  }
}

// Usage in component
export function CompletionMessage({ ageGroup }: { ageGroup: AgeGroup }) {
  const { t } = useI18n('tasks');
  const message = getAgeAppropriateMessage(
    t,
    'messages.taskComplete',
    ageGroup
  );

  return <p className="text-lg font-semibold">{message}</p>;
}
```

### Portuguese Brazilian Specifics

```json
{
  "taskForm": {
    "title": "Título da Tarefa",
    "dueDate": "Data de Vencimento"
  },
  "categories": {
    "cleaning": "Limpeza",
    "homework": "Lição de Casa",
    "pets": "Animais de Estimação",
    "other": "Outro"
  }
}
```

---

## API Route for Language Preference

Create `/src/app/api/user/language/route.ts`:

```typescript
import { createServiceRoleClient } from '@/lib/supabase-server';
import { createClient } from '@/lib/supabase-client';

export async function POST(request: Request) {
  try {
    const { language } = await request.json();

    // Validate language
    if (!['en-CA', 'fr-CA', 'pt-BR'].includes(language)) {
      return Response.json(
        { error: 'Invalid language' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update all family memberships for this user
    const supabaseAdmin = createServiceRoleClient();
    const { error } = await supabaseAdmin
      .from('family_members')
      .update({ preferred_language: language })
      .eq('user_id', user.id);

    if (error) {
      return Response.json(
        { error: 'Failed to update preference' },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Language preference error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET to retrieve user's language
export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ language: 'en-CA' }); // Default
    }

    const { data } = await supabase
      .from('family_members')
      .select('preferred_language')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .single();

    return Response.json({
      language: data?.preferred_language || 'en-CA',
    });
  } catch (error) {
    return Response.json({ language: 'en-CA' });
  }
}
```

---

## Testing Checklist

### Translation Coverage
- [ ] All UI strings have translations in all three languages
- [ ] No untranslated keys appear in interface
- [ ] Missing key fallback works (shows key name)
- [ ] Namespace organization is logical and complete

### Language Switching
- [ ] Language selector visible and functional
- [ ] Changing language updates entire UI immediately
- [ ] Preference saves to localStorage
- [ ] On reload, saved language persists
- [ ] Authenticated users: preference saves to database
- [ ] On new device/login: database preference loads

### Date/Time Formatting
- [ ] English Canada: MM/DD/YYYY, 12-hour time
- [ ] French Canada: DD/MM/YYYY, 24-hour time
- [ ] Portuguese Brazil: DD/MM/YYYY, 24-hour time
- [ ] Month names translated correctly
- [ ] Weekday names translated correctly
- [ ] Relative time ("2 days ago") translated

### Age-Appropriate Content
- [ ] Child messages are simple and encouraging
- [ ] Preteen messages are balanced
- [ ] Teen messages are mature and straightforward
- [ ] All age groups see age-appropriate messaging

### Browser Language Detection
- [ ] Browser language pt-BR loads Portuguese
- [ ] Browser language fr-CA loads French
- [ ] Browser language en-* loads English
- [ ] Unsupported browser language defaults to English

### Performance
- [ ] Translation files load <500ms
- [ ] Language switching <200ms
- [ ] No console errors related to translations
- [ ] Bundle size impact acceptable

### Pages to Test
- [ ] Login page
- [ ] Registration page
- [ ] Dashboard
- [ ] Task creation/editing
- [ ] Family settings
- [ ] Member invitation
- [ ] Task completion flow

### Content Areas
- [ ] All buttons translated
- [ ] Form labels translated
- [ ] Error messages translated
- [ ] Success messages translated
- [ ] Navigation items translated
- [ ] Modal titles and content translated
- [ ] Email templates translated (future)

---

## Deployment

### Environment Variables

Add to `.env.local`:

```
NEXT_PUBLIC_DEFAULT_LOCALE=en-CA
NEXT_PUBLIC_SUPPORTED_LOCALES=en-CA,fr-CA,pt-BR
```

### Vercel Configuration

Update `vercel.json`:

```json
{
  "env": {
    "NEXT_PUBLIC_DEFAULT_LOCALE": "en-CA",
    "NEXT_PUBLIC_SUPPORTED_LOCALES": "en-CA,fr-CA,pt-BR"
  }
}
```

### Build Verification

```bash
# Verify all translations exist
npm run verify:translations

# Build and check bundle size
npm run build

# Check for missing translations
npm run check:i18n
```

### Pre-Deployment Checklist

- [ ] All translation files complete and valid JSON
- [ ] Database migration tested on dev database
- [ ] Language preference API endpoint working
- [ ] Date formatter working for all locales
- [ ] No console errors in all three languages
- [ ] Performance metrics acceptable
- [ ] Browser language detection working
- [ ] localStorage persistence working

---

## RTL (Right-to-Left) Preparation

While not implemented in MVP, the system is prepared for future RTL support:

```typescript
// Future: Add RTL language support

// Would add languages like ar-SA (Arabic), he-IL (Hebrew)
// Configuration ready for CSS direction handling
// HTML lang/dir attributes already in place

// Future namespace example:
// export type Language = 'en-CA' | 'fr-CA' | 'pt-BR' | 'ar-SA' | 'he-IL';

// RTL-aware CSS (already available):
const isRTL = ['ar-SA', 'he-IL'].includes(language);
const direction = isRTL ? 'rtl' : 'ltr';
```

---

## Scaling Translations

### Adding New Languages

To add a new language (e.g., Spanish):

1. Create new locale files:
```
/public/locales/es-MX/
├── common.json
├── auth.json
├── dashboard.json
├── tasks.json
└── family.json
```

2. Update Language type:
```typescript
export type Language = 'en-CA' | 'fr-CA' | 'pt-BR' | 'es-MX';
```

3. Update language selector:
```typescript
const LANGUAGES = [
  { code: 'en-CA', label: 'English (Canada)', flag: '🇨🇦' },
  { code: 'fr-CA', label: 'Français (Canada)', flag: '🇨🇦' },
  { code: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'es-MX', label: 'Español (México)', flag: '🇲🇽' },
];
```

4. Update database constraint:
```sql
ALTER TABLE family_members
DROP CONSTRAINT family_members_valid_language;

ALTER TABLE family_members
ADD CONSTRAINT family_members_valid_language
CHECK (preferred_language IN ('en-CA', 'fr-CA', 'pt-BR', 'es-MX'));
```

---

## Common Issues & Solutions

### Issue: Translations Not Loading
**Cause**: Incorrect file paths or namespace mismatch
**Solution**: Verify JSON file locations and ensure namespace names match between config and usage

### Issue: Hydration Mismatch
**Cause**: Server and client rendering different content
**Solution**: Use `useSuspense: false` in i18next config and wrap client components properly

### Issue: Language Preference Not Persisting
**Cause**: Database not saving or localStorage not accessible
**Solution**: Check API endpoint, verify database migration ran, check browser cookies/storage

### Issue: Date Formatting Wrong
**Cause**: Wrong locale code or browser doesn't support locale
**Solution**: Use proper language codes (en-CA not en-ca), provide fallback formatting

---

## Summary Table

| Component | Status | Priority | Effort |
|-----------|--------|----------|--------|
| Dependencies install | Ready | High | 0.5 hours |
| next-i18next config | Ready | High | 1 hour |
| Translation files (3 langs × 5 namespaces) | Ready | High | 4 hours |
| Language selector component | Ready | High | 1 hour |
| Database migration | Ready | High | 0.5 hours |
| API endpoints | Ready | High | 1 hour |
| Date/time formatter | Ready | High | 1 hour |
| Age-appropriate messaging | Ready | High | 0.5 hours |
| Testing & QA | Ready | High | 1.5 hours |

**Total Estimated Effort**: 10 hours

---

## Next Steps

1. Install dependencies: `npm install next-i18next i18next i18next-browser-languagedetector`
2. Create configuration files (next-i18next.config.js, lib/i18n-*.ts)
3. Set up translation file structure
4. Create language selector component
5. Run database migration for preferred_language column
6. Update all components to use `useTranslation()` hook
7. Test language switching in all pages
8. Verify date/time formatting per locale
9. Test with different browser language settings
10. Deploy to staging and QA test all three languages

---

## References

- [next-i18next Documentation](https://next-i18next.com)
- [i18next Guide](https://www.i18next.com)
- [Intl API Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- Project: Kids Chores Tracker
- Version: Sprint 0.5
- Last Updated: November 2024
