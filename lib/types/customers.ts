// Customer Management Types

export interface Customer {
  id: string
  companyId: string
  name: string
  email: string
  phone: string
  company?: string
  type: 'residential' | 'commercial'
  addresses: Address[]
  contacts: Contact[]
  notes: string
  tags: string[]
  status: 'active' | 'inactive' | 'potential'
  source: 'vapi' | 'referral' | 'website' | 'manual' | 'other'
  communicationHistory: Communication[]
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  id: string
  type: 'billing' | 'service' | 'mailing' | 'other'
  street: string
  street2?: string
  city: string
  state: string
  zip: string
  isPrimary: boolean
}

export interface Contact {
  id: string
  name: string
  role: string
  email: string
  phone: string
  isPrimary: boolean
}

export interface Communication {
  id: string
  type: 'call' | 'email' | 'text' | 'meeting' | 'note'
  subject: string
  notes: string
  date: Date
  createdBy: string
}

export interface CustomerFilters {
  search?: string
  types?: ('residential' | 'commercial')[]
  statuses?: ('active' | 'inactive' | 'potential')[]
  sources?: ('vapi' | 'referral' | 'website' | 'manual' | 'other')[]
  tags?: string[]
  createdAfter?: Date
  createdBefore?: Date
}

export type CustomerSortField = 'name' | 'company' | 'createdAt' | 'updatedAt' | 'lastContact'
export type SortDirection = 'asc' | 'desc'

export interface CustomerSort {
  field: CustomerSortField
  direction: SortDirection
}

export interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  inactiveCustomers: number
  potentialCustomers: number
  residentialCount: number
  commercialCount: number
  sourceBreakdown: Record<string, number>
  recentAdditions: Customer[]
  tagBreakdown: Record<string, number>
}

// Helper functions
export function getCustomerInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function getLastCommunication(customer: Customer): Communication | null {
  if (!customer.communicationHistory || customer.communicationHistory.length === 0) {
    return null
  }
  return customer.communicationHistory.reduce((latest, current) => {
    return new Date(current.date) > new Date(latest.date) ? current : latest
  })
}

export function getPrimaryAddress(customer: Customer): Address | null {
  return customer.addresses.find((addr) => addr.isPrimary) || customer.addresses[0] || null
}

export function getPrimaryContact(customer: Customer): Contact | null {
  return customer.contacts.find((contact) => contact.isPrimary) || customer.contacts[0] || null
}

export function formatAddress(address: Address): string {
  const parts = [
    address.street,
    address.street2,
    `${address.city}, ${address.state} ${address.zip}`
  ].filter(Boolean)
  return parts.join(', ')
}

export const COMMUNICATION_TYPE_LABELS: Record<Communication['type'], string> = {
  call: 'Phone Call',
  email: 'Email',
  text: 'Text Message',
  meeting: 'Meeting',
  note: 'Note'
}

export const CUSTOMER_STATUS_LABELS: Record<Customer['status'], string> = {
  active: 'Active',
  inactive: 'Inactive',
  potential: 'Potential'
}

export const CUSTOMER_TYPE_LABELS: Record<Customer['type'], string> = {
  residential: 'Residential',
  commercial: 'Commercial'
}

export const CUSTOMER_SOURCE_LABELS: Record<Customer['source'], string> = {
  vapi: 'VAPI Call',
  referral: 'Referral',
  website: 'Website',
  manual: 'Manual Entry',
  other: 'Other'
}

export const ADDRESS_TYPE_LABELS: Record<Address['type'], string> = {
  billing: 'Billing',
  service: 'Service',
  mailing: 'Mailing',
  other: 'Other'
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}

export function isValidZip(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip)
}
