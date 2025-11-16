'use client'

/**
 * Availability Manager Component
 * Manage business hours and team member schedules
 */

import React, { useState } from 'react'
import { useAppointmentStore } from '@/lib/stores/appointment-store'
import { BusinessHours } from '@/lib/types/appointments'
import { Clock, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'

export function AvailabilityManager() {
  const { businessHours, setBusinessHours, updateBusinessHours } = useAppointmentStore()
  const [editedHours, setEditedHours] = useState<BusinessHours[]>(businessHours)

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ]

  const handleSave = () => {
    setBusinessHours(editedHours)
    alert('Business hours updated successfully!')
  }

  const handleToggleDay = (dayOfWeek: number) => {
    setEditedHours(
      editedHours.map((hours) =>
        hours.dayOfWeek === dayOfWeek
          ? { ...hours, isOpen: !hours.isOpen }
          : hours
      )
    )
  }

  const handleTimeChange = (dayOfWeek: number, field: 'openTime' | 'closeTime', value: string) => {
    setEditedHours(
      editedHours.map((hours) =>
        hours.dayOfWeek === dayOfWeek
          ? { ...hours, [field]: value }
          : hours
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Hours</h2>
          <p className="text-gray-500">Set your availability for appointments</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="space-y-3">
        {daysOfWeek.map(({ value, label }) => {
          const dayHours = editedHours.find((h) => h.dayOfWeek === value)
          if (!dayHours) return null

          return (
            <Card key={value} className="p-4">
              <div className="flex items-center gap-4">
                {/* Day Toggle */}
                <div className="flex items-center gap-3 w-48">
                  <Switch
                    checked={dayHours.isOpen}
                    onCheckedChange={() => handleToggleDay(value)}
                  />
                  <Label className="font-semibold">{label}</Label>
                </div>

                {/* Time Inputs */}
                {dayHours.isOpen ? (
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <Input
                        type="time"
                        value={dayHours.openTime}
                        onChange={(e) => handleTimeChange(value, 'openTime', e.target.value)}
                        className="w-32"
                      />
                    </div>
                    <span className="text-gray-500">to</span>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <Input
                        type="time"
                        value={dayHours.closeTime}
                        onChange={(e) => handleTimeChange(value, 'closeTime', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 flex-1">Closed</span>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const weekdayHours: BusinessHours[] = [
                { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '17:00' },
                { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '17:00' },
                { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '17:00' },
                { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '17:00' },
                { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '17:00' },
                { dayOfWeek: 6, isOpen: false, openTime: '09:00', closeTime: '13:00' },
                { dayOfWeek: 0, isOpen: false, openTime: '00:00', closeTime: '00:00' }
              ]
              setEditedHours(weekdayHours)
            }}
          >
            Monday - Friday (8 AM - 5 PM)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const allDayHours: BusinessHours[] = daysOfWeek.map((day) => ({
                dayOfWeek: day.value,
                isOpen: true,
                openTime: '09:00',
                closeTime: '17:00'
              }))
              setEditedHours(allDayHours)
            }}
          >
            Open Every Day (9 AM - 5 PM)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const closedHours: BusinessHours[] = daysOfWeek.map((day) => ({
                dayOfWeek: day.value,
                isOpen: false,
                openTime: '00:00',
                closeTime: '00:00'
              }))
              setEditedHours(closedHours)
            }}
          >
            Close All Days
          </Button>
        </div>
      </Card>

      {/* Team Member Schedules Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">Team Member Schedules</h3>
        <p className="text-gray-500 mb-4">
          Individual team member schedules coming soon. For now, all team members follow the
          business hours above.
        </p>
        <Button variant="outline" disabled>
          Manage Team Schedules
        </Button>
      </Card>
    </div>
  )
}
