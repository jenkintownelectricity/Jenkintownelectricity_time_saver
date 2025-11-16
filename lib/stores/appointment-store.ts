/**
 * Appointment Store - Zustand Store for Managing Appointments
 */

import { create } from 'zustand'
import {
  Appointment,
  AppointmentStatus,
  AppointmentSource,
  AppointmentCreateInput,
  AppointmentUpdateInput,
  CalendarEvent,
  TimeSlot,
  BusinessHours,
  TeamMemberSchedule,
  AppointmentReminder
} from '@/lib/types/appointments'
import { addMinutes, format, isWithinInterval, parseISO } from 'date-fns'

interface AppointmentState {
  appointments: Appointment[]
  selectedAppointment: Appointment | null
  businessHours: BusinessHours[]
  teamSchedules: TeamMemberSchedule[]
  reminders: AppointmentReminder[]
  loading: boolean
  error: string | null

  // Actions
  addAppointment: (input: AppointmentCreateInput) => Appointment
  updateAppointment: (id: string, updates: AppointmentUpdateInput) => void
  deleteAppointment: (id: string) => void
  setSelectedAppointment: (appointment: Appointment | null) => void

  // Status management
  confirmAppointment: (id: string) => void
  startAppointment: (id: string) => void
  completeAppointment: (id: string, actualCost?: number) => void
  cancelAppointment: (id: string, reason?: string) => void
  markAsNoShow: (id: string) => void
  rescheduleAppointment: (id: string, newDate: Date, newTime: string) => void

  // Calendar operations
  getCalendarEvents: () => CalendarEvent[]
  getAppointmentsByDate: (date: Date) => Appointment[]
  getAppointmentsByDateRange: (startDate: Date, endDate: Date) => Appointment[]
  getAppointmentsByMonth: (year: number, month: number) => Appointment[]

  // Filtering
  getAppointmentsByStatus: (status: AppointmentStatus) => Appointment[]
  getAppointmentsByCustomer: (customerId: string) => Appointment[]
  getAppointmentsByTeamMember: (teamMemberId: string) => Appointment[]
  getAppointmentsBySource: (source: AppointmentSource) => Appointment[]
  searchAppointments: (query: string) => Appointment[]

  // Availability checking
  checkAvailability: (date: Date, startTime: string, duration: number, teamMemberId?: string) => boolean
  getAvailableSlots: (date: Date, duration: number, teamMemberId?: string) => TimeSlot[]
  isBusinessOpen: (date: Date, time: string) => boolean

  // Business hours
  setBusinessHours: (hours: BusinessHours[]) => void
  updateBusinessHours: (dayOfWeek: number, hours: Partial<BusinessHours>) => void

  // Reminders
  scheduleReminder: (appointmentId: string, type: 'email' | 'sms' | 'push', scheduledFor: Date) => void
  markReminderSent: (appointmentId: string) => void
  getPendingReminders: () => AppointmentReminder[]

  // Statistics
  getAppointmentStats: () => {
    total: number
    scheduled: number
    confirmed: number
    completed: number
    cancelled: number
    noShows: number
    completionRate: number
  }

  // Utilities
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearAppointments: () => void
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  selectedAppointment: null,
  businessHours: [
    { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '17:00' }, // Monday
    { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '17:00' }, // Tuesday
    { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '17:00' }, // Wednesday
    { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '17:00' }, // Thursday
    { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '17:00' }, // Friday
    { dayOfWeek: 6, isOpen: false, openTime: '09:00', closeTime: '13:00' }, // Saturday
    { dayOfWeek: 0, isOpen: false, openTime: '00:00', closeTime: '00:00' }  // Sunday
  ],
  teamSchedules: [],
  reminders: [],
  loading: false,
  error: null,

  // Add new appointment
  addAppointment: (input) => {
    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      userId: '', // Will be set from context
      companyId: '', // Will be set from context
      customerId: input.customerId,
      jobId: undefined,
      title: input.title,
      description: input.description || '',
      serviceType: input.serviceType,
      location: input.location,
      scheduledDate: input.scheduledDate,
      scheduledTime: input.scheduledTime,
      duration: input.duration || 60,
      assignedTo: input.assignedTo,
      status: AppointmentStatus.SCHEDULED,
      reminderSent: false,
      source: input.source || AppointmentSource.MANUAL,
      vapiCallId: input.vapiCallId,
      notes: input.notes || '',
      priority: input.priority || 'medium',
      estimatedCost: input.estimatedCost,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    set((state) => ({
      appointments: [...state.appointments, newAppointment]
    }))

    return newAppointment
  },

