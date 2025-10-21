import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { logger } from '@/lib/logger'

export function SignUpPage() {
  const { user, signUp } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Redirect to dashboard if already logged in
  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    logger.info('SignUpPage', 'Form submitted', {
      email,
      firstName,
      lastName,
    })

    // Validate passwords match
    if (password !== confirmPassword) {
      logger.warn('SignUpPage', 'Validation failed: Passwords do not match')
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 8) {
      logger.warn('SignUpPage', 'Validation failed: Password too short', {
        passwordLength: password.length,
      })
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    logger.debug('SignUpPage', 'Validation passed, calling signUp', {
      email,
      metadata: { first_name: firstName, last_name: lastName },
    })

    try {
      await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
      })
      logger.info('SignUpPage', 'Sign up successful - showing success message')
      setSuccess(true)
      setLoading(false) // Safe to reset here as we're showing success message
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up'
      logger.error('SignUpPage', 'Sign up failed', err, {
        email,
        errorMessage,
      })

      // Provide more detailed error messages based on common Supabase errors
      let userFriendlyError = errorMessage

      if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
        userFriendlyError = 'This email is already registered. Try signing in instead.'
      } else if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
        userFriendlyError = 'Invalid email format. Please check your email address.'
      } else if (errorMessage.includes('password')) {
        userFriendlyError = 'Password does not meet requirements. Please try a different password.'
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        userFriendlyError = 'Network error. Please check your internet connection and try again.'
      } else if (errorMessage.includes('Database error')) {
        userFriendlyError = 'Database error saving new user. This may be a temporary issue - please try again or contact support.'
      }

      setError(userFriendlyError)
      setLoading(false) // Only reset loading on error
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent you a confirmation email. Please check your inbox and click the
              confirmation link to complete your registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button className="w-full">Back to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Admin Account</CardTitle>
          <CardDescription>Sign up to access the Chotter admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
