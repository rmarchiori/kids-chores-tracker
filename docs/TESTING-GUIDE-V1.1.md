# Testing Guide - Version 1.1 Features

Complete guide to testing all features implemented in MVP 1.1.

## 🚀 Quick Start

1. **Start the app**: `npm run dev`
2. **Access**: http://localhost:3001
3. **Login/Register**: Create account or use existing credentials

---

## 📋 Feature Testing Checklist

### 1. Enhanced Calendar Views (Weekly/Monthly)

**Location**: `/calendar`

**How to Test**:
- [ ] Navigate to Calendar from sidebar/bottom nav
- [ ] Switch between Week and Month views using toggle buttons
- [ ] Click on different dates to view tasks for that day
- [ ] Verify color coding: 🟢 Completed, 🟡 Pending, 🔴 Overdue
- [ ] Check that recurring tasks appear on correct dates
- [ ] Test date navigation (prev/next buttons)

**Expected**:
- Smooth view transitions
- Tasks displayed correctly per date
- Color indicators match task status
- Performance: loads in < 2 seconds

---

### 2. Analytics Dashboard

**Location**: `/analytics`

**How to Test**:
- [ ] Access Analytics from sidebar
- [ ] View completion rate chart (last 7/30 days)
- [ ] Check task distribution by child
- [ ] Review streak statistics
- [ ] Test date range selector
- [ ] Verify chart responsiveness on mobile

**Expected**:
- Charts render with accurate data
- Filters update charts dynamically
- Export functionality works (if implemented)
- Responsive design on all screens

---

### 3. Points & Reward System

**Location**: `/rewards`

**How to Test**:
- [ ] Navigate to Rewards page
- [ ] Complete a task and verify points awarded
- [ ] Check point balance updates in real-time
- [ ] Create a reward with point cost
- [ ] Redeem a reward as a child
- [ ] Verify parent approval workflow
- [ ] Test point history log

**Expected**:
- Points calculated correctly per task
- Balance updates immediately
- Rewards can be created/edited/deleted
- Redemption requires parent approval
- Transaction history is accurate

---

### 4. Achievement Badges & Streaks

**Location**: Integrated in `/home`, `/children/[id]/tasks`

**How to Test**:
- [ ] Complete 3 consecutive days → Check "3-Day Streak" badge
- [ ] Complete 7 consecutive days → Check "Week Warrior" badge
- [ ] Complete first task ever → Check "First Steps" badge
- [ ] View badge collection in profile
- [ ] Test streak reset logic (miss a day)
- [ ] Verify badge notifications appear

**Expected Badges**:
- 🔥 **First Steps**: Complete first task
- 🌟 **3-Day Streak**: 3 consecutive days
- ⭐ **Week Warrior**: 7 consecutive days
- 🏆 **Perfect Week**: Complete all tasks for 7 days
- 💪 **Month Master**: 30-day streak
- 🎯 **100 Tasks**: Complete 100 tasks total

**Expected**:
- Badges unlock automatically
- Streaks count correctly
- Visual indicators (flames, stars) update
- Notifications appear on unlock

---

### 5. Leaderboard & Family Competition

**Location**: `/home` (Leaderboard widget)

**How to Test**:
- [ ] View family leaderboard on home page
- [ ] Complete tasks and see rank update
- [ ] Check weekly vs. all-time rankings toggle
- [ ] Verify tie-breaking logic (equal points)
- [ ] Test with multiple children
- [ ] Check reset on Monday (weekly board)

**Expected**:
- Leaderboard shows all children
- Rankings update in real-time
- Points calculated accurately
- Weekly resets work correctly
- Visual indicators for 1st/2nd/3rd place

---

### 6. Chromecast Integration

**Location**: `/settings/cast`

**How to Test**:

**Setup**:
- [ ] Navigate to Cast Settings
- [ ] Enable Chromecast feature
- [ ] Have Chromecast device on same network

**Casting**:
- [ ] Click "Cast Dashboard" button
- [ ] Select your Chromecast device
- [ ] Verify dashboard appears on TV
- [ ] Test live updates (complete task → see on TV)
- [ ] Try disconnecting and reconnecting

**Receiver Page** (TV View):
- [ ] Access `/cast/receiver`
- [ ] Shows family dashboard
- [ ] Real-time task completion updates
- [ ] Leaderboard displays correctly
- [ ] Animations smooth on large screen

**Expected**:
- Device discovery works
- Connection stable
- UI optimized for TV (large text/icons)
- Real-time sync < 2 seconds
- Graceful disconnect handling

