# Vercel Deployment Guide - Kids Chores Tracker

Complete step-by-step guide to deploy your Next.js application to Vercel.

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Completed MVP 1.0 (all features working locally)
- ✅ GitHub repository with latest code pushed
- ✅ Supabase project created and configured
- ✅ Environment variables documented
- ✅ No TypeScript errors (`npm run build` succeeds)
- ✅ Vercel account (free tier works fine)

---

## Step 1: Prepare Your Repository

### 1.1 Verify Local Build

```bash
# Test production build locally
npm run build

# If build succeeds, test production server
npm run start

# Visit http://localhost:3000 and verify everything works
```

**If build fails:**
- Fix all TypeScript errors
- Resolve any missing dependencies
- Check for syntax errors
- Ensure all environment variables are set

### 1.2 Create `.vercelignore` File

Create a file named `.vercelignore` in your project root:

```
# Vercel ignore file
node_modules
.next
.env.local
.env*.local
*.log
.git
.vscode
.idea
dist
coverage
```

### 1.3 Update `package.json` Scripts

Ensure your `package.json` has these scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 1.4 Push to GitHub

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Prepare for Vercel deployment"

# Push to main branch
git push origin main
```

---

## Step 2: Create Vercel Account

### 2.1 Sign Up

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your GitHub account

### 2.2 Install Vercel CLI (Optional but Recommended)

```bash
# Install globally
npm install -g vercel

# Login to Vercel
vercel login

# This will open browser for authentication
```

---

## Step 3: Import Your Project to Vercel

### 3.1 Via Vercel Dashboard

1. Log in to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Find your `kids-chores-tracker` repository
5. Click **"Import"**

### 3.2 Configure Project Settings

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: `.` (leave as default)

**Build Command**: `next build` (auto-filled)

**Output Directory**: `.next` (auto-filled)

**Install Command**: `npm install` (auto-filled)

---

## Step 4: Configure Environment Variables

### 4.1 Required Environment Variables

In Vercel dashboard, go to **"Environment Variables"** section and add:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

# (Optional) Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4.2 Get Supabase Credentials

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY`

### 4.3 Environment Scopes

For each environment variable, select environments:
- ✅ **Production** (for live site)
- ✅ **Preview** (for PR previews)
- ⚠️ **Development** (optional, for `vercel dev` local development)

**Important**: Never commit `.env` files to Git!

---

## Step 5: Configure Supabase for Vercel Domain

### 5.1 Get Your Vercel Domain

After deployment, your app will be at:
- Production: `https://your-app-name.vercel.app`
- Previews: `https://your-app-name-git-branch.vercel.app`

### 5.2 Add Vercel Domain to Supabase

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add to **Site URL**: `https://your-app-name.vercel.app`
3. Add to **Redirect URLs**:
   ```
   https://your-app-name.vercel.app/**
   https://your-app-name.vercel.app/auth/callback
   https://*.vercel.app/**
   ```

### 5.3 Configure Email Templates (Optional)

Update Supabase email templates to use your Vercel domain:

1. **Authentication** → **Email Templates**
2. Update **Confirm signup**, **Reset password**, etc.
3. Replace `{{ .SiteURL }}` links with your Vercel domain if needed

---

## Step 6: Deploy to Production

### 6.1 Deploy via Dashboard

1. After configuring environment variables, click **"Deploy"**
2. Vercel will:
   - Clone your repository
   - Install dependencies
   - Run build command
   - Deploy to global CDN

**Build time**: ~2-5 minutes for first deployment

### 6.2 Deploy via CLI (Alternative)

```bash
# Navigate to project directory
cd kids-chores-tracker

# Deploy to production
vercel --prod

# Follow prompts:
# - Link to existing project? Yes
# - Select project: kids-chores-tracker
```

### 6.3 Monitor Build Logs

- Watch build progress in Vercel dashboard
- Check for any errors in build logs
- Verify successful deployment message

---

## Step 7: Verify Deployment

### 7.1 Test Your Deployed App

1. Visit `https://your-app-name.vercel.app`
2. Test critical workflows:
   - ✅ User registration
   - ✅ Login/logout
   - ✅ Family creation (onboarding)
   - ✅ Child creation
   - ✅ Task creation
   - ✅ Task completion
   - ✅ Parent review
   - ✅ Image uploads
   - ✅ Language switching

