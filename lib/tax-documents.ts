export type TaxDocumentCategory =
  | 'Income'
  | 'Expenses'
  | 'Receipts'
  | 'Mileage'
  | 'Equipment Purchases'
  | 'Materials'
  | 'Subcontractor Payments'
  | 'Vehicle Expenses'
  | 'Office Expenses'
  | 'Insurance'
  | 'Taxes & Licenses'
  | 'Bank Statements'
  | 'Credit Card Statements'
  | '1099s Received'
  | '1099s Sent'
  | 'W2s'
  | 'Invoices Sent'
  | 'Invoices Received'
  | 'Permits & Fees'
  | 'Other'

export type TaxYear = number
export type TaxQuarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

export interface TaxDocument {
  id: string
  name: string
  category: TaxDocumentCategory
  description?: string
  amount?: number
  date: number // timestamp
  year: TaxYear
  quarter: TaxQuarter
  url?: string // file URL if uploaded
  fileType?: string
  fileSize?: number
  linkedEntityId?: string // link to job, invoice, etc
  linkedEntityType?: string
  tags?: string[]
  notes?: string
  submittedToAccountant?: boolean
  submittedDate?: number
  createdAt: number
  updatedAt: number
}

export interface TaxPackage {
  id: string
  year: TaxYear
  quarter?: TaxQuarter
  type: 'quarterly' | 'annual'
  documents: string[] // document IDs
  generatedAt: number
  submittedAt?: number
  accountantEmail?: string
  notes?: string
}

// Helper to determine quarter from date
export function getQuarterFromDate(date: number): TaxQuarter {
  const month = new Date(date).getMonth() + 1
  if (month <= 3) return 'Q1'
  if (month <= 6) return 'Q2'
  if (month <= 9) return 'Q3'
  return 'Q4'
}

// Helper to get date range for quarter
export function getQuarterDateRange(year: TaxYear, quarter: TaxQuarter): { start: number; end: number } {
  let startMonth: number
  let endMonth: number

  switch (quarter) {
    case 'Q1':
      startMonth = 0
      endMonth = 2
      break
    case 'Q2':
      startMonth = 3
      endMonth = 5
      break
    case 'Q3':
      startMonth = 6
      endMonth = 8
      break
    case 'Q4':
      startMonth = 9
      endMonth = 11
      break
  }

  const start = new Date(year, startMonth, 1).getTime()
  const end = new Date(year, endMonth + 1, 0, 23, 59, 59, 999).getTime()

  return { start, end }
}

// Helper to get all documents for a quarter
export function getDocumentsForQuarter(documents: TaxDocument[], year: TaxYear, quarter: TaxQuarter): TaxDocument[] {
  return documents.filter(doc => doc.year === year && doc.quarter === quarter)
}

// Helper to get all documents for a year
export function getDocumentsForYear(documents: TaxDocument[], year: TaxYear): TaxDocument[] {
  return documents.filter(doc => doc.year === year)
}

// Helper to calculate total amount by category
export function getTotalByCategory(documents: TaxDocument[], category: TaxDocumentCategory): number {
  return documents
    .filter(doc => doc.category === category)
    .reduce((sum, doc) => sum + (doc.amount || 0), 0)
}

// Auto-suggest category based on description/name
export function suggestCategory(name: string, description?: string): TaxDocumentCategory {
  const text = `${name} ${description || ''}`.toLowerCase()

  if (text.includes('invoice') && text.includes('sent')) return 'Invoices Sent'
  if (text.includes('invoice') && text.includes('received')) return 'Invoices Received'
  if (text.includes('1099') && text.includes('received')) return '1099s Received'
  if (text.includes('1099') && text.includes('sent')) return '1099s Sent'
  if (text.includes('w2') || text.includes('w-2')) return 'W2s'
  if (text.includes('mileage') || text.includes('miles')) return 'Mileage'
  if (text.includes('vehicle') || text.includes('gas') || text.includes('fuel')) return 'Vehicle Expenses'
  if (text.includes('equipment') || text.includes('tool')) return 'Equipment Purchases'
  if (text.includes('material') || text.includes('supply')) return 'Materials'
  if (text.includes('subcontractor') || text.includes('sub')) return 'Subcontractor Payments'
  if (text.includes('insurance')) return 'Insurance'
  if (text.includes('permit') || text.includes('fee') || text.includes('license')) return 'Permits & Fees'
  if (text.includes('bank') && text.includes('statement')) return 'Bank Statements'
  if (text.includes('credit card')) return 'Credit Card Statements'
  if (text.includes('office')) return 'Office Expenses'
  if (text.includes('receipt')) return 'Receipts'
  if (text.includes('tax')) return 'Taxes & Licenses'
  if (text.includes('income') || text.includes('payment received')) return 'Income'
  if (text.includes('expense')) return 'Expenses'

  return 'Other'
}
