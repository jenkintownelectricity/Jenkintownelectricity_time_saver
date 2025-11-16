// Team Member Management Types

export interface TimeSlot {
  id: string
  start: string // 24-hour format "09:00"
  end: string // 24-hour format "17:00"
}

export interface Availability {
  monday: TimeSlot[]
  tuesday: TimeSlot[]
  wednesday: TimeSlot[]
  thursday: TimeSlot[]
  friday: TimeSlot[]
  saturday: TimeSlot[]
  sunday: TimeSlot[]
}

export interface TeamMember {
  id: string
  companyId: string
  name: string
  email: string
  phone: string
  role: 'owner' | 'manager' | 'electrician' | 'apprentice' | 'admin'
  type: 'employee' | 'contractor_1099' | 'subcontractor'
  hourlyRate?: number
  isActive: boolean
  canScheduleAppointments: boolean
  canViewEstimates: boolean
  canApproveEstimates: boolean
  canViewInvoices: boolean
  skills: string[]
  certifications: string[]
  availability: Availability
  notes: string
  hireDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface TeamMemberFilters {
  search?: string
  roles?: TeamMember['role'][]
  types?: TeamMember['type'][]
  isActive?: boolean
  skills?: string[]
  certifications?: string[]
}

export type TeamMemberSortField = 'name' | 'role' | 'type' | 'hireDate' | 'createdAt'
export type SortDirection = 'asc' | 'desc'

export interface TeamMemberSort {
  field: TeamMemberSortField
  direction: SortDirection
}

export interface TeamMemberStats {
  totalMembers: number
  activeMembers: number
  inactiveMembers: number
  employeeCount: number
  contractorCount: number
  subcontractorCount: number
  roleBreakdown: Record<TeamMember['role'], number>
  averageHourlyRate: number
}

// Role and Type Labels
export const ROLE_LABELS: Record<TeamMember['role'], string> = {
  owner: 'Owner',
  manager: 'Manager',
  electrician: 'Electrician',
  apprentice: 'Apprentice',
  admin: 'Admin',
}

export const TYPE_LABELS: Record<TeamMember['type'], string> = {
  employee: 'Employee (W-2)',
  contractor_1099: '1099 Contractor',
  subcontractor: 'Subcontractor',
}

// Days of the week for availability
export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export type DayOfWeek = typeof DAYS_OF_WEEK[number]

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

// Helper functions
export function getDefaultAvailability(): Availability {
  const defaultWeekdaySlot: TimeSlot = {
    id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    start: '09:00',
    end: '17:00',
  }

  return {
    monday: [{ ...defaultWeekdaySlot, id: `mon_${defaultWeekdaySlot.id}` }],
    tuesday: [{ ...defaultWeekdaySlot, id: `tue_${defaultWeekdaySlot.id}` }],
    wednesday: [{ ...defaultWeekdaySlot, id: `wed_${defaultWeekdaySlot.id}` }],
    thursday: [{ ...defaultWeekdaySlot, id: `thu_${defaultWeekdaySlot.id}` }],
    friday: [{ ...defaultWeekdaySlot, id: `fri_${defaultWeekdaySlot.id}` }],
    saturday: [],
    sunday: [],
  }
}

export function isAvailableOnDay(member: TeamMember, day: DayOfWeek): boolean {
  return member.availability[day].length > 0
}

export function getTotalWeeklyHours(availability: Availability): number {
  let total = 0
  DAYS_OF_WEEK.forEach((day) => {
    availability[day].forEach((slot) => {
      const [startHour, startMin] = slot.start.split(':').map(Number)
      const [endHour, endMin] = slot.end.split(':').map(Number)
      const hours = endHour - startHour + (endMin - startMin) / 60
      total += hours
    })
  })
  return total
}

export function formatTimeSlot(slot: TimeSlot): string {
  return `${slot.start} - ${slot.end}`
}

export function getAvailableDays(member: TeamMember): string[] {
  return DAYS_OF_WEEK.filter((day) => member.availability[day].length > 0).map(
    (day) => DAY_LABELS[day]
  )
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}

export function canPerformAction(
  member: TeamMember,
  action: 'schedule' | 'viewEstimate' | 'approveEstimate' | 'viewInvoice'
): boolean {
  if (!member.isActive) return false

  switch (action) {
    case 'schedule':
      return member.canScheduleAppointments
    case 'viewEstimate':
      return member.canViewEstimates
    case 'approveEstimate':
      return member.canApproveEstimates
    case 'viewInvoice':
      return member.canViewInvoices
    default:
      return false
  }
}
