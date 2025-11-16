// Receipt Tracker Types - Based on REBUILD_PLAN.md Section 6

export enum ReceiptCategory {
  MATERIALS = 'materials',
  LABOR = 'labor',
  TOOLS = 'tools',
  EQUIPMENT = 'equipment',
  FUEL = 'fuel',
  VEHICLE = 'vehicle',
  MEALS = 'meals',
  OFFICE = 'office',
  INSURANCE = 'insurance',
  LICENSES = 'licenses',
  PERMITS = 'permits',
  EDUCATION = 'education',
  MARKETING = 'marketing',
  PHONE = 'phone',
  INTERNET = 'internet',
  RENT = 'rent',
  UTILITIES = 'utilities',
  OTHER = 'other'
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CHECK = 'check',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_PAYMENT = 'mobile_payment',
  OTHER = 'other'
}

export interface Receipt {
  id: string
  userId: string
  companyId: string
  date: Date
  vendor: string
  amount: number
  category: ReceiptCategory
  paymentMethod: PaymentMethod
  description: string
  notes: string
  tags: string[]
  jobId?: string
  images: string[] // URLs or base64
  ocrText?: string
  taxYear: number
  taxQuarter: 1 | 2 | 3 | 4
  isTaxDeductible: boolean
  isPersonal: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ReceiptFilters {
  search?: string
  categories?: ReceiptCategory[]
  vendors?: string[]
  paymentMethods?: PaymentMethod[]
  dateFrom?: Date
  dateTo?: Date
  amountMin?: number
  amountMax?: number
  tags?: string[]
  jobId?: string
  isTaxDeductible?: boolean
  isPersonal?: boolean
  taxYear?: number
  taxQuarter?: 1 | 2 | 3 | 4
}

export type SortField = 'date' | 'amount' | 'vendor' | 'category' | 'createdAt'
export type SortDirection = 'asc' | 'desc'

export interface ReceiptSort {
  field: SortField
  direction: SortDirection
}

export interface ReceiptStats {
  totalExpenses: number
  categoryBreakdown: Record<ReceiptCategory, number>
  monthlyTrend: { month: string; amount: number }[]
  taxDeductibleTotal: number
  personalTotal: number
  quarterlyTotals: Record<1 | 2 | 3 | 4, number>
}

export interface OCRResult {
  vendor?: string
  date?: string
  amount?: number
  category?: ReceiptCategory
  description?: string
  confidence: number
  rawText: string
}

// Category configuration
export interface CategoryConfig {
  category: ReceiptCategory
  label: string
  isTaxDeductible: boolean
  icon: string
  color: string
}

export const CATEGORY_CONFIGS: Record<ReceiptCategory, CategoryConfig> = {
  [ReceiptCategory.MATERIALS]: {
    category: ReceiptCategory.MATERIALS,
    label: 'Materials',
    isTaxDeductible: true,
    icon: 'package',
    color: 'blue'
  },
  [ReceiptCategory.LABOR]: {
    category: ReceiptCategory.LABOR,
    label: 'Labor',
    isTaxDeductible: true,
    icon: 'users',
    color: 'green'
  },
  [ReceiptCategory.TOOLS]: {
    category: ReceiptCategory.TOOLS,
    label: 'Tools',
    isTaxDeductible: true,
    icon: 'wrench',
    color: 'orange'
  },
  [ReceiptCategory.EQUIPMENT]: {
    category: ReceiptCategory.EQUIPMENT,
    label: 'Equipment',
    isTaxDeductible: true,
    icon: 'cog',
    color: 'purple'
  },
  [ReceiptCategory.FUEL]: {
    category: ReceiptCategory.FUEL,
    label: 'Fuel',
    isTaxDeductible: true,
    icon: 'fuel',
    color: 'red'
  },
  [ReceiptCategory.VEHICLE]: {
    category: ReceiptCategory.VEHICLE,
    label: 'Vehicle',
    isTaxDeductible: true,
    icon: 'truck',
    color: 'gray'
  },
  [ReceiptCategory.MEALS]: {
    category: ReceiptCategory.MEALS,
    label: 'Meals',
    isTaxDeductible: true,
    icon: 'utensils',
    color: 'yellow'
  },
  [ReceiptCategory.OFFICE]: {
    category: ReceiptCategory.OFFICE,
    label: 'Office Supplies',
    isTaxDeductible: true,
    icon: 'briefcase',
    color: 'indigo'
  },
  [ReceiptCategory.INSURANCE]: {
    category: ReceiptCategory.INSURANCE,
    label: 'Insurance',
    isTaxDeductible: true,
    icon: 'shield',
    color: 'cyan'
  },
  [ReceiptCategory.LICENSES]: {
    category: ReceiptCategory.LICENSES,
    label: 'Licenses',
    isTaxDeductible: true,
    icon: 'award',
    color: 'pink'
  },
  [ReceiptCategory.PERMITS]: {
    category: ReceiptCategory.PERMITS,
    label: 'Permits',
    isTaxDeductible: true,
    icon: 'file-check',
    color: 'teal'
  },
  [ReceiptCategory.EDUCATION]: {
    category: ReceiptCategory.EDUCATION,
    label: 'Education',
    isTaxDeductible: true,
    icon: 'graduation-cap',
    color: 'violet'
  },
  [ReceiptCategory.MARKETING]: {
    category: ReceiptCategory.MARKETING,
    label: 'Marketing',
    isTaxDeductible: true,
    icon: 'megaphone',
    color: 'rose'
  },
  [ReceiptCategory.PHONE]: {
    category: ReceiptCategory.PHONE,
    label: 'Phone',
    isTaxDeductible: true,
    icon: 'phone',
    color: 'emerald'
  },
  [ReceiptCategory.INTERNET]: {
    category: ReceiptCategory.INTERNET,
    label: 'Internet',
    isTaxDeductible: true,
    icon: 'wifi',
    color: 'sky'
  },
  [ReceiptCategory.RENT]: {
    category: ReceiptCategory.RENT,
    label: 'Rent',
    isTaxDeductible: true,
    icon: 'home',
    color: 'amber'
  },
  [ReceiptCategory.UTILITIES]: {
    category: ReceiptCategory.UTILITIES,
    label: 'Utilities',
    isTaxDeductible: true,
    icon: 'zap',
    color: 'lime'
  },
  [ReceiptCategory.OTHER]: {
    category: ReceiptCategory.OTHER,
    label: 'Other',
    isTaxDeductible: false,
    icon: 'more-horizontal',
    color: 'slate'
  }
}

// Helper functions
export function getTaxQuarter(date: Date): 1 | 2 | 3 | 4 {
  const month = date.getMonth() + 1 // 1-12
  if (month <= 3) return 1
  if (month <= 6) return 2
  if (month <= 9) return 3
  return 4
}

export function getTaxYear(date: Date): number {
  return date.getFullYear()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function getCategoryLabel(category: ReceiptCategory): string {
  return CATEGORY_CONFIGS[category]?.label || category
}

export function isCategoryTaxDeductible(category: ReceiptCategory): boolean {
  return CATEGORY_CONFIGS[category]?.isTaxDeductible || false
}
