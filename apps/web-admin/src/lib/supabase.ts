import { createClient } from '@supabase/supabase-js'
import { logger } from './logger'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Log environment configuration
logger.debug('Supabase Client', 'Initializing Supabase client', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl || 'undefined',
})

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('Supabase Client', 'Missing environment variables', undefined, {
    VITE_SUPABASE_URL: supabaseUrl || 'undefined',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? '[SET]' : 'undefined',
  })
  console.error('Missing Supabase environment variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel project settings.')
  console.error('Current values:', {
    VITE_SUPABASE_URL: supabaseUrl || 'undefined',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? '[SET]' : 'undefined'
  })
}

// Create client with fallback values to prevent app crash
// The app will show proper error messages instead of blank screen
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      // Log auth state changes
      debug: import.meta.env.DEV,
    },
  }
)

// Add global error handler for Supabase operations
// This will catch network errors and service outages
if (typeof window !== 'undefined') {
  // Monitor fetch errors (network issues, CORS, etc.)
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    const url = args[0]?.toString() || ''

    // Only log Supabase requests
    if (url.includes('supabase.co') || url.includes(supabaseUrl || '')) {
      logger.debug('Supabase Client', 'Fetch request', {
        url: url.substring(0, 100), // Truncate long URLs
        method: (args[1] as RequestInit | undefined)?.method || 'GET',
      })
    }

    try {
      const response = await originalFetch(...args)

      // Log errors from Supabase API
      if (url.includes('supabase.co') || url.includes(supabaseUrl || '')) {
        if (!response.ok) {
          const clonedResponse = response.clone()
          try {
            const errorBody = await clonedResponse.text()
            logger.error('Supabase Client', 'HTTP error from Supabase API', undefined, {
              status: response.status,
              statusText: response.statusText,
              url: url.substring(0, 100),
              errorBody: errorBody.substring(0, 500),
            })
          } catch {
            logger.error('Supabase Client', 'HTTP error from Supabase API', undefined, {
              status: response.status,
              statusText: response.statusText,
              url: url.substring(0, 100),
            })
          }
        }
      }

      return response
    } catch (error) {
      // Network error or fetch failed
      if (url.includes('supabase.co') || url.includes(supabaseUrl || '')) {
        logger.error('Supabase Client', 'Network error - Supabase request failed', error, {
          url: url.substring(0, 100),
          possibleCauses: [
            'Network connection lost',
            'Supabase service outage',
            'CORS configuration issue',
            'DNS resolution failure',
          ],
        })
      }
      throw error
    }
  }

  logger.info('Supabase Client', 'Global error monitoring enabled')
}

// Check Supabase connection status on initialization
if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
  supabase.auth.getSession().then(({ error }) => {
    if (error) {
      logger.error('Supabase Client', 'Initial connection test failed', error)
    } else {
      logger.info('Supabase Client', 'Connection test successful')
    }
  }).catch((error) => {
    logger.error('Supabase Client', 'Connection test error', error, {
      message: 'Unable to connect to Supabase. Check network and service status.',
    })
  })
}
