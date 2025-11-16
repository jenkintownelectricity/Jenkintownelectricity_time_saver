'use client'

import { usePathname } from 'next/navigation'
import { MainLayout } from './main-layout'

interface LayoutWrapperProps {
  children: React.ReactNode
}

// Routes that should NOT use the main layout (auth pages, etc.)
const noLayoutRoutes = ['/login', '/signup', '/forgot-password', '/reset-password']

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()

  // Check if current route should skip the main layout
  const shouldSkipLayout = noLayoutRoutes.some((route) => pathname.startsWith(route))

  if (shouldSkipLayout) {
    return <>{children}</>
  }

  return <MainLayout>{children}</MainLayout>
}