  // Update appointment
  updateAppointment: (id, updates) => {
    set((state) => ({
      appointments: state.appointments.map((apt) =>
        apt.id === id ? { ...apt, ...updates, updatedAt: new Date() } : apt
      ),
      selectedAppointment: state.selectedAppointment?.id === id
        ? { ...state.selectedAppointment, ...updates, updatedAt: new Date() }
        : state.selectedAppointment
    }))
  },

  // Delete appointment
  deleteAppointment: (id) => {
    set((state) => ({
      appointments: state.appointments.filter((apt) => apt.id !== id),
      selectedAppointment: state.selectedAppointment?.id === id ? null : state.selectedAppointment
    }))
  },

  // Set selected appointment
  setSelectedAppointment: (appointment) => {
    set({ selectedAppointment: appointment })
  },

  // Confirm appointment
  confirmAppointment: (id) => {
    get().updateAppointment(id, { status: AppointmentStatus.CONFIRMED })
  },

  // Start appointment
  startAppointment: (id) => {
    get().updateAppointment(id, { status: AppointmentStatus.IN_PROGRESS })
  },

  // Complete appointment
  completeAppointment: (id, actualCost) => {
    get().updateAppointment(id, {
      status: AppointmentStatus.COMPLETED,
      actualCost
    })
  },

  // Cancel appointment
  cancelAppointment: (id, reason) => {
    get().updateAppointment(id, {
      status: AppointmentStatus.CANCELLED,
      notes: reason ? `${get().appointments.find(a => a.id === id)?.notes || ''}\nCancellation reason: ${reason}` : undefined
    })
  },

  // Mark as no-show
  markAsNoShow: (id) => {
    get().updateAppointment(id, { status: AppointmentStatus.NO_SHOW })
  },

  // Reschedule appointment
  rescheduleAppointment: (id, newDate, newTime) => {
    get().updateAppointment(id, {
      scheduledDate: newDate,
      scheduledTime: newTime,
      status: AppointmentStatus.RESCHEDULED
    })
  },

  // Get calendar events
  getCalendarEvents: () => {
    return get().appointments.map((apt) => {
      const [hours, minutes] = apt.scheduledTime.split(':').map(Number)
      const start = new Date(apt.scheduledDate)
      start.setHours(hours, minutes, 0, 0)
      const end = addMinutes(start, apt.duration)

      return {
        id: apt.id,
        title: apt.title,
        start,
        end,
        allDay: false,
        resource: apt
      }
    })
  },

  // Get appointments by date
  getAppointmentsByDate: (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return get().appointments.filter(
      (apt) => format(new Date(apt.scheduledDate), 'yyyy-MM-dd') === dateStr
    )
  },

  // Get appointments by date range
  getAppointmentsByDateRange: (startDate, endDate) => {
    return get().appointments.filter((apt) =>
      isWithinInterval(new Date(apt.scheduledDate), { start: startDate, end: endDate })
    )
  },

  // Get appointments by month
  getAppointmentsByMonth: (year, month) => {
    return get().appointments.filter((apt) => {
      const aptDate = new Date(apt.scheduledDate)
      return aptDate.getFullYear() === year && aptDate.getMonth() === month
    })
  },

  // Get appointments by status
  getAppointmentsByStatus: (status) => {
    return get().appointments.filter((apt) => apt.status === status)
  },

  // Get appointments by customer
  getAppointmentsByCustomer: (customerId) => {
    return get().appointments.filter((apt) => apt.customerId === customerId)
  },

  // Get appointments by team member
  getAppointmentsByTeamMember: (teamMemberId) => {
    return get().appointments.filter((apt) => apt.assignedTo === teamMemberId)
  },

  // Get appointments by source
  getAppointmentsBySource: (source) => {
    return get().appointments.filter((apt) => apt.source === source)
  },

  // Search appointments
  searchAppointments: (query) => {
    const lowerQuery = query.toLowerCase()
    return get().appointments.filter(
      (apt) =>
        apt.title.toLowerCase().includes(lowerQuery) ||
        apt.description.toLowerCase().includes(lowerQuery) ||
        apt.customerName?.toLowerCase().includes(lowerQuery) ||
        apt.serviceType.toLowerCase().includes(lowerQuery) ||
        apt.location.street.toLowerCase().includes(lowerQuery) ||
        apt.notes.toLowerCase().includes(lowerQuery)
    )
  },

  // Check availability
  checkAvailability: (date, startTime, duration, teamMemberId) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const [hours, minutes] = startTime.split(':').map(Number)
    const requestedStart = new Date(`${dateStr}T${startTime}:00`)
    const requestedEnd = addMinutes(requestedStart, duration)

    // Check business hours
    const dayOfWeek = date.getDay()
    const businessHour = get().businessHours.find((bh) => bh.dayOfWeek === dayOfWeek)
    if (!businessHour?.isOpen) return false

    // Check if time is within business hours
    const openTime = businessHour.openTime
    const closeTime = businessHour.closeTime
    if (startTime < openTime || format(requestedEnd, 'HH:mm') > closeTime) {
      return false
    }

