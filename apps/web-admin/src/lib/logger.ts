/**
 * Structured logger for debugging Supabase authentication issues
 *
 * Usage:
 *   logger.info('SignUpPage', 'Form submitted', { email: 'user@example.com' })
 *   logger.error('AuthContext', 'Signup failed', error, { email: 'user@example.com' })
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

interface LogEntry {
  timestamp: string
  level: LogLevel
  component: string
  message: string
  data?: unknown
  error?: unknown
}

class Logger {
  private enabled: boolean
  private logHistory: LogEntry[] = []
  private maxHistorySize = 100

  constructor() {
    // Enable logging in development or if explicitly enabled
    this.enabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true'
  }

  private log(level: LogLevel, component: string, message: string, error?: unknown, data?: unknown) {
    if (!this.enabled) return

    const timestamp = new Date().toISOString().split('T')[1].slice(0, 12) // HH:MM:SS.mmm
    const entry: LogEntry = {
      timestamp,
      level,
      component,
      message,
    }

    if (data !== undefined) {
      entry.data = this.sanitize(data)
    }

    if (error !== undefined) {
      entry.error = this.formatError(error)
    }

    // Store in history
    this.logHistory.push(entry)
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift()
    }

    // Console output with colors
    const styles = this.getStyles(level)
    const prefix = `[${level}] ${timestamp} - ${component}:`

    console.groupCollapsed(`%c${prefix} ${message}`, styles)
    if (data) {
      console.log('Data:', this.sanitize(data))
    }
    if (error) {
      console.error('Error:', this.formatError(error))
    }
    console.groupEnd()

    // Store critical errors in localStorage for debugging
    if (level === 'ERROR') {
      this.storeError(entry)
    }
  }

  debug(component: string, message: string, data?: unknown) {
    this.log('DEBUG', component, message, undefined, data)
  }

  info(component: string, message: string, data?: unknown) {
    this.log('INFO', component, message, undefined, data)
  }

  warn(component: string, message: string, data?: unknown) {
    this.log('WARN', component, message, undefined, data)
  }

  error(component: string, message: string, error?: unknown, data?: unknown) {
    this.log('ERROR', component, message, error, data)
  }

  /**
   * Sanitize data to remove sensitive information like passwords
   */
  private sanitize(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return data
    }

    const sanitized = { ...data as Record<string, unknown> }
    const sensitiveKeys = ['password', 'confirmPassword', 'token', 'apiKey', 'secret']

    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]'
      }
    }

    return sanitized
  }

  /**
   * Format error objects for better readability
   */
  private formatError(error: unknown): unknown {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3), // First 3 lines of stack trace
        ...(error as Error & { code?: string; status?: number }).code && {
          code: (error as Error & { code: string }).code
        },
        ...(error as Error & { status?: number }).status && {
          status: (error as Error & { status: number }).status
        },
      }
    }

    // Handle Supabase AuthError
    if (typeof error === 'object' && error !== null) {
      const authError = error as {
        message?: string
        status?: number
        code?: string
        name?: string
      }

      return {
        message: authError.message,
        status: authError.status,
        code: authError.code,
        name: authError.name,
        raw: error,
      }
    }

    return error
  }

  /**
   * Get console styles for different log levels
   */
  private getStyles(level: LogLevel): string {
    const styles = {
      DEBUG: 'color: #6366f1; font-weight: bold',
      INFO: 'color: #10b981; font-weight: bold',
      WARN: 'color: #f59e0b; font-weight: bold',
      ERROR: 'color: #ef4444; font-weight: bold',
    }
    return styles[level]
  }

  /**
   * Store error in localStorage for debugging
   */
  private storeError(entry: LogEntry) {
    try {
      const stored = localStorage.getItem('auth_errors') || '[]'
      const errors = JSON.parse(stored) as LogEntry[]
      errors.push(entry)

      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.shift()
      }

      localStorage.setItem('auth_errors', JSON.stringify(errors))
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  /**
   * Get stored error history
   */
  getErrorHistory(): LogEntry[] {
    try {
      const stored = localStorage.getItem('auth_errors') || '[]'
      return JSON.parse(stored) as LogEntry[]
    } catch {
      return []
    }
  }

  /**
   * Get recent log history
   */
  getLogHistory(): LogEntry[] {
    return [...this.logHistory]
  }

  /**
   * Clear all stored errors
   */
  clearErrors() {
    try {
      localStorage.removeItem('auth_errors')
      this.logHistory = []
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Export logs as text for bug reports
   */
  exportLogs(): string {
    const logs = this.getLogHistory()
    return logs
      .map(entry => {
        let output = `[${entry.level}] ${entry.timestamp} - ${entry.component}: ${entry.message}`
        if (entry.data) {
          output += `\n  Data: ${JSON.stringify(entry.data, null, 2)}`
        }
        if (entry.error) {
          output += `\n  Error: ${JSON.stringify(entry.error, null, 2)}`
        }
        return output
      })
      .join('\n\n')
  }
}

// Export singleton instance
export const logger = new Logger()

// Add global access for debugging in console
if (typeof window !== 'undefined') {
  ;(window as Window & { __logger?: Logger }).__logger = logger
}
