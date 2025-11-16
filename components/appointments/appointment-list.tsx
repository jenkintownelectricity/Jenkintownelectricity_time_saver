'use client'

/**
 * Appointment List Component
 * List view of appointments with filtering and sorting
 */

import React, { useState, useMemo } from 'react'
import { useAppointmentStore } from '@/lib/stores/appointment-store'
import { AppointmentStatus } from '@/lib/types/appointments'
import { format } from 'date-fns'
import { Search, Calendar, MapPin, User, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function AppointmentList() {
  const {
    appointments,
    setSelectedAppointment,
    searchAppointments,
    getAppointmentsByStatus,
    confirmAppointment,
    cancelAppointment,
    completeAppointment
  } = useAppointmentStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'customer' | 'status'>('date')

  // Filter and search appointments
  const filteredAppointments = useMemo(() => {
    let result = appointments

    // Apply status filter
    if (statusFilter !== 'all') {
      result = getAppointmentsByStatus(statusFilter)
    }

    // Apply search
    if (searchQuery) {
      result = searchAppointments(searchQuery)
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
        case 'customer':
          return (a.customerName || '').localeCompare(b.customerName || '')
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    return result
  }, [appointments, statusFilter, searchQuery, sortBy, getAppointmentsByStatus, searchAppointments])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Appointments</h2>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AppointmentStatus | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={AppointmentStatus.SCHEDULED}>Scheduled</SelectItem>
              <SelectItem value={AppointmentStatus.CONFIRMED}>Confirmed</SelectItem>
              <SelectItem value={AppointmentStatus.IN_PROGRESS}>In Progress</SelectItem>
              <SelectItem value={AppointmentStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={AppointmentStatus.CANCELLED}>Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Appointment List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No appointments found</p>
          </Card>
        ) : (
          filteredAppointments.map((apt) => (
            <Card
              key={apt.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">{apt.title}</p>
                      <p className="text-sm text-gray-500">{apt.serviceType}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(apt.scheduledDate), 'MMM dd, yyyy')} at {apt.scheduledTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{apt.customerName || 'No customer'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">
                        {apt.location.street}, {apt.location.city}
                      </span>
                    </div>
                    {apt.assignedToName && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Assigned: {apt.assignedToName}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {apt.status === AppointmentStatus.SCHEDULED && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => confirmAppointment(apt.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelAppointment(apt.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    )}
                    {apt.status === AppointmentStatus.CONFIRMED && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => completeAppointment(apt.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedAppointment(apt)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge variant={getStatusVariant(apt.status)}>
                    {apt.status}
                  </Badge>
                  <Badge variant="outline">{apt.priority}</Badge>
                  {apt.estimatedCost && (
                    <span className="text-sm font-semibold text-green-600">
                      ${apt.estimatedCost.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function getStatusVariant(status: AppointmentStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case AppointmentStatus.SCHEDULED:
      return 'secondary'
    case AppointmentStatus.CONFIRMED:
      return 'default'
    case AppointmentStatus.IN_PROGRESS:
      return 'default'
    case AppointmentStatus.COMPLETED:
      return 'outline'
    case AppointmentStatus.CANCELLED:
      return 'destructive'
    default:
      return 'secondary'
  }
}
