# Chromecast Integration Setup Guide

This document provides complete instructions for setting up and using Chromecast functionality in the Kids Chores Tracker application.

## Overview

The Chromecast integration allows families to display a rotating dashboard on their TV, showing each child's tasks and achievements in a TV-optimized, read-only format that automatically cycles between family members.

## Features

- **Auto-Rotating Dashboard**: Cycles through each child's view every 10 seconds (configurable)
- **TV-Optimized Layout**: Large text, high contrast, designed for viewing from a distance
- **Real-Time Updates**: Dashboard updates automatically when tasks are completed
- **Child Profiles**: Shows each child's name, photo, age group, and current date
- **Today's Tasks**: Displays all pending tasks with images and point values
- **Today's Achievements**: Shows completed tasks with ratings and timestamps
- **No Interaction Required**: Fully automatic, read-only display

## Prerequisites

1. **Hardware**:
   - Chromecast device (any generation) or Chromecast Built-in TV
   - TV with HDMI input (for standalone Chromecast)
   - WiFi network

2. **Software**:
   - Google Chrome browser (recommended for best compatibility)
   - Kids Chores Tracker application deployed and accessible via HTTPS

3. **Network**:
   - Chromecast and casting device must be on the same WiFi network
   - Application must be accessible from your local network

## Initial Setup

### 1. Register Your Application with Google Cast

To use Google Cast API, you need to register your application:

