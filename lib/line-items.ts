export type LineItemType = 'material' | 'labor' | 'subcontractor' | 'equipment' | 'permit' | 'other'

export interface LineItem {
  id: string
  type: LineItemType
  description: string
  quantity: number
  unitPrice: number
  unit: string // 'ea', 'ft', 'hr', 'day', 'lump sum', etc.
  taxable: boolean
  subtotal: number // quantity * unitPrice
  notes?: string

  // Material-specific
  materialSource?: string // 'Lowes', 'Home Depot', 'Supply House', etc.
  partNumber?: string

  // Labor-specific
  laborType?: string // 'Electrician', 'Helper', 'Apprentice', etc.

  // Subcontractor-specific
  subcontractorId?: string
  subcontractorName?: string
}

export interface EstimateDocument {
  id: string
  number: string
  companyId?: string
  customerId?: string
  customerName: string
  jobId?: string
  jobName?: string
  date: number
  expiryDate?: number
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired'
  lineItems: LineItem[]
  subtotal: number
  taxRate: number // percentage, e.g., 6 for 6%
  taxAmount: number
  total: number
  notes?: string
  termsAndConditions?: string
  includeTerms: boolean
  createdAt: number
  updatedAt: number
}

export interface WorkOrderDocument {
  id: string
  number: string
  companyId?: string
  customerId?: string
  customerName: string
  jobId?: string
  jobName?: string
  estimateId?: string // linked estimate
  date: number
  scheduledDate?: number
  completedDate?: number
  status: 'Scheduled' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled'
  assignedTo?: string
  lineItems: LineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  notes?: string
  internalNotes?: string
  createdAt: number
  updatedAt: number
}

export interface InvoiceDocument {
  id: string
  number: string
  companyId?: string
  customerId?: string
  customerName: string
  jobId?: string
  jobName?: string
  estimateId?: string // linked estimate
  workOrderId?: string // linked work order
  date: number
  dueDate?: number
  status: 'Draft' | 'Sent' | 'Viewed' | 'Partial' | 'Paid' | 'Overdue' | 'Cancelled'
  lineItems: LineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  amountPaid: number
  balance: number
  paymentTerms?: string
  notes?: string
  termsAndConditions?: string
  includeTerms: boolean
  createdAt: number
  updatedAt: number
}

// Helper to calculate line item subtotal
export function calculateLineItemSubtotal(item: LineItem): number {
  return item.quantity * item.unitPrice
}

// Helper to calculate document totals
export function calculateDocumentTotals(lineItems: LineItem[], taxRate: number) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0)
  const taxableAmount = lineItems
    .filter(item => item.taxable)
    .reduce((sum, item) => sum + item.subtotal, 0)
  const taxAmount = (taxableAmount * taxRate) / 100
  const total = subtotal + taxAmount

  return {
    subtotal,
    taxableAmount,
    taxAmount,
    total
  }
}

// Common units
export const COMMON_UNITS = [
  'ea', // each
  'ft', // feet
  'sqft', // square feet
  'hr', // hours
  'day', // days
  'lump sum',
  'lot',
  'box',
  'roll',
  'bundle'
]

// Labor types
export const LABOR_TYPES = [
  'Master Electrician',
  'Journeyman Electrician',
  'Apprentice Electrician',
  'Helper',
  'Project Manager',
  'Other'
]

// Material sources
export const MATERIAL_SOURCES = [
  'Lowes',
  'Home Depot',
  'Electrical Supply House',
  'Plumbing Supply',
  'HVAC Supply',
  'Online',
  'Other'
]

// Quick price lookup for common materials (this could be enhanced with real API)
export interface MaterialPrice {
  description: string
  source: string
  price: number
  unit: string
  partNumber?: string
}

