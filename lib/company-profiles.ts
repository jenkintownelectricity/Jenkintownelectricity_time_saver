export interface CompanyProfile {
  id: string
  name: string
  dbaName?: string // "Doing Business As" name
  legalName?: string
  logo?: string // Base64 or URL
  email: string
  phone: string
  website?: string

  // Address
  address: {
    street1: string
    street2?: string
    city: string
    state: string
    zip: string
    country: string
  }

  // Tax & Legal
  taxId?: string // EIN
  licenseNumber?: string
  licenseState?: string
  insuranceCertificate?: string

  // Branding
  primaryColor?: string
  secondaryColor?: string

  // Banking
  bankName?: string
  accountNumber?: string
  routingNumber?: string

  // Payment Methods (for Get Paid Now)
  paymentMethods?: {
    venmo?: string
    cashapp?: string
    zelle?: string
    paypal?: string
    stripe?: string
    square?: string
  }

  // Default Settings
  defaultTaxRate?: number
  defaultPaymentTerms?: string
  defaultTermsAndConditions?: string

  // Document Numbering
  numberingFormat?: {
    estimatePrefix?: string // e.g., "EST", "QUOTE", "E"
    estimateIncludeYear?: boolean
    estimateNextNumber?: number
    estimatePadding?: number // e.g., 3 for "001", 4 for "0001"

    workOrderPrefix?: string // e.g., "WO", "WORK", "W"
    workOrderIncludeYear?: boolean
    workOrderNextNumber?: number
    workOrderPadding?: number

    invoicePrefix?: string // e.g., "INV", "INVOICE", "I"
    invoiceIncludeYear?: boolean
    invoiceNextNumber?: number
    invoicePadding?: number
  }

  // Status
  isActive: boolean
  isDefault: boolean

  createdAt: number
  updatedAt: number
}

// Default company template
export const createDefaultCompanyProfile = (): Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: 'My Company',
  email: '',
  phone: '',
  address: {
    street1: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA'
  },
  isActive: true,
  isDefault: true,
  defaultTaxRate: 6,
  defaultPaymentTerms: 'Net 30',
  defaultTermsAndConditions: 'Payment is due upon completion. A 50% deposit may be required for large projects.',
  numberingFormat: {
    estimatePrefix: 'EST',
    estimateIncludeYear: true,
    estimateNextNumber: 1,
    estimatePadding: 3,

    workOrderPrefix: 'WO',
    workOrderIncludeYear: true,
    workOrderNextNumber: 1,
    workOrderPadding: 3,

    invoicePrefix: 'INV',
    invoiceIncludeYear: true,
    invoiceNextNumber: 1,
    invoicePadding: 3
  }
})

// Helper to get display name (prefers DBA if exists)
export function getCompanyDisplayName(profile: CompanyProfile): string {
  return profile.dbaName || profile.name
}

// Helper to get full legal name
export function getCompanyLegalName(profile: CompanyProfile): string {
  if (profile.dbaName && profile.legalName) {
    return `${profile.legalName} (DBA: ${profile.dbaName})`
  }
  return profile.legalName || profile.name
}

// Helper to format address
export function formatCompanyAddress(profile: CompanyProfile): string {
  const addr = profile.address
  const parts = [
    addr.street1,
    addr.street2,
    `${addr.city}, ${addr.state} ${addr.zip}`,
    addr.country !== 'USA' ? addr.country : ''
  ].filter(Boolean)

  return parts.join('\n')
}

// Helper to check if company is fully configured
export function isCompanyConfigured(profile: CompanyProfile): boolean {
  return !!(
    profile.name &&
    profile.email &&
    profile.phone &&
    profile.address.street1 &&
    profile.address.city &&
    profile.address.state &&
    profile.address.zip
  )
}

// Helper to generate next document number
export type DocumentType = 'estimate' | 'workOrder' | 'invoice'

export function generateDocumentNumber(
  profile: CompanyProfile,
  type: DocumentType
): string {
  const format = profile.numberingFormat || createDefaultCompanyProfile().numberingFormat!

  let prefix: string
  let includeYear: boolean
  let nextNumber: number
  let padding: number

  switch (type) {
    case 'estimate':
      prefix = format.estimatePrefix || 'EST'
      includeYear = format.estimateIncludeYear ?? true
      nextNumber = format.estimateNextNumber || 1
      padding = format.estimatePadding || 3
      break
    case 'workOrder':
      prefix = format.workOrderPrefix || 'WO'
      includeYear = format.workOrderIncludeYear ?? true
      nextNumber = format.workOrderNextNumber || 1
      padding = format.workOrderPadding || 3
      break
    case 'invoice':
      prefix = format.invoicePrefix || 'INV'
      includeYear = format.invoiceIncludeYear ?? true
      nextNumber = format.invoiceNextNumber || 1
      padding = format.invoicePadding || 3
      break
  }

  const year = new Date().getFullYear()
  const paddedNumber = nextNumber.toString().padStart(padding, '0')

  if (includeYear) {
    return `${prefix}-${year}-${paddedNumber}`
  } else {
    return `${prefix}-${paddedNumber}`
  }
}

// Helper to increment document counter
export function incrementDocumentCounter(
  profile: CompanyProfile,
  type: DocumentType
): CompanyProfile {
  const format = profile.numberingFormat || createDefaultCompanyProfile().numberingFormat!
  const updatedFormat = { ...format }

  switch (type) {
    case 'estimate':
      updatedFormat.estimateNextNumber = (format.estimateNextNumber || 1) + 1
      break
    case 'workOrder':
      updatedFormat.workOrderNextNumber = (format.workOrderNextNumber || 1) + 1
      break
    case 'invoice':
      updatedFormat.invoiceNextNumber = (format.invoiceNextNumber || 1) + 1
      break
  }

  return {
    ...profile,
    numberingFormat: updatedFormat,
    updatedAt: Date.now()
  }
}
