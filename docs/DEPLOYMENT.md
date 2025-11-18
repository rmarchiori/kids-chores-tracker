# Deployment Guide - Kids Chores Tracker

**Phase 3.2: Polish & Production Deployment**
**Last Updated**: 2025-11-18

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Variables](#environment-variables)
3. [Supabase Setup](#supabase-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Post-Deployment Testing](#post-deployment-testing)
6. [Monitoring & Logging](#monitoring--logging)
7. [Rollback Procedure](#rollback-procedure)
8. [Production Maintenance](#production-maintenance)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript errors resolved (`npm run build`)
- [ ] No console.error or console.warn in production code
- [ ] All environment variables documented
- [ ] Security headers configured (next.config.js)
- [ ] No hardcoded secrets or API keys in code
- [ ] .env.example file up to date

### Database
- [ ] All migrations run successfully
- [ ] RLS policies tested and verified
- [ ] Database indexes created (migrations 11, 12)
- [ ] Seed data prepared (optional)
- [ ] Database backup enabled

### Testing
- [ ] Phase 3.1 testing complete (see TESTING.md)
- [ ] All P0/P1 bugs fixed
- [ ] Performance targets met
- [ ] Accessibility score >90
- [ ] Mobile responsive verified

### Documentation
- [ ] README.md updated
- [ ] API documentation complete
- [ ] Deployment guide (this file) reviewed
- [ ] User documentation ready (if applicable)

---

## Environment Variables

### Production Environment Variables

Create a `.env.production` file (DO NOT commit to git):

```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Error Logging (Sentry)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### Environment Variable Descriptions

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Yes | Full URL of deployed app (for redirects, emails) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL from dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key (safe for client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server-side only) |
| `NODE_ENV` | Auto-set | Set to "production" by Vercel |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics tracking ID |
| `SENTRY_DSN` | No | Sentry error tracking DSN |

### Security Notes
- ⚠️ NEVER commit `.env` files to git
- ✅ `NEXT_PUBLIC_*` variables are safe for client-side
- ⚠️ Service role key must ONLY be used server-side
- ✅ Use environment variable management in Vercel dashboard
- ✅ Rotate keys if accidentally exposed

---

## Supabase Setup

### 1. Create Production Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project:
   - **Organization**: Your organization
   - **Name**: kids-chores-tracker-prod
   - **Database Password**: Generate strong password (save securely)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier (upgrade as needed)

3. Wait for project provisioning (~2 minutes)

### 2. Run Database Migrations

#### Option A: Using Supabase SQL Editor (Recommended)
1. Open Supabase Dashboard → SQL Editor
2. Run migrations in order:
   ```sql
   -- Run database/migrations/01-initial-schema.sql
   -- Run database/migrations/02-... (all in order)
   -- ...
   -- Run database/migrations/13-create-audit-trail.sql
   ```
3. Verify each migration completes successfully

#### Option B: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 3. Configure Authentication

1. Navigate to Authentication → Providers
2. Enable Email provider:
   - ✅ Enable Email provider
   - ✅ Confirm email (recommended)
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

3. Configure email templates (optional):
   - Navigate to Authentication → Email Templates
   - Customize confirmation, password reset emails
   - Add your branding

### 4. Configure Storage (for profile photos)

1. Navigate to Storage
2. Verify buckets exist (should be created by migrations):
   - `avatars` - Public bucket for profile photos
   - `task-images` - Public bucket for custom task images

3. Configure bucket policies:
   ```sql
   -- Allow authenticated users to upload avatars
   -- (Should be set by migrations, verify here)
   ```

### 5. Enable Row Level Security

Verify RLS is enabled on all tables:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`.

### 6. Get API Keys

1. Navigate to Settings → API
2. Copy credentials:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public**: `eyJ...` (public key)
   - **service_role**: `eyJ...` (secret key, keep secure!)

---

## Vercel Deployment

### 1. Prepare Git Repository

```bash
# Ensure on main branch (or deployment branch)
git checkout main

# Pull latest changes
git pull origin main

# Verify clean working directory
git status

# Run final build test
npm run build

# Verify build successful
npm run start  # Test production build locally
```

### 2. Create Vercel Project

#### Option A: Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import Git Repository:
   - Connect GitHub account (if not connected)
   - Select `kids-chores-tracker` repository
   - Click "Import"

4. Configure Project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add each variable from [Environment Variables](#environment-variables)
   - Select environments: Production, Preview, Development

6. Click "Deploy"
   - Wait for deployment (~2-3 minutes)
   - Vercel will run build and deploy

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts to configure project
```

### 3. Configure Custom Domain (Optional)

1. Navigate to Project → Settings → Domains
2. Add custom domain:
   - Enter domain: `chores.yourdomain.com`
   - Follow DNS configuration instructions
   - Add CNAME record to your DNS provider
   - Wait for DNS propagation (~10 minutes)

3. Configure SSL:
   - Vercel auto-provisions Let's Encrypt certificate
   - Verify HTTPS works

### 4. Configure Deployment Settings

1. Navigate to Project → Settings → Git
2. Configure branches:
   - **Production Branch**: `main`
   - **Deploy Previews**: Enable for all branches
   - **Auto-deploy**: Enable

3. Build & Development Settings:
   - **Framework**: Next.js
   - **Node Version**: 18.x (or latest LTS)
   - **Install Command**: `npm install`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. Environment-specific builds:
   - Production uses `.env.production` variables
   - Preview uses `.env.preview` (if set)

### 5. Update Supabase Redirect URLs

1. Return to Supabase Dashboard
2. Navigate to Authentication → URL Configuration
3. Add production URLs:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs:
     - `https://your-app.vercel.app/**`
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-custom-domain.com/**` (if using custom domain)

---

## Post-Deployment Testing

### Critical Flows to Test in Production

#### 1. User Registration
- [ ] Navigate to production URL
- [ ] Create new account with real email
- [ ] Verify confirmation email received
- [ ] Complete email confirmation
- [ ] Complete onboarding flow
- [ ] Verify family created

#### 2. Authentication
- [ ] Login with created account
- [ ] Logout
- [ ] Login again
- [ ] Test password reset:
  - Request password reset
  - Check email for reset link
  - Reset password
  - Login with new password

#### 3. Core Functionality
- [ ] Add child
- [ ] Create task with image from library
- [ ] Assign task to child
- [ ] Complete task as child
- [ ] Review task as parent
- [ ] View completion history

#### 4. Performance
- [ ] Run Lighthouse on production URL:
  - Performance: ___ (target >90)
  - Accessibility: ___ (target >90)
  - Best Practices: ___ (target >90)
  - SEO: ___ (target >90)

#### 5. Error Handling
- [ ] Test offline behavior
- [ ] Test invalid form submissions
- [ ] Test unauthorized access
- [ ] Verify error messages user-friendly
- [ ] Check error logging (if configured)

#### 6. Security Headers
Test security headers are applied:
```bash
curl -I https://your-app.vercel.app
```

Verify headers present:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: ...`

---

## Monitoring & Logging

### Vercel Analytics (Built-in)

1. Navigate to Project → Analytics
2. Monitor:
   - **Real User Metrics**: Page views, unique visitors
   - **Core Web Vitals**: LCP, FID, CLS
   - **Top Pages**: Most visited pages
   - **Error Rate**: Client and server errors

### Vercel Speed Insights (Recommended)

Enable Speed Insights for detailed performance monitoring:
```bash
npm install @vercel/speed-insights
```

Add to `app/layout.tsx`:
```tsx
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Error Logging with Sentry (Optional but Recommended)

1. Create Sentry account at [sentry.io](https://sentry.io)
2. Create new Next.js project
3. Install Sentry:
```bash
npm install @sentry/nextjs
```

4. Initialize Sentry:
```bash
npx @sentry/wizard@latest -i nextjs
```

5. Configure environment variables in Vercel:
   - `SENTRY_DSN`
   - `NEXT_PUBLIC_SENTRY_DSN`

6. Deploy updated app

### Database Monitoring

1. Supabase Dashboard → Database → Monitoring
2. Watch metrics:
   - **Connection count**: Monitor for connection leaks
   - **Query performance**: Identify slow queries
   - **Table sizes**: Monitor growth
   - **Index usage**: Verify indexes used

### Set Up Alerts

1. **Vercel**: Project → Settings → Notifications
   - Deployment failed
   - Domain errors

2. **Supabase**: Project → Settings → Notifications
   - Database size limits
   - API request limits
   - Storage limits

3. **Sentry** (if configured):
   - Error rate spike
   - New error types
   - Performance degradation

---

## Rollback Procedure

### Immediate Rollback (If Critical Bug Found)

#### Option 1: Vercel Dashboard (Fastest)
1. Navigate to Project → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Confirm promotion
5. Previous working version restored (~30 seconds)

#### Option 2: Git Revert
```bash
# Revert last commit
git revert HEAD

# Push to trigger redeployment
git push origin main

# Wait for Vercel auto-deploy (~2 minutes)
```

### Database Rollback (Use with Caution)

If migration caused issue:
1. Supabase Dashboard → SQL Editor
2. Write rollback migration
3. Test in staging first
4. Execute in production

**Better approach**: Write forward-fixing migration

---

## Production Maintenance

### Regular Maintenance Tasks

#### Daily
- [ ] Check error logs (Sentry/Vercel)
- [ ] Monitor uptime
- [ ] Review user-reported issues

#### Weekly
- [ ] Review performance metrics
- [ ] Check database size/growth
- [ ] Review API usage
- [ ] Update dependencies (security patches)

#### Monthly
- [ ] Full performance audit
- [ ] Security review
- [ ] Database optimization (VACUUM, ANALYZE)
- [ ] Review and rotate API keys (if needed)
- [ ] Update documentation

### Scaling Checklist

When you need to scale:

#### Database (Supabase)
- [ ] Upgrade to paid plan for more connections
- [ ] Add read replicas for read-heavy workload
- [ ] Optimize queries with EXPLAIN ANALYZE
- [ ] Add caching layer (Redis)

#### Application (Vercel)
- [ ] Upgrade to Pro for better performance
- [ ] Enable Edge Functions for low latency
- [ ] Implement ISR for static pages
- [ ] Add CDN for static assets

#### Costs Monitoring
- **Supabase Free Tier Limits**:
  - Database size: 500 MB
  - API requests: 500,000/month
  - Storage: 1 GB
  - Bandwidth: 2 GB

- **Vercel Free Tier Limits**:
  - Bandwidth: 100 GB/month
  - Build execution: 6000 minutes/month
  - Serverless function execution: 100 GB-hours

Monitor usage and upgrade when approaching limits.

---

## Production URLs

After deployment, update these URLs in documentation:

- **Production App**: https://your-app.vercel.app
- **Supabase Dashboard**: https://app.supabase.com/project/your-project
- **Vercel Dashboard**: https://vercel.com/your-username/kids-chores-tracker
- **Repository**: https://github.com/your-username/kids-chores-tracker

---

## Support & Troubleshooting

### Common Issues

**Issue**: Build fails on Vercel
- Check build logs in Vercel dashboard
- Verify all dependencies in package.json
- Test build locally: `npm run build`
- Check Node version compatibility

**Issue**: Environment variables not working
- Verify variables added in Vercel dashboard
- Redeploy after adding variables
- Check variable names match code

**Issue**: Supabase connection errors
- Verify Supabase URL and keys correct
- Check RLS policies not blocking requests
- Verify redirect URLs configured

**Issue**: Authentication not working
- Check Supabase redirect URLs include production domain
- Verify email confirmation configured
- Check browser cookies enabled

### Getting Help

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **GitHub Issues**: [Your repo]/issues

---

## Deployment Checklist Summary

### Pre-Deployment
- [ ] Code quality checks pass
- [ ] All tests pass
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Performance targets met
- [ ] Security review complete

### Deployment
- [ ] Supabase production project created
- [ ] Database migrations run
- [ ] Vercel project configured
- [ ] Environment variables set
- [ ] Domain configured (if using custom)
- [ ] SSL certificate active

### Post-Deployment
- [ ] Production smoke tests pass
- [ ] Performance audit complete
- [ ] Error logging configured
- [ ] Monitoring enabled
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team notified

---

**Deployment Status**: 🚀 Ready for Production

**Questions or Issues?** Review troubleshooting section or contact team lead.
