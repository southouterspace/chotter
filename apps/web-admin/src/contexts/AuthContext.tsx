import { createContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export interface SignUpMetadata {
  first_name: string
  last_name: string
}

export interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata: SignUpMetadata) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    logger.debug('AuthProvider', 'Initializing - fetching session')
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logger.error('AuthProvider', 'Failed to get initial session', error)
      } else {
        logger.info('AuthProvider', 'Initial session loaded', {
          hasSession: !!session,
          userId: session?.user?.id,
        })
      }
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      logger.info('AuthProvider', 'Auth state changed', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
      })
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    logger.info('AuthContext.signIn', 'Attempting sign in', { email })

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      logger.error('AuthContext.signIn', 'Sign in failed', error, { email })
      throw error
    }

    logger.info('AuthContext.signIn', 'Sign in successful', {
      userId: data.user?.id,
      email: data.user?.email,
    })
  }

  const signUp = async (email: string, password: string, metadata: SignUpMetadata) => {
    logger.info('AuthContext.signUp', 'Attempting sign up', {
      email,
      metadata,
    })

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })

    if (error) {
      logger.error('AuthContext.signUp', 'Supabase auth.signUp failed', error, {
        email,
        metadata,
        errorCode: (error as { code?: string }).code,
        errorStatus: (error as { status?: number }).status,
      })
      throw error
    }

    // Log success - but user might not be confirmed yet
    logger.info('AuthContext.signUp', 'Supabase auth.signUp completed', {
      userId: data.user?.id,
      email: data.user?.email,
      identities: data.user?.identities?.length,
      confirmed: data.user?.confirmed_at ? true : false,
      sessionCreated: !!data.session,
    })

    // If user was created but session is null, email confirmation is required
    if (data.user && !data.session) {
      logger.info('AuthContext.signUp', 'Email confirmation required', {
        userId: data.user.id,
      })
    }

    // Check if database trigger may have failed
    // (user created in auth but person record might have failed)
    if (data.user) {
      logger.debug('AuthContext.signUp', 'Checking if person record was created', {
        userId: data.user.id,
      })
      // Note: We can't directly query persons table here due to RLS,
      // but trigger errors would be thrown by Supabase
    }
  }

  const signOut = async () => {
    logger.info('AuthContext.signOut', 'Attempting sign out')

    const { error } = await supabase.auth.signOut()

    if (error) {
      logger.error('AuthContext.signOut', 'Sign out failed', error)
      throw error
    }

    logger.info('AuthContext.signOut', 'Sign out successful')
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