// Sample materials for quick lookup
export const COMMON_MATERIALS: MaterialPrice[] = [
  // Wire
  { description: '12/2 Romex Wire (250ft)', source: 'Home Depot', price: 89.99, unit: 'roll', partNumber: '63947633' },
  { description: '14/2 Romex Wire (250ft)', source: 'Home Depot', price: 69.99, unit: 'roll', partNumber: '63949334' },
  { description: '10/3 Romex Wire (250ft)', source: 'Lowes', price: 189.99, unit: 'roll' },

  // Boxes & Covers
  { description: 'Single Gang Old Work Box', source: 'Home Depot', price: 0.98, unit: 'ea', partNumber: '660658' },
  { description: 'Double Gang Old Work Box', source: 'Home Depot', price: 1.48, unit: 'ea', partNumber: '660666' },
  { description: '4" Square Box', source: 'Lowes', price: 1.28, unit: 'ea' },

  // Devices
  { description: '15A Outlet - White', source: 'Home Depot', price: 0.58, unit: 'ea', partNumber: '202066799' },
  { description: '20A Outlet - White', source: 'Home Depot', price: 1.28, unit: 'ea' },
  { description: 'Single Pole Switch', source: 'Lowes', price: 0.68, unit: 'ea' },
  { description: '3-Way Switch', source: 'Lowes', price: 1.18, unit: 'ea' },
  { description: 'GFCI Outlet 15A', source: 'Home Depot', price: 14.97, unit: 'ea' },
  { description: 'AFCI Breaker 15A', source: 'Electrical Supply', price: 42.00, unit: 'ea' },

  // Breakers
  { description: '15A Circuit Breaker', source: 'Home Depot', price: 5.97, unit: 'ea' },
  { description: '20A Circuit Breaker', source: 'Home Depot', price: 6.97, unit: 'ea' },
  { description: '30A Double Pole Breaker', source: 'Lowes', price: 15.98, unit: 'ea' },

  // Conduit & Fittings
  { description: '1/2" EMT Conduit 10ft', source: 'Home Depot', price: 4.97, unit: 'ea' },
  { description: '3/4" EMT Conduit 10ft', source: 'Home Depot', price: 7.97, unit: 'ea' },
  { description: '1/2" PVC Conduit 10ft', source: 'Lowes', price: 3.48, unit: 'ea' },

  // Fixtures
  { description: 'LED Can Light 4"', source: 'Home Depot', price: 12.97, unit: 'ea' },
  { description: 'LED Can Light 6"', source: 'Home Depot', price: 16.97, unit: 'ea' },
  { description: 'Ceiling Fan Box', source: 'Lowes', price: 8.98, unit: 'ea' },

  // Panels
  { description: '100A Load Center', source: 'Home Depot', price: 89.00, unit: 'ea' },
  { description: '200A Load Center', source: 'Electrical Supply', price: 185.00, unit: 'ea' },

  // Misc
  { description: 'Wire Nuts (Assorted)', source: 'Home Depot', price: 7.97, unit: 'box' },
  { description: 'Staples 1/2" (100pk)', source: 'Lowes', price: 4.98, unit: 'box' },
  { description: 'Electrical Tape', source: 'Home Depot', price: 1.98, unit: 'ea' },
]

// Search materials by description
export function searchMaterials(query: string): MaterialPrice[] {
  const lowerQuery = query.toLowerCase()
  return COMMON_MATERIALS.filter(material =>
    material.description.toLowerCase().includes(lowerQuery) ||
    (material.partNumber && material.partNumber.includes(query))
  ).slice(0, 10) // Return top 10 matches
}

// Create a new line item
export function createLineItem(
  type: LineItemType,
  description: string,
  quantity: number = 1,
  unitPrice: number = 0,
  unit: string = 'ea'
): LineItem {
  // Labor is automatically non-taxable
  const taxable = type !== 'labor'

  return {
    id: `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type,
    description,
    quantity,
    unitPrice,
    unit,
    taxable,
    subtotal: quantity * unitPrice
  }
}