---

## 🧪 Testing Workflows

### Complete User Journey: New Parent

1. Register account → `/auth/register`
2. Complete onboarding → `/onboarding`
3. Create family → Auto-created
4. Add child profiles → `/children/new`
5. Create first task → `/tasks/new`
6. Assign to child with points
7. Child completes task → `/daily`
8. Review & approve → `/reviews`
9. Check analytics → `/analytics`
10. View leaderboard → `/home`

### Complete User Journey: Child

1. Login with child account
2. View today's tasks → `/daily`
3. Complete a task
4. Earn points + check balance
5. View streak progress
6. Check leaderboard ranking
7. Browse rewards → `/rewards`
8. Redeem a reward
9. View earned badges

---

## 🐛 Common Issues & Solutions

### Calendar Not Loading
- **Check**: Browser console for errors
- **Fix**: Clear cache, refresh page
- **Verify**: Network tab shows successful API calls

### Points Not Updating
- **Check**: Task has point value assigned
- **Fix**: Refresh page, check database sync
- **Verify**: Check `/rewards` page for transaction log

### Chromecast Not Connecting
- **Check**: Same WiFi network as Chromecast
- **Fix**: Restart Chromecast, clear browser cache
- **Verify**: Chrome browser has Cast extension

### Badges Not Unlocking
- **Check**: Criteria met (e.g., 3 consecutive days)
- **Fix**: Check streak calculation logic
- **Verify**: Database shows correct completion dates

---

## 📱 Cross-Device Testing

Test on these devices/browsers:

### Desktop
- [ ] Chrome (Windows/Mac)
- [ ] Firefox
- [ ] Safari (Mac only)
- [ ] Edge

### Mobile
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Mobile responsive design
- [ ] Touch interactions
- [ ] Bottom navigation works

### Tablet
- [ ] iPad Safari
- [ ] Android tablet
- [ ] Landscape mode
- [ ] Split-screen (if supported)

---

## 🔐 Security & Permission Testing

### Role-Based Access
- [ ] **Admin**: Can access family settings
- [ ] **Parent**: Can create/edit tasks, review completions
- [ ] **Teen**: Can view tasks, manage siblings (if enabled)
- [ ] **Child**: Can only complete own tasks

### Data Isolation
- [ ] Family A cannot see Family B data
- [ ] Child A cannot complete Child B tasks
- [ ] Invitations work correctly

---

## ⚡ Performance Benchmarks

| Feature | Target Load Time | Acceptable |
|---------|------------------|------------|
| Calendar View | < 1.5s | < 3s |
| Analytics Dashboard | < 2s | < 4s |
| Leaderboard | < 1s | < 2s |
| Rewards Page | < 1.5s | < 3s |
| Chromecast Connect | < 3s | < 5s |

**How to Measure**:
- Open DevTools → Network tab
- Hard refresh (Ctrl+Shift+R)
- Check "Load" time in bottom status bar

---

## 📊 Data Validation

### Before Testing
1. Create test data:
   - 3+ children
   - 10+ tasks (mix of daily/weekly/recurring)
   - Complete some tasks
   - Leave some overdue

2. Verify database:
   - Check Supabase dashboard
   - Verify foreign keys intact
   - Test data relationships

---

## 🎯 Acceptance Criteria

All features pass when:
- ✅ No console errors
- ✅ All UI elements render correctly
- ✅ Data persists across page refreshes
- ✅ Mobile responsive works
- ✅ Real-time updates function
- ✅ Performance meets benchmarks
- ✅ No security vulnerabilities
- ✅ Accessibility (keyboard navigation, screen readers)

---

## 🚨 Report Issues

When you find a bug:

1. **Document**:
   - Steps to reproduce
   - Expected vs. actual behavior
   - Browser/device info
   - Screenshots/video

2. **Severity**:
   - 🔴 **Critical**: Blocks core functionality
   - 🟡 **High**: Major feature broken
   - 🟢 **Medium**: Minor issue, workaround exists
   - ⚪ **Low**: Cosmetic/nice-to-have

3. **Report**: Create GitHub issue or notify team

---

## ✅ Testing Complete?

After testing all features:
- [ ] All checkboxes above marked
- [ ] No critical/high severity bugs
- [ ] Performance acceptable
- [ ] Tested on 2+ browsers
- [ ] Tested on mobile
- [ ] Documented any issues

**Ready for Production!** 🎉
