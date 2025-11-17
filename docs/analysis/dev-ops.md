# DevOps & Infrastructure - Kids Chores Tracker

**Version**: 1.0
**Cost**: $0/month (MVP free tier)
**Scale**: Free tier handles 50-500 concurrent users

---

## Deployment

### Platform: Vercel
- **Why**: Optimal for Next.js, zero-config deployment, auto-scaling
- **Free Tier**:
  - Deployments: 100/day
  - Function invocations: 1M/month
  - Data transfer: 100GB/month
  - Cold start: <1 second
- **CI/CD**: Automatic on GitHub push to main branch
- **Environments**: Development → Preview (PR) → Production

### Deployment Process

1. **Push to GitHub** - Feature branch complete, create PR
2. **Preview Deploy** - Vercel auto-deploys PR to preview URL
3. **Test & Review** - Test on preview environment
4. **Merge to main** - PR approval and merge
5. **Production Deploy** - Vercel auto-deploys to production (1-2 min)

### Environment Management
- **Development**: `npm run dev` (localhost:3000)
- **Staging/Preview**: Automatic via Vercel PR preview
- **Production**: Automatic via Vercel on main branch push

### Upgrade Path
- **Free → Vercel Pro** ($20/mo): Needed for >100 concurrent users or custom domains
- **Free → Vercel Enterprise**: Large-scale applications

---

## Database

### Platform: Supabase PostgreSQL
- **Why**: PostgreSQL reliability, built-in auth, RLS support, real-time APIs
- **Free Tier**:
  - Storage: 500MB
  - API Requests: Unlimited
  - Concurrent Users: 50K
  - Data Transfer: 10GB/month
- **Backups**: Automatic daily backups
- **Recovery Time**: <1 hour restoration

