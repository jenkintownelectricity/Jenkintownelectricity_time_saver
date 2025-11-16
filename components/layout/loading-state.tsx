'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'page'
  text?: string
  className?: string
}

export function LoadingState({ variant = 'spinner', text, className }: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-4', className)}>
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (variant === 'page') {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[400px]" />
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Default: spinner
  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center',
        className
      )}
    >
      <Spinner className="mb-4" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}
