// Flexible Entity System for AppIo.AI
// Supports infinite customization of business entities

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea' | 'email' | 'phone' | 'currency' | 'percentage' | 'file' | 'reference'

export interface EntityField {
  id: string
  name: string
  label: string
  type: FieldType
  required: boolean
  enabled: boolean
  options?: string[] // For select/multiselect
  referenceEntity?: string // For reference fields (e.g., 'customer', 'job')
  defaultValue?: any
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  permissions?: {
    view: boolean
    edit: boolean
    adminOnly: boolean
  }
}

export interface EntityType {
  id: string
  name: string
  namePlural: string
  icon: string
  color: string
  enabled: boolean
  fields: EntityField[]
  relationships: {
    [key: string]: {
      type: 'one-to-many' | 'many-to-one' | 'many-to-many'
      targetEntity: string
      enabled: boolean
    }
  }
  features: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
    export: boolean
    import: boolean
    duplicate: boolean
    archive: boolean
    comments: boolean
    attachments: boolean
    history: boolean
    notifications: boolean
  }
}

export interface EntityInstance {
  id: string
  entityType: string
  createdAt: number
  updatedAt: number
  createdBy?: string
  status: string
  data: {
    [fieldId: string]: any
  }
  relationships: {
    [relationshipId: string]: string[] // Array of related entity IDs
  }
  addresses?: ContactAddress[] // Multiple addresses per contact
  linkedContacts?: LinkedContact[] // Sub-contacts with roles
  comments?: Comment[]
  attachments?: Attachment[]
  history?: HistoryEntry[]
}

export interface Comment {
  id: string
  userId?: string
  userName: string
  text: string
  timestamp: number
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: number
  uploadedBy?: string
}

export interface HistoryEntry {
  id: string
  userId?: string
  userName: string
  action: string
  field?: string
  oldValue?: any
  newValue?: any
  timestamp: number
}

// Contact Address System
export type AddressType = 'Billing' | 'Shipping' | 'Project Site' | 'Office' | 'Home' | 'Other'

export interface ContactAddress {
  id: string
  type: AddressType
  isPrimary: boolean
  street1: string
  street2?: string
  city: string
  state: string
  zip: string
  country?: string
  notes?: string
}

// Sub-Contact/Linked Contact System
export type ContactRole =
  | 'Primary Contact'
  | 'Billing Contact'
  | 'Payment Contact'
  | 'On-Site Contact'
  | 'Project Manager'
  | 'Facilities Manager'
  | 'Property Manager'
  | 'Tenant'
  | 'Landlord'
  | 'Owner'
  | 'Authorized Representative'
  | 'Emergency Contact'
  | 'Other'

export interface LinkedContact {
  id: string
  name: string
  role: ContactRole
  email?: string
  phone?: string
  title?: string
  notes?: string
  isPrimary: boolean
}

