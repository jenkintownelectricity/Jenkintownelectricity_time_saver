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
  defaultTermsAndConditions: 'Payment is due upon completion. A 50% deposit may be required for large projects.'
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
