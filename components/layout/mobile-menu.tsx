'use client'

import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Home,
  Phone,
  Users,
  Briefcase,
  Receipt,
  FileText,
  UsersRound,
  Building2,
  Wrench,
  Settings,
  ChevronDown,
  ChevronRight,
  Mic,
  Camera,
  BookOpen,
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  children?: NavItem[]
  requiresFeature?: 'receiptsEnabled' | 'taxComplianceEnabled'
}

const navItems: NavItem[] = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
  },
  {
    title: 'Calls & Appointments',
    href: '/calls',
    icon: Phone,
    badge: 'VAPI',
    badgeVariant: 'secondary',
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    title: 'Jobs & Projects',
    href: '/jobs',
    icon: Briefcase,
    children: [
      {
        title: 'Estimates',
        href: '/jobs/estimates',
        icon: FileText,
      },
      {
        title: 'Work Orders',
        href: '/jobs/work-orders',
        icon: Wrench,
      },
      {
        title: 'Invoices',
        href: '/jobs/invoices',
        icon: Receipt,
      },
    ],
  },
  {
    title: 'Receipts & Expenses',
    href: '/receipts',
    icon: Receipt,
    requiresFeature: 'receiptsEnabled',
  },
  {
    title: 'Tax Compliance',
    href: '/tax',
    icon: FileText,
    requiresFeature: 'taxComplianceEnabled',
  },
  {
    title: 'Team',
    href: '/team',
    icon: UsersRound,
  },
  {
    title: 'Company',
    href: '/company',
    icon: Building2,
  },
  {
    title: 'Tools',
    href: '/tools',
    icon: Wrench,
    children: [
      {
        title: 'Voice Assistant',
        href: '/tools/voice',
        icon: Mic,
      },
      {
        title: 'Photo Analysis',
        href: '/tools/photo',
        icon: Camera,
      },
      {
        title: 'NEC Lookup',
        href: '/tools/nec',
        icon: BookOpen,
      },
    ],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

interface MobileMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const pathname = usePathname()
  const { features } = useAppStore()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    )
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const shouldShowItem = (item: NavItem) => {
    if (!item.requiresFeature) return true
    return features[item.requiresFeature]
  }

  const filteredNavItems = navItems.filter(shouldShowItem)

  const handleNavClick = () => {
    // Close the menu when a nav item is clicked
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">AI</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold">AppIo.AI</span>
              <span className="text-xs font-normal text-muted-foreground">Construction AI</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5rem)] px-4 py-4">
          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const isItemActive = isActive(item.href)
              const isExpanded = expandedItems.includes(item.title)
              const hasChildren = item.children && item.children.length > 0

              return (
                <div key={item.href}>
                  {hasChildren ? (
                    <Button
                      variant={isItemActive ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => toggleExpanded(item.title)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.badge && (
                        <Badge variant={item.badgeVariant} className="ml-2 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="ml-2 h-4 w-4" />
                      ) : (
                        <ChevronRight className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  ) : (
                    <Link href={item.href} onClick={handleNavClick}>
                      <Button
                        variant={isItemActive ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        <span className="flex-1 text-left">{item.title}</span>
                        {item.badge && (
                          <Badge variant={item.badgeVariant} className="ml-2 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  )}

                  {/* Children */}
                  {hasChildren && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 pl-4">
                      {item.children?.map((child) => {
                        const isChildActive = isActive(child.href)
                        return (
                          <Link key={child.href} href={child.href} onClick={handleNavClick}>
                            <Button
                              variant={isChildActive ? 'secondary' : 'ghost'}
                              size="sm"
                              className="w-full justify-start"
                            >
                              <child.icon className="mr-2 h-4 w-4" />
                              <span>{child.title}</span>
                            </Button>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