// Default Entity Configurations
export const DEFAULT_ENTITIES: { [key: string]: EntityType } = {
  customer: {
    id: 'customer',
    name: 'Customer',
    namePlural: 'Customers',
    icon: 'user',
    color: '#3b82f6',
    enabled: true,
    fields: [
      { id: 'name', name: 'name', label: 'Name', type: 'text', required: true, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'company', name: 'company', label: 'Company', type: 'text', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'email', name: 'email', label: 'Email', type: 'email', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'phone', name: 'phone', label: 'Phone', type: 'phone', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'address', name: 'address', label: 'Address', type: 'textarea', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'city', name: 'city', label: 'City', type: 'text', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'state', name: 'state', label: 'State', type: 'text', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'zip', name: 'zip', label: 'ZIP Code', type: 'text', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'customerType', name: 'customerType', label: 'Customer Type', type: 'select', required: false, enabled: true, options: ['Residential', 'Commercial', 'Industrial', 'Government'], permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'taxId', name: 'taxId', label: 'Tax ID', type: 'text', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'notes', name: 'notes', label: 'Notes', type: 'textarea', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
    ],
    relationships: {
      jobs: { type: 'one-to-many', targetEntity: 'job', enabled: true },
      estimates: { type: 'one-to-many', targetEntity: 'estimate', enabled: true },
      invoices: { type: 'one-to-many', targetEntity: 'invoice', enabled: true },
    },
    features: {
      create: true, read: true, update: true, delete: true,
      export: true, import: true, duplicate: true, archive: true,
      comments: true, attachments: true, history: true, notifications: true,
    }
  },

  job: {
    id: 'job',
    name: 'Job',
    namePlural: 'Jobs',
    icon: 'briefcase',
    color: '#10b981',
    enabled: true,
    fields: [
      { id: 'jobNumber', name: 'jobNumber', label: 'Job Number', type: 'text', required: true, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'title', name: 'title', label: 'Job Title', type: 'text', required: true, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'customer', name: 'customer', label: 'Customer', type: 'reference', required: true, enabled: true, referenceEntity: 'customer', permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'description', name: 'description', label: 'Description', type: 'textarea', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'status', name: 'status', label: 'Status', type: 'select', required: true, enabled: true, options: ['Lead', 'Scheduled', 'In Progress', 'On Hold', 'Completed', 'Cancelled'], defaultValue: 'Lead', permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'priority', name: 'priority', label: 'Priority', type: 'select', required: false, enabled: true, options: ['Low', 'Medium', 'High', 'Urgent'], defaultValue: 'Medium', permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'startDate', name: 'startDate', label: 'Start Date', type: 'date', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'endDate', name: 'endDate', label: 'End Date', type: 'date', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'estimatedValue', name: 'estimatedValue', label: 'Estimated Value', type: 'currency', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'actualCost', name: 'actualCost', label: 'Actual Cost', type: 'currency', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: true } },
      { id: 'location', name: 'location', label: 'Job Location', type: 'textarea', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'assignedTo', name: 'assignedTo', label: 'Assigned To', type: 'text', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
    ],
    relationships: {
      customer: { type: 'many-to-one', targetEntity: 'customer', enabled: true },
      workOrders: { type: 'one-to-many', targetEntity: 'workOrder', enabled: true },
      estimates: { type: 'one-to-many', targetEntity: 'estimate', enabled: true },
      invoices: { type: 'one-to-many', targetEntity: 'invoice', enabled: true },
    },
    features: {
      create: true, read: true, update: true, delete: true,
      export: true, import: true, duplicate: true, archive: true,
      comments: true, attachments: true, history: true, notifications: true,
    }
  },

  estimate: {
    id: 'estimate',
    name: 'Estimate',
    namePlural: 'Estimates',
    icon: 'calculator',
    color: '#f59e0b',
    enabled: true,
    fields: [
      { id: 'estimateNumber', name: 'estimateNumber', label: 'Estimate #', type: 'text', required: true, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'title', name: 'title', label: 'Title', type: 'text', required: true, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'customer', name: 'customer', label: 'Customer', type: 'reference', required: true, enabled: true, referenceEntity: 'customer', permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'job', name: 'job', label: 'Related Job', type: 'reference', required: false, enabled: true, referenceEntity: 'job', permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'description', name: 'description', label: 'Description', type: 'textarea', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'status', name: 'status', label: 'Status', type: 'select', required: true, enabled: true, options: ['Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Expired'], defaultValue: 'Draft', permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'totalAmount', name: 'totalAmount', label: 'Total Amount', type: 'currency', required: true, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'validUntil', name: 'validUntil', label: 'Valid Until', type: 'date', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'terms', name: 'terms', label: 'Terms & Conditions', type: 'textarea', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'sentDate', name: 'sentDate', label: 'Date Sent', type: 'date', required: false, enabled: true, permissions: { view: true, edit: false, adminOnly: false } },
    ],
    relationships: {
      customer: { type: 'many-to-one', targetEntity: 'customer', enabled: true },
      job: { type: 'many-to-one', targetEntity: 'job', enabled: true },
    },
    features: {
      create: true, read: true, update: true, delete: true,
      export: true, import: true, duplicate: true, archive: true,
      comments: true, attachments: true, history: true, notifications: true,
    }
  },

  workOrder: {
    id: 'workOrder',
    name: 'Work Order',
    namePlural: 'Work Orders',
    icon: 'clipboard',
    color: '#8b5cf6',
    enabled: true,
    fields: [
      { id: 'workOrderNumber', name: 'workOrderNumber', label: 'Work Order #', type: 'text', required: true, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'title', name: 'title', label: 'Title', type: 'text', required: true, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'job', name: 'job', label: 'Job', type: 'reference', required: true, enabled: true, referenceEntity: 'job', permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'description', name: 'description', label: 'Work Description', type: 'textarea', required: true, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'status', name: 'status', label: 'Status', type: 'select', required: true, enabled: true, options: ['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'], defaultValue: 'Pending', permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'priority', name: 'priority', label: 'Priority', type: 'select', required: false, enabled: true, options: ['Low', 'Medium', 'High', 'Emergency'], defaultValue: 'Medium', permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'scheduledDate', name: 'scheduledDate', label: 'Scheduled Date', type: 'date', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'completedDate', name: 'completedDate', label: 'Completed Date', type: 'date', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'assignedTo', name: 'assignedTo', label: 'Assigned To', type: 'text', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'laborHours', name: 'laborHours', label: 'Labor Hours', type: 'number', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'materialsCost', name: 'materialsCost', label: 'Materials Cost', type: 'currency', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
    ],
    relationships: {
      job: { type: 'many-to-one', targetEntity: 'job', enabled: true },
    },
    features: {
      create: true, read: true, update: true, delete: true,
      export: true, import: true, duplicate: true, archive: true,
      comments: true, attachments: true, history: true, notifications: true,
    }
  },

  invoice: {
    id: 'invoice',
    name: 'Invoice',
    namePlural: 'Invoices',
    icon: 'file-text',
    color: '#ef4444',
    enabled: true,
    fields: [
      { id: 'invoiceNumber', name: 'invoiceNumber', label: 'Invoice #', type: 'text', required: true, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'customer', name: 'customer', label: 'Customer', type: 'reference', required: true, enabled: true, referenceEntity: 'customer', permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'job', name: 'job', label: 'Related Job', type: 'reference', required: false, enabled: true, referenceEntity: 'job', permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'description', name: 'description', label: 'Description', type: 'textarea', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'status', name: 'status', label: 'Status', type: 'select', required: true, enabled: true, options: ['Draft', 'Sent', 'Viewed', 'Partial', 'Paid', 'Overdue', 'Cancelled'], defaultValue: 'Draft', permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'issueDate', name: 'issueDate', label: 'Issue Date', type: 'date', required: true, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'dueDate', name: 'dueDate', label: 'Due Date', type: 'date', required: true, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'subtotal', name: 'subtotal', label: 'Subtotal', type: 'currency', required: true, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'taxRate', name: 'taxRate', label: 'Tax Rate (%)', type: 'percentage', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'taxAmount', name: 'taxAmount', label: 'Tax Amount', type: 'currency', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'total', name: 'total', label: 'Total Amount', type: 'currency', required: true, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'amountPaid', name: 'amountPaid', label: 'Amount Paid', type: 'currency', required: false, enabled: true, defaultValue: 0, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'paymentTerms', name: 'paymentTerms', label: 'Payment Terms', type: 'select', required: false, enabled: true, options: ['Due on Receipt', 'Net 15', 'Net 30', 'Net 60'], defaultValue: 'Net 30', permissions: { view: true, edit: true, adminOnly: false } },
    ],
    relationships: {
      customer: { type: 'many-to-one', targetEntity: 'customer', enabled: true },
      job: { type: 'many-to-one', targetEntity: 'job', enabled: true },
    },
    features: {
      create: true, read: true, update: true, delete: true,
      export: true, import: true, duplicate: true, archive: true,
      comments: true, attachments: true, history: true, notifications: true,
    }
  },

  vendor: {
    id: 'vendor',
    name: 'Vendor',
    namePlural: 'Vendors',
    icon: 'truck',
    color: '#06b6d4',
    enabled: true,
    fields: [
      { id: 'name', name: 'name', label: 'Vendor Name', type: 'text', required: true, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'company', name: 'company', label: 'Company', type: 'text', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'email', name: 'email', label: 'Email', type: 'email', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'phone', name: 'phone', label: 'Phone', type: 'phone', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'address', name: 'address', label: 'Address', type: 'textarea', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'category', name: 'category', label: 'Category', type: 'select', required: false, enabled: true, options: ['Materials', 'Equipment', 'Services', 'Tools', 'Other'], permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'accountNumber', name: 'accountNumber', label: 'Account Number', type: 'text', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'paymentTerms', name: 'paymentTerms', label: 'Payment Terms', type: 'select', required: false, enabled: true, options: ['COD', 'Net 15', 'Net 30', 'Net 60'], permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'rating', name: 'rating', label: 'Rating', type: 'select', required: false, enabled: true, options: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'], permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'notes', name: 'notes', label: 'Notes', type: 'textarea', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
    ],
    relationships: {},
    features: {
      create: true, read: true, update: true, delete: true,
      export: true, import: true, duplicate: true, archive: true,
      comments: true, attachments: true, history: true, notifications: true,
    }
  },

  subcontractor: {
    id: 'subcontractor',
    name: 'Subcontractor',
    namePlural: 'Subcontractors',
    icon: 'users',
    color: '#ec4899',
    enabled: true,
    fields: [
      { id: 'name', name: 'name', label: 'Name', type: 'text', required: true, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'company', name: 'company', label: 'Company', type: 'text', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'trade', name: 'trade', label: 'Trade/Specialty', type: 'select', required: false, enabled: true, options: ['Electrical', 'Plumbing', 'HVAC', 'Carpentry', 'Drywall', 'Painting', 'Roofing', 'Concrete', 'Other'], permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'email', name: 'email', label: 'Email', type: 'email', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'phone', name: 'phone', label: 'Phone', type: 'phone', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'address', name: 'address', label: 'Address', type: 'textarea', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'licenseNumber', name: 'licenseNumber', label: 'License Number', type: 'text', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'insurance', name: 'insurance', label: 'Insurance Info', type: 'textarea', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'hourlyRate', name: 'hourlyRate', label: 'Hourly Rate', type: 'currency', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: true } },
      { id: 'rating', name: 'rating', label: 'Rating', type: 'select', required: false, enabled: true, options: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'], permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'status', name: 'status', label: 'Status', type: 'select', required: false, enabled: true, options: ['Active', 'Inactive', 'Blacklisted'], defaultValue: 'Active', permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'notes', name: 'notes', label: 'Notes', type: 'textarea', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
    ],
    relationships: {},
    features: {
      create: true, read: true, update: true, delete: true,
      export: true, import: true, duplicate: true, archive: true,
      comments: true, attachments: true, history: true, notifications: true,
    }
  },

  official: {
    id: 'official',
    name: 'Official/Inspector',
    namePlural: 'Officials & Inspectors',
    icon: 'shield',
    color: '#6366f1',
    enabled: true,
    fields: [
      { id: 'name', name: 'name', label: 'Name', type: 'text', required: true, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'title', name: 'title', label: 'Title/Position', type: 'text', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'type', name: 'type', label: 'Type', type: 'select', required: true, enabled: true, options: ['Building Inspector', 'Electrical Inspector', 'Fire Marshal', 'Code Enforcement', 'Police/Law Enforcement', 'Attorney', 'Permit Office', 'Zoning Official', 'Other'], permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'department', name: 'department', label: 'Department/Agency', type: 'text', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'jurisdiction', name: 'jurisdiction', label: 'Jurisdiction', type: 'text', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'email', name: 'email', label: 'Email', type: 'email', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'phone', name: 'phone', label: 'Phone', type: 'phone', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'officeAddress', name: 'officeAddress', label: 'Office Address', type: 'textarea', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'badgeNumber', name: 'badgeNumber', label: 'Badge/ID Number', type: 'text', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'specialties', name: 'specialties', label: 'Specialties/Areas', type: 'textarea', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
      { id: 'notes', name: 'notes', label: 'Notes', type: 'textarea', required: false, enabled: true, permissions: { view: true, edit: true, adminOnly: false } },
    ],
    relationships: {
      jobs: { type: 'many-to-many', targetEntity: 'job', enabled: true },
    },
    features: {
      create: true, read: true, update: true, delete: true,
      export: true, import: true, duplicate: true, archive: true,
      comments: true, attachments: true, history: true, notifications: true,
    }
  }
}
