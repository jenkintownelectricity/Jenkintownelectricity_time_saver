'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { MobileMenu } from './mobile-menu'

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
}

export function MainLayout({ children, className }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { loadSettings } = useAppStore()

  useEffect(() => {
    // Load settings when the layout mounts
    loadSettings()
  }, [loadSettings])

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex">
        <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      </aside>

      {/* Mobile Menu */}
      <MobileMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Page Content */}
        <main className={cn('flex-1 overflow-y-auto', className)}>
          <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-card">
          <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-center text-sm text-muted-foreground md:text-left">
                &copy; {new Date().getFullYear()} AppIo.AI. All rights reserved.
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <a
                  href="/privacy"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="hover:text-foreground transition-colors"
                >
                  Terms of Service
                </a>
                <a
                  href="/support"
                  className="hover:text-foreground transition-colors"
                >
                  Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
