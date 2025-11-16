'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface ErrorStateProps {
  title?: string
  message?: string
  error?: Error
  showRetry?: boolean
  onRetry?: () => void
  showHome?: boolean
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  error,
  showRetry = true,
  onRetry,
  showHome = true,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center p-8',
        className
      )}
    >
      <Alert variant="destructive" className="max-w-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>{message}</p>
          {error && process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium">
                Technical Details
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-destructive/10 p-4 text-xs">
                {error.stack || error.message}
              </pre>
            </details>
          )}
        </AlertDescription>
      </Alert>

      <div className="mt-6 flex gap-3">
        {showRetry && onRetry && (
          <Button onClick={onRetry} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
        {showHome && (
          <Link href="/">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