### 7.2 Check Browser Console

- Open DevTools (F12)
- Look for errors in Console tab
- Verify no CORS errors
- Check Network tab for failed requests

### 7.3 Test on Mobile

- Visit site on mobile device
- Verify responsive layout
- Test bottom navigation
- Check image uploads from camera

---

## Step 8: Custom Domain (Optional)

### 8.1 Add Custom Domain

1. Go to Vercel Dashboard → Project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain: `kidschores.com`
4. Click **"Add"**

### 8.2 Configure DNS

Vercel will provide DNS records. Add to your domain registrar:

**For apex domain (kidschores.com)**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain (www.kidschores.com)**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 8.3 Update Supabase URLs

After custom domain is active:
1. Update Supabase **Site URL** to `https://kidschores.com`
2. Update **Redirect URLs** to include new domain

---

## Step 9: Configure Production Settings

### 9.1 Environment Variables Review

Ensure production environment has:
- ✅ Correct Supabase credentials
- ✅ Production API URL
- ✅ Analytics IDs (if using)

### 9.2 Enable Analytics (Optional)

**Vercel Analytics** (built-in):
1. Project → **Settings** → **Analytics**
2. Toggle **"Enable Analytics"**
3. Free tier: 100K events/month

**Google Analytics**:
1. Get GA4 Measurement ID
2. Add to environment variables: `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### 9.3 Configure Build Settings

**Production Branch**: `main` (default)

**Ignored Build Step**: Leave empty (build on every push)

**Node.js Version**: `20.x` (recommended)

### 9.4 Performance Optimizations

**Image Optimization**:
- Already configured in `next.config.js`
- Vercel automatically optimizes images

**Caching**:
- Vercel automatically caches static assets
- API routes are edge-cached when possible

---

## Step 10: Continuous Deployment

### 10.1 Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request (PR)

### 10.2 Preview Deployments

For each PR, Vercel creates a preview deployment:
- URL: `https://your-app-git-feature-branch.vercel.app`
- Full production environment
- Use for testing before merging

### 10.3 Deployment Protection (Optional)

Enable deployment protection:
1. Project → **Settings** → **Deployment Protection**
2. Toggle **"Enable Protection"**
3. Require password for preview deployments

---

## Step 11: Database Migrations on Vercel

### 11.1 Run Migrations After Deployment

**Option 1: Manual via Supabase Dashboard**
1. Go to Supabase Dashboard → **SQL Editor**
2. Run migration files in order
3. Verify schema with **Table Editor**

**Option 2: Automated via Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to remote project
supabase link --project-ref your-project-id

# Push migrations
supabase db push
```

### 11.2 Verify Database Schema

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Should show:
-- families, family_members, family_invitations, children, tasks,
-- task_assignments, task_completions, recurring_task_instances,
-- subtasks, rewards, point_transactions, achievements, child_achievements
```

---

## Step 12: Post-Deployment Checklist

### 12.1 Security Checklist

- [ ] Environment variables secured (not in code)
- [ ] Supabase RLS policies enabled
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] CORS configured correctly
- [ ] API routes protected
- [ ] No secrets in client-side code

### 12.2 Performance Checklist

- [ ] Lighthouse score >90 (mobile)
- [ ] Images optimized and loading fast
- [ ] Core Web Vitals: "Good"
- [ ] No console errors on production
- [ ] Database queries indexed

### 12.3 Functionality Checklist

- [ ] User registration works
- [ ] Email authentication works
- [ ] Password reset flow works
- [ ] Image uploads work
- [ ] All CRUD operations work
- [ ] Mobile responsive
- [ ] Multi-language switching works

---

## Troubleshooting Common Issues

### Issue 1: Build Fails on Vercel

**Error**: `Module not found` or `Cannot find module`

