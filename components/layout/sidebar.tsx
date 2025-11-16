'use client'

import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  requiresFeature?: string
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
    requiresFeature: 'vapiCallsEnabled',
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
        requiresFeature: 'estimatesEnabled',
      },
      {
        title: 'Work Orders',
        href: '/jobs/work-orders',
        icon: Wrench,
        requiresFeature: 'workOrdersEnabled',
      },
      {
        title: 'Invoices',
        href: '/jobs/invoices',
        icon: Receipt,
        requiresFeature: 'invoicesEnabled',
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
    requiresFeature: 'teamManagementEnabled',
  },
  {
    title: 'Company',
    href: '/company',
    icon: Building2,
    requiresFeature: 'companyManagementEnabled',
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
        requiresFeature: 'voiceAssistantEnabled',
      },
      {
        title: 'Photo Analysis',
        href: '/tools/photo',
        icon: Camera,
        requiresFeature: 'photoAnalysisEnabled',
      },
      {
        title: 'NEC Lookup',
        href: '/tools/nec',
        icon: BookOpen,
        requiresFeature: 'necLookupEnabled',
      },
    ],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

interface SidebarProps {
  className?: string
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

export function Sidebar({ className, collapsed = false, onCollapse }: SidebarProps) {
  const pathname = usePathname()
  const { features, userAccount } = useAppStore()
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

  const shouldShowItem = (item: NavItem): boolean => {
    if (!item.requiresFeature) return true
    return features[item.requiresFeature as keyof typeof features] ?? true
  }

  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items.filter(shouldShowItem).map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(shouldShowItem)
        }
      }
      return item
    })
  }

  const filteredNavItems = filterNavItems(navItems)

  const getUserInitials = () => {
    if (!userAccount) return 'U'
    return userAccount.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className={cn(
        'flex h-screen flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">AI</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">AppIo.AI</span>
              <span className="text-xs text-muted-foreground">Construction AI</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
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
                    className={cn(
                      'w-full justify-start',
                      collapsed && 'justify-center px-2'
                    )}
                    onClick={() => toggleExpanded(item.title)}
                  >
                    <item.icon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        {item.badge && (
                          <Badge variant={item.badgeVariant} className="ml-2 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="ml-auto h-4 w-4" />
                        ) : (
                          <ChevronRight className="ml-auto h-4 w-4" />
                        )}
                      </>
                    )}
                  </Button>
                ) : (
                  <Link href={item.href}>
                    <Button
                      variant={isItemActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start',
                        collapsed && 'justify-center px-2'
                      )}
                      aria-label={item.title}
                    >
                      <item.icon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.title}</span>
                          {item.badge && (
                            <Badge variant={item.badgeVariant} className="ml-2 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Button>
                  </Link>
                )}

                {/* Children */}
                {hasChildren && isExpanded && !collapsed && (
                  <div className="ml-4 mt-1 space-y-1 border-l pl-2">
                    {item.children?.map((child) => {
                      const isChildActive = isActive(child.href)
                      return (
                        <Link key={child.href} href={child.href}>
                          <Button
                            variant={isChildActive ? 'secondary' : 'ghost'}
                            size="sm"
                            className="w-full justify-start"
                          >
                            <child.icon className="mr-2 h-3 w-3" />
                            <span className="text-xs">{child.title}</span>
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

      {/* User Profile */}
      <div className="border-t p-4">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={userAccount?.email ? `https://avatar.vercel.sh/${userAccount.email}` : undefined} />
            <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
          </Avatar>
          {!collapsed && userAccount && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{userAccount.name}</p>
              <p className="truncate text-xs text-muted-foreground">{userAccount.jobTitle}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
