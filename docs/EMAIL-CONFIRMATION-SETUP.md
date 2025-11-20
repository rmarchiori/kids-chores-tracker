# Email Confirmation Setup Guide

This document explains how email confirmations work in the Kids Chores Tracker application and how to configure them for production deployment.

## How It Works

When a user registers for an account, Supabase sends them a confirmation email with a link to verify their email address. This link must redirect back to your application to complete the verification process.

### Flow

1. **User registers** → Submits registration form
2. **Supabase sends email** → Contains confirmation link
3. **User clicks link** → Redirects to `/auth/callback`
4. **Callback processes** → Exchanges code for session
5. **User redirected** → Sent to dashboard (logged in)

## Configuration

### Automatic URL Detection

The application automatically detects the correct redirect URL based on where it's running:

- **Development**: `http://localhost:3000/auth/callback`
- **Production**: `https://your-domain.com/auth/callback`

This is done using `window.location.origin` in the registration code, so **no manual configuration is required**!

### Supabase Dashboard Configuration (Optional)

While the application handles redirects automatically, you may want to configure allowed redirect URLs in Supabase for additional security:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your production URL to **Redirect URLs**:
   ```
   https://your-production-domain.com/auth/callback
   http://localhost:3000/auth/callback
   ```

### Vercel Deployment

When deploying to Vercel, the redirect URLs work automatically because:

1. `window.location.origin` returns your Vercel domain
2. The callback route at `/auth/callback` is deployed with your app
3. Supabase processes the confirmation and exchanges the code for a session

**No additional environment variables needed!**

## Testing

### Development
1. Register a new account at `http://localhost:3000/auth/register`
2. Check your email for the confirmation link
3. Click the link - should redirect to `http://localhost:3000/auth/callback`
4. You'll be redirected to the dashboard, now logged in

### Production
1. Register a new account at `https://your-app.vercel.app/auth/register`
2. Check your email for the confirmation link
3. Click the link - should redirect to `https://your-app.vercel.app/auth/callback`
4. You'll be redirected to the dashboard, now logged in

## Troubleshooting

### Email link redirects to localhost instead of production

**Old Issue (Now Fixed)**: Previous versions didn't specify a redirect URL, so Supabase would use the last URL you registered from (often localhost during development).

**Solution**: The latest code automatically uses the correct production URL. Update to the latest version and new registrations will work correctly.

### Email confirmation link doesn't work

1. **Check the link hasn't expired**: Email confirmation links expire after 24 hours
2. **Verify Supabase is configured**: Ensure email templates are enabled in Supabase
3. **Check redirect URLs**: Make sure your production URL is in Supabase's allowed redirect URLs
4. **Look for errors**: Check the browser console and server logs for error messages

### Users can't log in after confirming email

1. **Email may not be confirmed**: Have them click the confirmation link again
2. **Check Supabase Users table**: Verify the user's `email_confirmed_at` field is set
3. **Password might be wrong**: Have them use the password reset flow

## Related Files

- `/src/app/auth/callback/route.ts` - Handles email confirmation callbacks
- `/src/app/auth/register/page.tsx` - Registration form with emailRedirectTo
- `/src/app/auth/reset-password/page.tsx` - Password reset (also uses callbacks)

## Additional Notes

### Environment Variables

While `NEXT_PUBLIC_APP_URL` exists in `.env.example`, it's **not required** for email confirmations to work. The application automatically detects the correct URL at runtime.

You may still want to set it for other purposes (like generating absolute URLs in emails or notifications), but it's optional for basic functionality.

### Security

The callback route (`/auth/callback`) validates the confirmation code with Supabase before creating a session. This prevents unauthorized access and ensures only valid email confirmations are processed.