**Solution**:
```bash
# Ensure all dependencies are in package.json
npm install

# Commit package-lock.json
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### Issue 2: Environment Variables Not Working

**Error**: `undefined` when accessing `process.env.NEXT_PUBLIC_*`

**Solution**:
1. Verify environment variable names match exactly
2. Redeploy after adding/updating env vars
3. For `NEXT_PUBLIC_*` vars, ensure they start with `NEXT_PUBLIC_`

### Issue 3: Supabase Connection Failed

**Error**: `Failed to fetch` or CORS errors

**Solution**:
1. Verify Supabase URL in environment variables
2. Add Vercel domain to Supabase allowed origins
3. Check Supabase project is not paused

### Issue 4: Images Not Loading

**Error**: 403 Forbidden on Supabase Storage images

**Solution**:
1. Check Supabase Storage bucket policies (public read access)
2. Verify `next.config.js` remote patterns for Supabase domain
3. Ensure images were uploaded successfully

### Issue 5: Deployment Succeeds But App Crashes

**Error**: "Application Error" on live site

**Solution**:
1. Check Vercel **Runtime Logs** for errors
2. Look for missing environment variables
3. Verify API routes are not crashing
4. Check database connection

---

## Monitoring & Maintenance

### Enable Error Tracking

**Sentry** (recommended):
```bash
npm install @sentry/nextjs

# Follow Sentry setup wizard
npx @sentry/wizard@latest -i nextjs
```

Add Sentry DSN to environment variables:
```
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

### Monitor Performance

**Vercel Analytics**:
- View real user metrics
- Core Web Vitals dashboard
- Page load performance

**Lighthouse CI** (optional):
```bash
# Run Lighthouse on each deployment
npm install -D @lhci/cli

# Add to package.json scripts
"lighthouse": "lhci autorun"
```

### Database Backups

**Supabase Automatic Backups**:
- Free tier: Daily backups (7-day retention)
- Pro tier: Point-in-time recovery

**Manual Backup**:
```bash
# Export database via Supabase CLI
supabase db dump -f backup.sql

# Store in secure location (not in Git)
```

---

## Scaling Considerations

### Free Tier Limits (Vercel)

- **Bandwidth**: 100 GB/month
- **Function Execution**: 100 GB-Hours/month
- **Build Minutes**: 6000 minutes/month
- **Serverless Function Size**: 50 MB

**When to Upgrade**:
- Exceeding bandwidth (100+ active families)
- Need team collaboration
- Want custom analytics
- Require better support

### Free Tier Limits (Supabase)

- **Database**: 500 MB
- **Storage**: 1 GB
- **Bandwidth**: 5 GB/month
- **API Requests**: Unlimited (fair use)

**When to Upgrade**:
- Database size >500 MB
- Heavy image uploads (>1 GB)
- Need daily backups
- Require point-in-time recovery

---

## Cost Estimates

### Vercel Pricing

| Tier | Price | Best For |
|------|-------|----------|
| Hobby | $0/month | Personal projects, testing |
| Pro | $20/month | Production apps, teams |
| Enterprise | Custom | Large scale, SLA |

### Supabase Pricing

| Tier | Price | Best For |
|------|-------|----------|
| Free | $0/month | Development, small apps |
| Pro | $25/month | Production, growing apps |
| Team | $599/month | Multiple projects |
| Enterprise | Custom | Large scale |

### Recommended Setup for MVP 1.0

**Total Cost**: $0-45/month

- Vercel: Free tier (sufficient for <100 families)
- Supabase: Free tier initially, upgrade to Pro ($25/month) when needed
- Domain: $10-15/year (optional)

---

## Next Steps After Deployment

1. **Share with Beta Users**
   - Invite 5-10 families for testing
   - Collect feedback via Google Forms or Typeform

2. **Monitor Usage**
   - Track active users
   - Monitor error rates
   - Review performance metrics

3. **Iterate Based on Feedback**
   - Fix critical bugs immediately
   - Plan MVP 1.1 features based on user requests

4. **Set Up CI/CD** (optional)
   - Add automated testing
   - Lint checks before deployment
   - Type checking in CI

5. **Plan Marketing**
   - Create landing page
   - Social media presence
   - App Store (if building mobile later)

---

## Support Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Community**: Vercel Discord, Supabase Discord

---

## Quick Reference Commands

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Link local project to Vercel
vercel link

# Pull environment variables to local
vercel env pull

# Run Vercel dev server (with serverless functions)
vercel dev
```

---

**Congratulations! Your app is now live! 🎉**

Visit `https://your-app-name.vercel.app` and share it with users.
