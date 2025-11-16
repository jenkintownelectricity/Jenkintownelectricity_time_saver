'use client'

import { cn } from '@/lib/utils'
import { Home, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  className?: string
  items?: BreadcrumbItem[]
}

export function Breadcrumbs({ className, items }: BreadcrumbsProps) {
  const pathname = usePathname()

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname)

  if (breadcrumbItems.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}
    >
      <Link
        href="/"
        className="flex items-center hover:text-foreground transition-colors"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbItems.map((item, index) => (
        <Fragment key={item.href}>
          <ChevronRight className="h-4 w-4" />
          {index === breadcrumbItems.length - 1 ? (
            <span className="font-medium text-foreground" aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  )
}

function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  // Remove leading and trailing slashes, split by '/'
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return []

  const breadcrumbs: BreadcrumbItem[] = []
  let path = ''

  for (const segment of segments) {
    path += `/${segment}`
    breadcrumbs.push({
      label: formatSegment(segment),
      href: path,
    })
  }

  return breadcrumbs
}

function formatSegment(segment: string): string {
  // Convert kebab-case or snake_case to Title Case
  return segment
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
