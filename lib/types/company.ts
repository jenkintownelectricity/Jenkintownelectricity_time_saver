// Company Profile and Multi-Company Types

import { Address } from './customers'

export interface CompanySettings {
  // Document settings
  includeLogoOnDocuments: boolean
  defaultPaymentTerms: string // e.g., "Net 30", "Due on receipt"
  defaultWarranty: string

  // Tax settings
  defaultTaxRate: number
  includeTaxInEstimates: boolean

  // Scheduling settings
  allowOnlineBooking: boolean
  requireDepositForAppointments: boolean
  defaultDepositAmount: number
  defaultDepositPercentage: number

  // Notification settings
  sendEstimateNotifications: boolean
  sendInvoiceNotifications: boolean
  sendAppointmentReminders: boolean
  reminderHoursBefore: number
}

export interface CompanyBranding {
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

export interface DocumentCounters {
  estimateCounter: number
  workOrderCounter: number
  invoiceCounter: number
}

export interface CompanyProfile {
  id: string
  name: string
  dba?: string // Doing Business As
  type: 'sole_proprietorship' | 'llc' | 'corporation' | 's_corp' | 'partnership'
  logo?: string
  address: Address
  phone: string
  email: string
  website?: string
  taxId: string // EIN
  licenseNumber: string
  insurancePolicyNumber: string
  insuranceExpiration: Date
  isDefault: boolean
  documentCounters: DocumentCounters
  branding: CompanyBranding
  settings: CompanySettings
  createdAt: Date
  updatedAt: Date
}

export interface CompanyFilters {
  search?: string
  types?: CompanyProfile['type'][]
  isDefault?: boolean
}

export type CompanySortField = 'name' | 'dba' | 'type' | 'createdAt'
export type SortDirection = 'asc' | 'desc'

export interface CompanySort {
  field: CompanySortField
  direction: SortDirection
}

// Type Labels
export const COMPANY_TYPE_LABELS: Record<CompanyProfile['type'], string> = {
  sole_proprietorship: 'Sole Proprietorship',
  llc: 'LLC',
  corporation: 'Corporation',
  s_corp: 'S-Corporation',
  partnership: 'Partnership',
}

// Default branding colors
export const DEFAULT_BRANDING: CompanyBranding = {
  primaryColor: '#3b82f6', // blue-500
  secondaryColor: '#64748b', // slate-500
  accentColor: '#10b981', // green-500
}

// Default settings
export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  includeLogoOnDocuments: true,
  defaultPaymentTerms: 'Due on receipt',
  defaultWarranty: '1 year on labor, manufacturer warranty on parts',
  defaultTaxRate: 0,
  includeTaxInEstimates: true,
  allowOnlineBooking: true,
  requireDepositForAppointments: false,
  defaultDepositAmount: 0,
  defaultDepositPercentage: 0,
  sendEstimateNotifications: true,
  sendInvoiceNotifications: true,
  sendAppointmentReminders: true,
  reminderHoursBefore: 24,
}

// Default document counters
export const DEFAULT_DOCUMENT_COUNTERS: DocumentCounters = {
  estimateCounter: 1000,
  workOrderCounter: 1000,
  invoiceCounter: 1000,
}

// Helper functions
export function getNextDocumentNumber(
  company: CompanyProfile,
  type: 'estimate' | 'workOrder' | 'invoice'
): string {
  const prefix = company.dba || company.name
  const shortPrefix = prefix.substring(0, 3).toUpperCase()

  let counter: number
  let typeCode: string

  switch (type) {
    case 'estimate':
      counter = company.documentCounters.estimateCounter
      typeCode = 'EST'
      break
    case 'workOrder':
      counter = company.documentCounters.workOrderCounter
      typeCode = 'WO'
      break
    case 'invoice':
      counter = company.documentCounters.invoiceCounter
      typeCode = 'INV'
      break
  }

  return `${shortPrefix}-${typeCode}-${counter.toString().padStart(6, '0')}`
}

export function incrementDocumentCounter(
  company: CompanyProfile,
  type: 'estimate' | 'workOrder' | 'invoice'
): DocumentCounters {
  const newCounters = { ...company.documentCounters }

  switch (type) {
    case 'estimate':
      newCounters.estimateCounter += 1
      break
    case 'workOrder':
      newCounters.workOrderCounter += 1
      break
    case 'invoice':
      newCounters.invoiceCounter += 1
      break
  }

  return newCounters
}

export function isInsuranceExpired(company: CompanyProfile): boolean {
  return new Date(company.insuranceExpiration) < new Date()
}

export function getDaysUntilInsuranceExpiration(company: CompanyProfile): number {
  const today = new Date()
  const expiration = new Date(company.insuranceExpiration)
  const diffTime = expiration.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function formatCompanyName(company: CompanyProfile): string {
  if (company.dba && company.dba !== company.name) {
    return `${company.name} (DBA: ${company.dba})`
  }
  return company.name
}

export function getDisplayName(company: CompanyProfile): string {
  return company.dba || company.name
}

// Validation helpers
export function isValidEIN(ein: string): boolean {
  // EIN format: XX-XXXXXXX
  const cleaned = ein.replace(/\D/g, '')
  return cleaned.length === 9
}

export function formatEIN(ein: string): string {
  const cleaned = ein.replace(/\D/g, '')
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`
  }
  return ein
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