### Connection Management
```
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

- **Client-side**: Use anon key (restricted by RLS)
- **Server-side**: Use service role key (admin access)
- **Never expose**: Service role key to client/browser

### Upgrade Path
- **Free → Supabase Pro** ($25/mo): Needed for >5GB data or 10GB+ transfer/month
- **Free → Supabase Team**: Additional users/projects

---

## Version Control

### GitHub
- **Repository**: Single repo for full-stack application
- **Branches**:
  - `main` - Production-ready code (protected branch)
  - `feature/*` - Feature development
  - `bugfix/*` - Bug fixes
  - `hotfix/*` - Production emergency fixes
- **Commits**:
  - Descriptive messages ("Add task creation form" not "fix")
  - Squash before merge to keep history clean
  - One feature per commit

### Workflow
```
1. Create branch: git checkout -b feature/task-creation
2. Commit changes: git commit -m "Add task creation form with daily recurrence"
3. Push to GitHub: git push origin feature/task-creation
4. Create PR: Request review, add description
5. Review & Test: Vercel auto-deploys preview environment
6. Merge: Squash and merge to main
7. Deploy: Vercel auto-deploys to production
```

---

## Environment Management

### Local Development (.env.local)
Create `.env.local` in project root (git-ignored):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important**:
- Never commit `.env.local` to git
- `.gitignore` must include `*.local`
- Each developer has their own local variables

### Production (Vercel Dashboard)
Environment variables set in Vercel project settings:
- Go to Project Settings → Environment Variables
- Add same variables as `.env.local`
- No need to commit - stored securely in Vercel

### Secrets Management Best Practices
- ✅ Use environment variables for all secrets
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Never paste secrets into code or comments
- ✅ Rotate keys if accidentally exposed
- ✅ Use separate keys for development/production
- ❌ Never commit `.env` files
- ❌ Never log secrets
- ❌ Never share keys in chat/email

---

## Monitoring & Observability

### Built-in Tools
- **Vercel Speed Insights**: Page performance metrics
- **Vercel Web Analytics**: User behavior and traffic
- **Supabase Logs**: Database and auth logs

### Enable in Vercel Dashboard
1. Go to Analytics tab
- Enable "Web Analytics" (see page views, top pages, devices)
- Enable "Speed Insights" (monitor Core Web Vitals)

2. Go to Logs tab
- View function logs
- Monitor errors and performance

### Key Metrics to Track
- **Page Load Time**: Target <2s on 4G
- **Lighthouse Score**: Target >90
- **API Response Time**: Target <200ms
- **Error Rate**: Target <0.1%
- **Concurrent Users**: Free tier handles up to 50-100

### Optional Future (Phase 2+)
- **Sentry**: Error tracking and alerting
- **LogRocket**: Session replay for debugging
- **Custom Analytics**: Task completion rates, user engagement

---

## Scaling Strategy

### Current Capacity (Free Tier)
- **Concurrent Users**: 50-100 (before slowdown)
- **Tasks/Day**: ~5,000 completions
- **Families**: 50-200 active families
- **Storage**: Up to 500MB data

### Growth Triggers & Actions

**Trigger #1: 100+ concurrent users**
- ✅ Action: Upgrade Vercel to Pro ($20/mo)
- ✅ Benefit: Better scaling, priority support

**Trigger #2: 5GB+ data stored**
- ✅ Action: Upgrade Supabase to Pro ($25/mo)
- ✅ Benefit: More storage, increased transfer limits

**Trigger #3: 10GB+/month data transfer**
- ✅ Action: Already covered by Supabase Pro
- ✅ Benefit: Unlimited transfer

**Trigger #4: 1M+ API calls/month**
- ✅ Action: Already handled by free tier
- ✅ Note: Supabase has unlimited API requests

### Optimization Strategies
- **Images**: Use next/image for automatic optimization
- **Caching**: Add TanStack Query (Phase 2) for client-side caching
- **Database**: Add indexes on frequently queried columns
- **Code Splitting**: Already automatic with Next.js

---

## Backup & Recovery

### Database Backups
- **Frequency**: Automatic daily backups (Supabase free tier)
- **Retention**: 7 days retention (free tier)
- **Upgrade**: 30 days retention with Supabase Pro
- **Manual Backup**: Can export SQL dump from Supabase dashboard

### Recovery Process
1. Go to Supabase dashboard → Backups
2. Select backup to restore
3. Click "Restore" (confirms data loss after restoration)
4. Wait for restoration (usually <1 hour)
5. Verify data integrity

### Code Backups
- **Primary**: GitHub repository (distributed backup)
- **Additional**: Consider GitHub-to-GitLab mirror (optional)
- **Disaster Recovery**: Code can be re-deployed in minutes from Git history

### Recovery Time Objectives (RTO/RPO)
- **Code**: <15 minutes (re-deploy from git)
- **Database**: <1 hour (restore from backup)
- **Full Application**: <2 hours (worst case)

---

## Security Checklist

### Authentication & Authorization
- [ ] Supabase Auth enabled (email/password)
- [ ] JWT tokens configured
- [ ] Protected routes middleware in place
- [ ] Session management (auto-logout after 7 days inactive)

### Data Protection
- [ ] Row-Level Security (RLS) policies enforced on all tables
- [ ] Family-level data isolation working correctly
- [ ] No personal data logged in application logs

### API Security
- [ ] All API endpoints validate input with Zod
- [ ] CORS configured for Supabase
- [ ] Rate limiting configured (optional: implement in Phase 2)
- [ ] HTTPS enforced (automatic via Vercel)

### Secrets Management
- [ ] Service role key stored in Vercel dashboard only
- [ ] No secrets in `.env` or committed to git
- [ ] API keys rotated annually
- [ ] Secrets not logged or displayed

### Code Security
- [ ] No SQL injection possible (Supabase client handles)
- [ ] No XSS vulnerabilities (React sanitization built-in)
- [ ] Input sanitization via Zod validation
- [ ] Dependencies scanned via `npm audit`

### Infrastructure
- [ ] HTTPS enforced (Vercel automatic)
- [ ] DDoS protection via Vercel
- [ ] Automated backups enabled
- [ ] Error logging and monitoring enabled

---

## DevOps Workflow

### Daily Development
```bash
# Start development
npm run dev

# Make changes, test locally
# Commit and push
git add .
git commit -m "Add task creation form"
git push origin feature/task-creation

# Create PR on GitHub
# Wait for Vercel preview deployment
# Test preview environment
# Request review
```

### Before Production Deployment
- [ ] All tests passing
- [ ] Lighthouse score >90
- [ ] No console errors
- [ ] No TypeScript type errors
- [ ] Environment variables set in Vercel dashboard
- [ ] Database migrations tested

### Emergency Rollback
```bash
# If production deployment causes critical issue:
1. Go to Vercel dashboard → Deployments
2. Find last stable deployment
3. Click "Redeploy" next to it
4. Wait for rollback to complete (1-2 minutes)
5. Verify fix in production
```

---

## Cost Summary

### MVP 1.0 (Months 1-6)
| Service | Free Tier | Usage | Cost |
|---------|-----------|-------|------|
| Vercel | 1M invocations | ~100K/month | $0 |
| Supabase | 500MB storage | ~50MB | $0 |
| GitHub | Unlimited | 1 repo | $0 |
| **Total Monthly** | - | - | **$0** |

### Growth Phase (Months 6-12)
If user growth requires upgrades:
| Service | Tier | Justification | Cost |
|---------|------|---------------|------|
| Vercel | Pro | >100 concurrent users | $20/mo |
| Supabase | Pro | >5GB data | $25/mo |
| GitHub | Free | Still sufficient | $0 |
| **Total Monthly** | - | - | **$45/mo** |

---

## Next Steps

1. ✅ Create Supabase project (Phase 0.2)
2. ✅ Setup Vercel project (Sprint 3.2)
3. ✅ Configure GitHub Actions (CI/CD)
4. ✅ Setup monitoring (Speed Insights, Analytics)
5. ⏳ Enable RLS policies (Sprint 0.2)
6. ⏳ Configure environment variables
7. ⏳ First deployment (Sprint 3.2)

---

## References

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Actions](https://github.com/features/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
