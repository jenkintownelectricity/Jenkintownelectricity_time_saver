'use client'

import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Building2,
  ChevronDown,
  Check,
} from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface HeaderProps {
  className?: string
  onMenuClick?: () => void
}

export function Header({ className, onMenuClick }: HeaderProps) {
  const { userAccount, companies, currentCompanyCode, switchCompany } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications] = useState([
    { id: 1, title: 'New work call available', time: '5m ago', unread: true },
    { id: 2, title: 'Invoice #1234 paid', time: '1h ago', unread: true },
    { id: 3, title: 'New customer message', time: '2h ago', unread: false },
  ])

  const currentCompany = companies.find((c) => c.code === currentCompanyCode)
  const unreadCount = notifications.filter((n) => n.unread).length

  const getUserInitials = () => {
    if (!userAccount) return 'U'
    return userAccount.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = () => {
    // Clear user session
    if (typeof window !== 'undefined') {
      localStorage.removeItem('appio-settings')
      window.location.href = '/login'
    }
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Company Switcher */}
      {companies.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="hidden gap-2 md:flex"
              aria-label="Switch company"
            >
              <Building2 className="h-4 w-4" />
              <span className="max-w-[150px] truncate">
                {currentCompany?.name || 'Select Company'}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[250px]">
            <DropdownMenuLabel>Companies</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {companies.map((company) => (
                <DropdownMenuItem
                  key={company.code}
                  onClick={() => switchCompany(company.code)}
                  className="cursor-pointer"
                >
                  <div className="flex w-full items-center justify-between">
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-xs text-muted-foreground">{company.code}</div>
                    </div>
                    {currentCompanyCode === company.code && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Search Bar */}
      <div className="flex-1 md:max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers, jobs, invoices..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[350px]">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="cursor-pointer p-4"
                >
                  <div className="flex w-full items-start gap-3">
                    <div
                      className={cn(
                        'mt-1 h-2 w-2 rounded-full',
                        notification.unread ? 'bg-primary' : 'bg-transparent'
                      )}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer justify-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User menu">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={userAccount?.email ? `https://avatar.vercel.sh/${userAccount.email}` : undefined}
                />
                <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[250px]">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {userAccount?.name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userAccount?.email || 'user@example.com'}
                </p>
                {userAccount?.memberNumber && (
                  <p className="text-xs leading-none text-muted-foreground">
                    Member #{userAccount.memberNumber}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