1. Go to the [Google Cast SDK Developer Console](https://cast.google.com/publish)
2. Sign in with your Google account
3. Click "Add New Application"
4. Select "Custom Receiver" as the application type
5. Enter your application details:
   - **Name**: Kids Chores Tracker
   - **Description**: Family chore tracking dashboard
   - **Category**: Productivity
   - **Receiver Application URL**: `https://yourdomain.com/cast/receiver`
   - **Guest Mode**: Optional (allows casting without WiFi setup)

6. Save and publish your receiver application
7. Copy the **Application ID** (e.g., `CC1AD845`)

### 2. Configure the Application

Update the Cast Button component with your Application ID:

```typescript
// In src/components/cast/CastButton.tsx
// Replace this line:
const CAST_APP_ID = 'CC1AD845' // Default media receiver

// With your actual App ID:
const CAST_APP_ID = 'YOUR_APP_ID_HERE' // Your registered app ID
```

### 3. Add Cast SDK to Your Application

Add the Google Cast SDK script to your application's root layout:

```typescript
// In src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Cast SDK */}
        <script
          src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
          defer
        ></script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 4. Deploy the Application

The Cast receiver must be accessible via HTTPS:

1. Deploy your application to a hosting service (Vercel, Netlify, etc.)
2. Ensure HTTPS is enabled
3. Verify the receiver page loads at `/cast/receiver`
4. Update the Application ID in the Cast SDK Developer Console if the URL changed

## Usage

### For Families

1. **Open the Application**:
   - Navigate to Settings > Chromecast Settings
   - Or use the Cast button in the main navigation (if added)

2. **Connect to Chromecast**:
   - Ensure your Chromecast is powered on and connected to WiFi
   - Click the "Cast" button
   - Select your Chromecast device from the popup

3. **View on TV**:
   - The TV will display the rotating dashboard
   - Each child's view appears for 10 seconds (default)
   - Updates happen automatically when tasks are completed

4. **Disconnect**:
   - Click the "Cast" button again
   - Or turn off your Chromecast device

### Configuration Options

Available in Settings > Chromecast Settings:

- **Rotation Interval**: 5-60 seconds between children (default: 10)
- **Show Completed Tasks**: Display today's achievements (default: ON)
- **Auto-start on Connect**: Begin rotation immediately (default: OFF)

## Architecture

### Components

1. **CastButton** (`src/components/cast/CastButton.tsx`):
   - Sender application component
   - Handles device discovery and connection
   - Manages cast session lifecycle

2. **Receiver Page** (`src/app/cast/receiver/page.tsx`):
   - Receiver application (displays on TV)
   - Auto-rotating dashboard
   - Real-time Supabase subscriptions for updates

3. **Settings Page** (`src/app/settings/cast/page.tsx`):
   - Configuration interface
   - Setup instructions
   - Connection testing

### Data Flow

```
User Device (Sender)        Chromecast (Receiver)        Supabase Database
      |                              |                             |
      | 1. Request session           |                             |
      |----------------------------->|                             |
      |                              |                             |
      | 2. Load receiver URL         |                             |
      |----------------------------->|                             |
      |                              |                             |
      |                              | 3. Fetch family data        |
      |                              |<----------------------------|
      |                              |                             |
      |                              | 4. Subscribe to updates     |
      |                              |<----------------------------|
      |                              |                             |
      |                              | 5. Auto-rotate children     |
      |                              | (every 10 seconds)          |
      |                              |                             |
      | User completes task          |                             |
      |------------------------------------------------------------->|
      |                              |                             |
      |                              | 6. Real-time update         |
      |                              |<----------------------------|
      |                              | 7. Refresh display          |
```

### Security Considerations

1. **Authentication**: Receiver page uses Supabase auth to verify user access
2. **Data Privacy**: Only displays data for authenticated user's family
3. **Read-Only**: TV dashboard is entirely read-only (no input possible)
4. **Network**: Cast requires same WiFi network (local network only)

## Troubleshooting

### Cast Button Not Visible

**Problem**: The Cast button doesn't appear in the interface.

**Solutions**:
- Ensure you're using Google Chrome browser
- Check that the Cast SDK script is loaded (check browser console)
- Verify the Cast framework loaded: `window.chrome.cast.isAvailable`
- Try refreshing the page

### No Devices Found

**Problem**: Chromecast device doesn't appear in the device list.

**Solutions**:
- Verify Chromecast is powered on and connected to WiFi
- Ensure casting device and Chromecast are on the same network
- Check your router's firewall settings (allow mDNS/Bonjour)
- Try restarting your Chromecast device
- Update Chrome browser to the latest version

### Connection Fails

**Problem**: Cast session fails to establish.

**Solutions**:
- Check that receiver URL is accessible via HTTPS
- Verify Application ID matches in Cast Console and code
- Ensure receiver application is published in Cast Console
- Check browser console for specific error messages
- Try power cycling your Chromecast device

### Display Issues

**Problem**: Dashboard doesn't display correctly on TV.

**Solutions**:
- Verify TV input is set to correct HDMI port
- Check Chromecast firmware is up to date
- Ensure receiver page loads correctly in a regular browser
- Check browser console for JavaScript errors
- Try adjusting TV display settings (overscan, zoom)

### Auto-Rotation Not Working

**Problem**: Dashboard doesn't rotate between children.

**Solutions**:
- Check that multiple children exist in the family
- Verify JavaScript is enabled
- Check browser console for errors
- Reload the receiver page
- Verify rotation interval setting is not too high

### Updates Not Appearing

**Problem**: Completed tasks don't show up immediately.

**Solutions**:
- Check Supabase connection status
- Verify real-time subscriptions are active
- Check network connectivity
- Look for errors in browser console
- Try disconnecting and reconnecting

## Development

### Testing Locally

1. **Local Development**:
   ```bash
   npm run dev
   ```

2. **Use HTTPS for Local Testing**:
   - Install `mkcert` for local HTTPS
   - Or use `ngrok` to create HTTPS tunnel:
     ```bash
     ngrok http 3000
     ```

3. **Update Cast SDK Console**:
   - Add ngrok URL as receiver URL
   - Test with temporary Application ID

### Browser Compatibility

| Browser | Sender Support | Receiver Support |
|---------|---------------|------------------|
| Chrome | ✅ Full | ✅ Full |
| Edge | ✅ Full | ✅ Full |
| Firefox | ⚠️ Limited | ✅ Full |
| Safari | ❌ No | ✅ Full |

**Note**: For best experience, use Google Chrome for casting.

## Advanced Configuration

### Custom Styling

Modify the receiver page styles in `src/app/cast/receiver/page.tsx`:

```typescript
// Change background gradient
className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700"

// Adjust text sizes for different TV sizes
className="text-6xl" // Increase/decrease as needed
```

### Custom Rotation Logic

Modify rotation interval dynamically:

```typescript
// In receiver page, adjust interval
const interval = setInterval(() => {
  setCurrentChildIndex((prev) => (prev + 1) % children.length)
}, rotationInterval * 1000) // Use settings value
```

### Additional Data Display

Add more information to the TV dashboard by modifying the receiver page:

- Weekly progress charts
- Family leaderboard
- Upcoming tasks
- Reward status
- Weather/calendar integration

## Resources

- [Google Cast Developer Documentation](https://developers.google.com/cast)
- [Cast SDK Reference](https://developers.google.com/cast/docs/reference)
- [Cast UX Guidelines](https://developers.google.com/cast/docs/ux_guidelines)
- [Receiver App Development](https://developers.google.com/cast/docs/web_receiver)
- [Cast SDK Developer Console](https://cast.google.com/publish)

## Support

For issues or questions:

1. Check the Troubleshooting section above
2. Review browser console for error messages
3. Verify all prerequisites are met
4. Check Google Cast SDK documentation
5. Open an issue in the project repository

## Future Enhancements

Potential improvements for future versions:

- [ ] Multiple dashboard themes/skins
- [ ] Voice control integration
- [ ] Customizable widgets
- [ ] Multi-language support
- [ ] Ambient mode when idle
- [ ] Weekly/monthly summary views
- [ ] Integration with smart home devices
- [ ] Custom animations and transitions
