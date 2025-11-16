/**
 * Type definitions for Appointment Management
 */

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled'
}

export enum AppointmentSource {
  VAPI = 'vapi',
  MANUAL = 'manual',
  CUSTOMER_PORTAL = 'customer_portal',
  WEBSITE = 'website',
  REFERRAL = 'referral'
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface Appointment {
  id: string
  userId: string
  companyId: string
  customerId: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  jobId?: string
  title: string
  description: string
  serviceType: string
  location: Address
  scheduledDate: Date
  scheduledTime: string
  duration: number // minutes
  assignedTo?: string // team member ID
  assignedToName?: string
  status: AppointmentStatus
  reminderSent: boolean
  reminderDate?: Date
  source: AppointmentSource
  vapiCallId?: string
  notes: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedCost?: number
  actualCost?: number
  color?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface AppointmentCreateInput {
  customerId: string
  title: string
  description?: string
  serviceType: string
  location: Address
  scheduledDate: Date
  scheduledTime: string
  duration?: number
  assignedTo?: string
  notes?: string
  source?: AppointmentSource
  vapiCallId?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  estimatedCost?: number
}

export interface AppointmentUpdateInput {
  title?: string
  description?: string
  serviceType?: string
  location?: Address
  scheduledDate?: Date
  scheduledTime?: string
  duration?: number
  assignedTo?: string
  status?: AppointmentStatus
  notes?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  estimatedCost?: number
  actualCost?: number
  reminderSent?: boolean
  reminderDate?: Date
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  resource?: Appointment
}

export interface TimeSlot {
  date: Date
  startTime: string
  endTime: string
  available: boolean
  appointmentId?: string
}

export interface BusinessHours {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  isOpen: boolean
  openTime: string
  closeTime: string
}

export interface TeamMemberSchedule {
  teamMemberId: string
  teamMemberName: string
  date: Date
  availableSlots: TimeSlot[]
  blockedSlots: TimeSlot[]
}

export interface AppointmentReminder {
  appointmentId: string
  type: 'email' | 'sms' | 'push'
  scheduledFor: Date
  sent: boolean
  sentAt?: Date
}
