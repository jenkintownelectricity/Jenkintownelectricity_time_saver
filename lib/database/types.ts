// Database table types matching our Supabase schema

export interface UserProfile {
  id: string
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  role: 'user' | 'admin' | 'owner'
  onboarding_completed: boolean
  last_seen_at: string | null
  preferences: Record<string, unknown>
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  code: string
  owner_id: string
  settings: {
    bidMode: 'first-come' | 'bidding'
    emergencyBonus: number
    daytimeBonus: number
    scheduledBonus: number
    emergencyTimeout: number
    daytimeTimeout: number
    scheduledTimeout: number
  }
  linked_companies: string[]
  is_active: boolean
  archived: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface CompanyMember {
  id: string
  company_id: string
  user_id: string
  member_number: string | null
  job_title: string | null
  role: 'member' | 'manager' | 'admin' | 'owner'
  permissions: Record<string, unknown>
  is_active: boolean
  is_on_call: boolean
  joined_at: string
  updated_at: string
}

export interface Contact {
  id: string
  user_id: string
  company_id: string | null
  name: string
  email: string | null
  phone: string | null
  mobile: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  is_client: boolean
  is_contractor_1099: boolean
  is_employee: boolean
  is_vendor: boolean
  is_subcontractor: boolean
  is_supplier: boolean
  is_lead: boolean
  is_partner: boolean
  billing_address: string | null
  tax_id: string | null
  payment_terms: string | null
  is_active: boolean
  archived: boolean
  rating: number | null
  notes: string | null
  tags: string[]
  custom_fields: Record<string, unknown>
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type DocumentType =
  | 'invoice'
  | 'estimate'
  | 'quote'
  | 'work_order'
  | 'proposal'
  | 'contract'
  | 'receipt'
  | 'credit_note'
  | 'purchase_order'

export type DocumentStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'completed'
  | 'paid'
  | 'partially_paid'
  | 'overdue'
  | 'cancelled'
  | 'void'

export interface FinancialDocument {
  id: string
  user_id: string
  company_id: string | null
  contact_id: string | null
  document_type: DocumentType
  document_number: string
  title: string | null
  description: string | null
  document_date: string
  due_date: string | null
  valid_until: string | null
  status: DocumentStatus
  line_items: Array<{
    description: string
    quantity: number
    unit_price: number
    total: number
    tax_rate?: number
  }>
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount_amount: number
  total: number
  amount_paid: number
  balance_due: number
  features_enabled: Record<string, unknown>
  related_documents: string[]
  attachments: Array<{
    name: string
    url: string
    type: string
  }>
  is_recurring: boolean
  recurrence_pattern: Record<string, unknown> | null
  archived: boolean
  custom_fields: Record<string, unknown>
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  sent_at: string | null
  paid_at: string | null
}

export type CallType = 'emergency' | 'daytime' | 'scheduled'

export type CallStatus =
  | 'active'
  | 'claimed'
  | 'in_progress'
  | 'completed'
  | 'expired'
  | 'cancelled'

export interface WorkCall {
  id: string
  company_id: string
  created_by_user_id: string | null
  call_type: CallType
  title: string
  description: string | null
  location: string | null
  contact_id: string | null
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  bonus: number
  bid_mode: 'first-come' | 'bidding'
  bids: Array<{
    user_id: string
    amount: number
    timestamp: string
  }>
  status: CallStatus
  claimed_by_user_id: string | null
  claimed_at: string | null
  expires_at: string
  scheduled_for: string | null
  completed_at: string | null
  completion_notes: string | null
  related_document_id: string | null
  custom_fields: Record<string, unknown>
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface CallStatistics {
  id: string
  user_id: string | null
  company_id: string | null
  total_calls: number
  claimed_calls: number
  completed_calls: number
  expired_calls: number
  cancelled_calls: number
  total_bonus_earned: number
  average_response_time_seconds: number
  success_rate: number
  emergency_calls: number
  daytime_calls: number
  scheduled_calls: number
  period_start: string
  period_end: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}
