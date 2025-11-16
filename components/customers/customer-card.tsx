'use client'

import { Customer, getCustomerInitials, formatPhoneNumber, getLastCommunication, getPrimaryAddress } from '@/lib/types/customers'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
  MoreVertical,
  FileText,
  Calendar,
  MessageSquare
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'

interface CustomerCardProps {
  customer: Customer
  onView?: (customer: Customer) => void
  onEdit?: (customer: Customer) => void
  onDelete?: (customer: Customer) => void
  onCreateEstimate?: (customer: Customer) => void
  onScheduleAppointment?: (customer: Customer) => void
  onCall?: (customer: Customer) => void
  onEmail?: (customer: Customer) => void
}

export function CustomerCard({
  customer,
  onView,
  onEdit,
  onDelete,
  onCreateEstimate,
  onScheduleAppointment,
  onCall,
  onEmail,
}: CustomerCardProps) {
  const lastCommunication = getLastCommunication(customer)
  const primaryAddress = getPrimaryAddress(customer)

  const statusColors = {
    active: 'bg-green-500/10 text-green-700 border-green-500/20',
    inactive: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
    potential: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  }

  const typeColors = {
    residential: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    commercial: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onView?.(customer)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getCustomerInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{customer.name}</h3>
              {customer.company && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                  <Building2 className="h-3 w-3" />
                  {customer.company}
                </p>
              )}
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={statusColors[customer.status]}>
                  {customer.status}
                </Badge>
                <Badge variant="outline" className={typeColors[customer.type]}>
                  {customer.type}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView?.(customer) }}>
                <User className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(customer) }}>
                <FileText className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCreateEstimate?.(customer) }}>
                <FileText className="h-4 w-4 mr-2" />
                Create Estimate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onScheduleAppointment?.(customer) }}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCall?.(customer) }} className="text-red-600">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEmail?.(customer) }}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete?.(customer) }}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{formatPhoneNumber(customer.phone)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{customer.email}</span>
          </div>
          {primaryAddress && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-muted-foreground truncate">
                {primaryAddress.city}, {primaryAddress.state}
              </span>
            </div>
          )}
        </div>

        {customer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {customer.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {customer.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{customer.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {lastCommunication && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3 pt-3 border-t">
            <MessageSquare className="h-3 w-3" />
            <span>Last contact: {formatDistanceToNow(lastCommunication.date, { addSuffix: true })}</span>
          </div>
        )}

        <div className="flex gap-2 mt-3 pt-3 border-t">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); onCall?.(customer) }}
          >
            <Phone className="h-3 w-3 mr-1" />
            Call
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); onEmail?.(customer) }}
          >
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
