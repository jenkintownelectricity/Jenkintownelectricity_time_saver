'use client'

import { useState } from 'react'
import { Availability, TimeSlot, DAYS_OF_WEEK, DAY_LABELS, DayOfWeek } from '@/lib/types/team'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Copy } from 'lucide-react'

interface AvailabilitySchedulerProps {
  availability: Availability
  onChange: (availability: Availability) => void
  readOnly?: boolean
}

export function AvailabilityScheduler({
  availability,
  onChange,
  readOnly = false,
}: AvailabilitySchedulerProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday')

  const handleAddTimeSlot = (day: DayOfWeek) => {
    const newSlot: TimeSlot = {
      id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      start: '09:00',
      end: '17:00',
    }

    onChange({
      ...availability,
      [day]: [...availability[day], newSlot],
    })
  }

  const handleUpdateTimeSlot = (day: DayOfWeek, slotId: string, updates: Partial<TimeSlot>) => {
    onChange({
      ...availability,
      [day]: availability[day].map((slot) =>
        slot.id === slotId ? { ...slot, ...updates } : slot
      ),
    })
  }

  const handleDeleteTimeSlot = (day: DayOfWeek, slotId: string) => {
    onChange({
      ...availability,
      [day]: availability[day].filter((slot) => slot.id !== slotId),
    })
  }

  const handleCopyToAllDays = (sourceDay: DayOfWeek) => {
    const sourceSlots = availability[sourceDay]
    const newAvailability: Availability = {
      monday: sourceSlots.map((s) => ({ ...s, id: `mon_${Date.now()}_${Math.random()}` })),
      tuesday: sourceSlots.map((s) => ({ ...s, id: `tue_${Date.now()}_${Math.random()}` })),
      wednesday: sourceSlots.map((s) => ({ ...s, id: `wed_${Date.now()}_${Math.random()}` })),
      thursday: sourceSlots.map((s) => ({ ...s, id: `thu_${Date.now()}_${Math.random()}` })),
      friday: sourceSlots.map((s) => ({ ...s, id: `fri_${Date.now()}_${Math.random()}` })),
      saturday: sourceSlots.map((s) => ({ ...s, id: `sat_${Date.now()}_${Math.random()}` })),
      sunday: sourceSlots.map((s) => ({ ...s, id: `sun_${Date.now()}_${Math.random()}` })),
    }
    onChange(newAvailability)
  }

  const handleClearDay = (day: DayOfWeek) => {
    onChange({
      ...availability,
      [day]: [],
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Availability</CardTitle>
          <CardDescription>
            Set the hours this team member is available to work each day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Day Tabs */}
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const hasSlots = availability[day].length > 0
                const isSelected = selectedDay === day

                return (
                  <Button
                    key={day}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDay(day)}
                    className="relative"
                  >
                    {DAY_LABELS[day]}
                    {hasSlots && (
                      <Badge
                        variant="secondary"
                        className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                      >
                        {availability[day].length}
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </div>

            {/* Selected Day Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{DAY_LABELS[selectedDay]}</CardTitle>
                  {!readOnly && (
                    <div className="flex gap-2">
                      {availability[selectedDay].length > 0 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToAllDays(selectedDay)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy to All Days
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleClearDay(selectedDay)}
                          >
                            Clear
                          </Button>
                        </>
                      )}
                      <Button size="sm" onClick={() => handleAddTimeSlot(selectedDay)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Time Slot
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {availability[selectedDay].length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No availability set for this day
                    {!readOnly && (
                      <div className="mt-4">
                        <Button size="sm" onClick={() => handleAddTimeSlot(selectedDay)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Time Slot
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availability[selectedDay].map((slot, index) => (
                      <div
                        key={slot.id}
                        className="flex items-center gap-4 p-3 border rounded-lg"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`start-${slot.id}`}>Start Time</Label>
                            <Input
                              id={`start-${slot.id}`}
                              type="time"
                              value={slot.start}
                              onChange={(e) =>
                                handleUpdateTimeSlot(selectedDay, slot.id, {
                                  start: e.target.value,
                                })
                              }
                              disabled={readOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`end-${slot.id}`}>End Time</Label>
                            <Input
                              id={`end-${slot.id}`}
                              type="time"
                              value={slot.end}
                              onChange={(e) =>
                                handleUpdateTimeSlot(selectedDay, slot.id, {
                                  end: e.target.value,
                                })
                              }
                              disabled={readOnly}
                            />
                          </div>
                        </div>
                        {!readOnly && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTimeSlot(selectedDay, slot.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Weekly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const slots = availability[day]
                    const totalHours = slots.reduce((sum, slot) => {
                      const [startHour, startMin] = slot.start.split(':').map(Number)
                      const [endHour, endMin] = slot.end.split(':').map(Number)
                      const hours = endHour - startHour + (endMin - startMin) / 60
                      return sum + hours
                    }, 0)

                    return (
                      <div key={day} className="text-sm">
                        <div className="font-medium">{DAY_LABELS[day].substring(0, 3)}</div>
                        <div className="text-muted-foreground">
                          {slots.length === 0 ? (
                            'Unavailable'
                          ) : (
                            <span>
                              {totalHours.toFixed(1)} hr{totalHours !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
