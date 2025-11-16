'use client'

/**
 * Appointment Calendar Component
 * Full calendar view with month/week/day views
 */

import React, { useState } from 'react'
import { useAppointmentStore } from '@/lib/stores/appointment-store'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppointmentStatus } from '@/lib/types/appointments'

type ViewMode = 'month' | 'week' | 'day'

export function AppointmentCalendar() {
  const { appointments, getAppointmentsByDate, setSelectedAppointment } = useAppointmentStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  const handlePrevious = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNext = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Get day of week for first day (0 = Sunday)
    const firstDayOfWeek = monthStart.getDay()

    // Add padding days from previous month
    const paddingDays = Array(firstDayOfWeek).fill(null)

    return (
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold p-2 text-sm">
            {day}
          </div>
        ))}

        {/* Padding days */}
        {paddingDays.map((_, index) => (
          <div key={`padding-${index}`} className="min-h-24 p-2 bg-gray-50 rounded" />
        ))}

        {/* Calendar days */}
        {days.map((day) => {
          const dayAppointments = getAppointmentsByDate(day)
          const isToday = isSameDay(day, new Date())

          return (
            <Card
              key={day.toISOString()}
              className={`min-h-24 p-2 cursor-pointer hover:shadow-md transition-shadow ${
                isToday ? 'border-blue-500 border-2' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : ''}`}>
                  {format(day, 'd')}
                </span>
                {dayAppointments.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {dayAppointments.length}
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getStatusColor(apt.status)}`}
                    onClick={() => setSelectedAppointment(apt)}
                  >
                    <div className="font-medium truncate">{apt.scheduledTime}</div>
                    <div className="truncate">{apt.title}</div>
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          {/* View Mode Selector */}
          <div className="flex gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              disabled
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              disabled
            >
              Day
            </Button>
          </div>

          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      <Card className="p-4">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && <p className="text-center py-8">Week view coming soon</p>}
        {viewMode === 'day' && <p className="text-center py-8">Day view coming soon</p>}
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-semibold">Status:</span>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${getStatusColor(AppointmentStatus.SCHEDULED)}`} />
            <span className="text-sm">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${getStatusColor(AppointmentStatus.CONFIRMED)}`} />
            <span className="text-sm">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${getStatusColor(AppointmentStatus.IN_PROGRESS)}`} />
            <span className="text-sm">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${getStatusColor(AppointmentStatus.COMPLETED)}`} />
            <span className="text-sm">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${getStatusColor(AppointmentStatus.CANCELLED)}`} />
            <span className="text-sm">Cancelled</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

function getStatusColor(status: AppointmentStatus): string {
  switch (status) {
    case AppointmentStatus.SCHEDULED:
      return 'bg-blue-100 text-blue-800'
    case AppointmentStatus.CONFIRMED:
      return 'bg-green-100 text-green-800'
    case AppointmentStatus.IN_PROGRESS:
      return 'bg-yellow-100 text-yellow-800'
    case AppointmentStatus.COMPLETED:
      return 'bg-gray-100 text-gray-800'
    case AppointmentStatus.CANCELLED:
      return 'bg-red-100 text-red-800'
    case AppointmentStatus.NO_SHOW:
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
