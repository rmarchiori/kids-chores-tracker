'use client'

import { useEffect, useState, useRef } from 'react'

/**
 * CastButton Component
 *
 * Provides Chromecast casting functionality for the Kids Chores Tracker app.
 * Displays a cast button that allows users to cast the dashboard to a TV.
 *
 * Setup Requirements:
 * 1. Add Cast SDK script to app layout:
 *    <script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"></script>
 * 2. Register your app with Google Cast Console to get an APP_ID
 * 3. Configure receiver app URL
 *
 * @see https://developers.google.com/cast/docs/web_sender
 */

// Chromecast types (augmenting window object)
declare global {
  interface Window {
    __onGCastApiAvailable: (available: boolean, reason?: string) => void
  }
}

// Cast API types (used via window.chrome)
type CastAPI = {
  cast: {
    initialize: (
      apiConfig: any,
      successCallback: () => void,
      errorCallback: (error: any) => void
    ) => void
    SessionRequest: new (appId: string) => any
    ApiConfig: new (
      sessionRequest: any,
      sessionListener: (session: any) => void,
      receiverListener: (availability: string) => void,
      autoJoinPolicy: string,
      defaultActionPolicy: string
    ) => any
    AutoJoinPolicy: {
      ORIGIN_SCOPED: string
    }
    DefaultActionPolicy: {
      CREATE_SESSION: string
    }
    requestSession: (
      successCallback: (session: any) => void,
      errorCallback: (error: any) => void
    ) => void
    isAvailable: boolean
  }
}

interface CastButtonProps {
  /** URL to load on the receiver (TV) */
  receiverUrl?: string
  /** Custom CSS classes */
  className?: string
  /** Show connection status text */
  showStatus?: boolean
}

// TODO: Replace with your actual Cast Receiver App ID from Google Cast Console
// Register at: https://cast.google.com/publish
const CAST_APP_ID = 'CC1AD845' // Default media receiver - replace with your app ID

export function CastButton({
  receiverUrl = '/cast/receiver',
  className = '',
  showStatus = true
}: CastButtonProps) {
  const [castAvailable, setCastAvailable] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [deviceName, setDeviceName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const sessionRef = useRef<any>(null)

  useEffect(() => {
    // Initialize Cast API when available
    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable) {
        initializeCastApi()
      } else {
        setCastAvailable(false)
        setError('Cast API not available')
      }
    }

    // Check if Cast API is already loaded
    if ((window.chrome as any)?.cast?.isAvailable) {
      initializeCastApi()
    }

    return () => {
      // Cleanup
      if (sessionRef.current) {
        sessionRef.current.stop(() => {}, () => {})
      }
    }
  }, [])

  const initializeCastApi = () => {
    try {
      const chrome = window.chrome as any as CastAPI
      const sessionRequest = new chrome.cast.SessionRequest(CAST_APP_ID)

      const apiConfig = new chrome.cast.ApiConfig(
        sessionRequest,
        sessionListener,
        receiverListener,
        chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        chrome.cast.DefaultActionPolicy.CREATE_SESSION
      )

      chrome.cast.initialize(
        apiConfig,
        () => {
          console.log('Cast API initialized successfully')
          setCastAvailable(true)
          setError(null)
        },
        (error) => {
          console.error('Cast API initialization error:', error)
          setError('Failed to initialize Cast API')
        }
      )
    } catch (err) {
      console.error('Error initializing Cast API:', err)
      setError(err instanceof Error ? err.message : 'Initialization failed')
    }
  }

  const sessionListener = (session: any) => {
    console.log('Cast session established:', session)
    sessionRef.current = session
    setIsConnected(true)
    setDeviceName(session.receiver.friendlyName)

    // Load the receiver URL on the TV
    loadReceiverApp(session)

    // Add session update listener
    session.addUpdateListener((isAlive: boolean) => {
      if (!isAlive) {
        setIsConnected(false)
        setDeviceName(null)
        sessionRef.current = null
      }
    })
  }

  const receiverListener = (availability: string) => {
    console.log('Receiver availability:', availability)
    if (availability === 'available') {
      setCastAvailable(true)
    } else {
      setCastAvailable(false)
    }
  }

  const loadReceiverApp = (session: any) => {
    try {
      const mediaInfo = {
        contentId: window.location.origin + receiverUrl,
        contentType: 'text/html',
        metadata: {
          type: 0, // Generic
          metadataType: 0,
          title: 'Kids Chores Tracker',
          subtitle: 'Family Dashboard'
        }
      }

      const request = {
        media: mediaInfo,
        autoplay: true
      }

      session.loadMedia(
        request,
        () => console.log('Media loaded successfully'),
        (error: any) => console.error('Load media error:', error)
      )
    } catch (err) {
      console.error('Error loading receiver app:', err)
    }
  }

  const handleCastClick = () => {
    if (!castAvailable) {
      setError('No Cast devices available')
      return
    }

    if (isConnected && sessionRef.current) {
      // Disconnect from current session
      sessionRef.current.stop(
        () => {
          console.log('Session stopped successfully')
          setIsConnected(false)
          setDeviceName(null)
          sessionRef.current = null
        },
        (error: any) => {
          console.error('Error stopping session:', error)
        }
      )
    } else {
      // Request new session
      const chrome = window.chrome as any as CastAPI
      chrome.cast.requestSession(
        (session) => {
          console.log('Session created:', session)
          sessionListener(session)
        },
        (error) => {
          console.error('Error creating session:', error)
          if (error.code === 'cancel') {
            setError(null) // User cancelled, not an error
          } else {
            setError('Failed to connect to Cast device')
          }
        }
      )
    }
  }

  // Don't render if Cast is not available
  if (!castAvailable) {
    return null
  }

  return (
    <div className={`cast-button-container ${className}`}>
      <button
        onClick={handleCastClick}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${isConnected
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
        aria-label={isConnected ? 'Disconnect from Cast device' : 'Connect to Cast device'}
      >
        {/* Cast Icon */}
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
        </svg>

        {showStatus && (
          <span className="text-sm">
            {isConnected ? `Cast to ${deviceName}` : 'Cast'}
          </span>
        )}
      </button>

      {error && showStatus && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}