    // Check for conflicts with existing appointments
    const existingAppointments = get().appointments.filter((apt) => {
      if (teamMemberId && apt.assignedTo !== teamMemberId) return false
      if (format(new Date(apt.scheduledDate), 'yyyy-MM-dd') !== dateStr) return false

      const [aptHours, aptMinutes] = apt.scheduledTime.split(':').map(Number)
      const aptStart = new Date(`${dateStr}T${apt.scheduledTime}:00`)
      const aptEnd = addMinutes(aptStart, apt.duration)

      // Check for overlap
      return (
        (requestedStart >= aptStart && requestedStart < aptEnd) ||
        (requestedEnd > aptStart && requestedEnd <= aptEnd) ||
        (requestedStart <= aptStart && requestedEnd >= aptEnd)
      )
    })

    return existingAppointments.length === 0
  },

  // Get available slots
  getAvailableSlots: (date, duration, teamMemberId) => {
    const slots: TimeSlot[] = []
    const dayOfWeek = date.getDay()
    const businessHour = get().businessHours.find((bh) => bh.dayOfWeek === dayOfWeek)

    if (!businessHour?.isOpen) return slots

    const [openHours, openMinutes] = businessHour.openTime.split(':').map(Number)
    const [closeHours, closeMinutes] = businessHour.closeTime.split(':').map(Number)

    let currentTime = new Date(date)
    currentTime.setHours(openHours, openMinutes, 0, 0)

    const endTime = new Date(date)
    endTime.setHours(closeHours, closeMinutes, 0, 0)

    // Generate 30-minute slots
    while (currentTime < endTime) {
      const slotStart = format(currentTime, 'HH:mm')
      const slotEnd = format(addMinutes(currentTime, 30), 'HH:mm')

      const isAvailable = get().checkAvailability(date, slotStart, duration, teamMemberId)

      slots.push({
        date,
        startTime: slotStart,
        endTime: slotEnd,
        available: isAvailable
      })

      currentTime = addMinutes(currentTime, 30)
    }

    return slots
  },

  // Check if business is open
  isBusinessOpen: (date, time) => {
    const dayOfWeek = date.getDay()
    const businessHour = get().businessHours.find((bh) => bh.dayOfWeek === dayOfWeek)

    if (!businessHour?.isOpen) return false

    return time >= businessHour.openTime && time <= businessHour.closeTime
  },

  // Set business hours
  setBusinessHours: (hours) => {
    set({ businessHours: hours })
  },

  // Update business hours
  updateBusinessHours: (dayOfWeek, hours) => {
    set((state) => ({
      businessHours: state.businessHours.map((bh) =>
        bh.dayOfWeek === dayOfWeek ? { ...bh, ...hours } : bh
      )
    }))
  },

  // Schedule reminder
  scheduleReminder: (appointmentId, type, scheduledFor) => {
    const reminder: AppointmentReminder = {
      appointmentId,
      type,
      scheduledFor,
      sent: false
    }

    set((state) => ({
      reminders: [...state.reminders, reminder]
    }))
  },

  // Mark reminder as sent
  markReminderSent: (appointmentId) => {
    const appointment = get().appointments.find((apt) => apt.id === appointmentId)
    if (appointment) {
      get().updateAppointment(appointmentId, {
        reminderSent: true,
        reminderDate: new Date()
      })
    }

    set((state) => ({
      reminders: state.reminders.map((reminder) =>
        reminder.appointmentId === appointmentId
          ? { ...reminder, sent: true, sentAt: new Date() }
          : reminder
      )
    }))
  },

  // Get pending reminders
  getPendingReminders: () => {
    return get().reminders.filter((reminder) => !reminder.sent)
  },

  // Get appointment statistics
  getAppointmentStats: () => {
    const appointments = get().appointments
    const total = appointments.length
    const scheduled = appointments.filter((a) => a.status === AppointmentStatus.SCHEDULED).length
    const confirmed = appointments.filter((a) => a.status === AppointmentStatus.CONFIRMED).length
    const completed = appointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length
    const cancelled = appointments.filter((a) => a.status === AppointmentStatus.CANCELLED).length
    const noShows = appointments.filter((a) => a.status === AppointmentStatus.NO_SHOW).length
    const completionRate = total > 0 ? (completed / total) * 100 : 0

    return {
      total,
      scheduled,
      confirmed,
      completed,
      cancelled,
      noShows,
      completionRate
    }
  },

  // Set loading state
  setLoading: (loading) => {
    set({ loading })
  },

  // Set error
  setError: (error) => {
    set({ error })
  },

  // Clear all appointments
  clearAppointments: () => {
    set({ appointments: [], selectedAppointment: null, reminders: [] })
  }
}))
