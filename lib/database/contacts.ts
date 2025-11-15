import { createClient } from '@/lib/supabase/client'
import type { Contact } from './types'

/**
 * Get all contacts for the current user/company
 */
export async function getContacts(companyId?: string): Promise<Contact[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('contacts')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (companyId) {
    query = query.eq('company_id', companyId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching contacts:', error)
    return []
  }

  return data || []
}

/**
 * Get contacts by type (client, vendor, contractor, etc.)
 */
export async function getContactsByType(
  type: keyof Pick<Contact, 'is_client' | 'is_vendor' | 'is_contractor_1099' | 'is_employee' | 'is_subcontractor' | 'is_supplier' | 'is_lead' | 'is_partner'>,
  companyId?: string
): Promise<Contact[]> {
  const supabase = createClient()

  let query = supabase
    .from('contacts')
    .select('*')
    .eq(type, true)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (companyId) {
    query = query.eq('company_id', companyId)
  }

  const { data, error } = await query

  if (error) {
    console.error(`Error fetching ${type} contacts:`, error)
    return []
  }

  return data || []
}

/**
 * Get a single contact by ID
 */
export async function getContactById(contactId: string): Promise<Contact | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .single()

  if (error) {
    console.error('Error fetching contact:', error)
    return null
  }

  return data
}

/**
 * Create a new contact
 */
export async function createContact(
  contactData: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Contact | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('No authenticated user')
    return null
  }

  const { data, error } = await supabase
    .from('contacts')
    .insert({
      ...contactData,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating contact:', error)
    return null
  }

  return data
}

/**
 * Update a contact
 */
export async function updateContact(
  contactId: string,
  updates: Partial<Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('contacts')
    .update(updates)
    .eq('id', contactId)

  if (error) {
    console.error('Error updating contact:', error)
    return false
  }

  return true
}

/**
 * Delete a contact (soft delete by archiving)
 */
export async function deleteContact(contactId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('contacts')
    .update({ archived: true, is_active: false })
    .eq('id', contactId)

  if (error) {
    console.error('Error deleting contact:', error)
    return false
  }

  return true
}

/**
 * Search contacts by name, email, or phone
 */
export async function searchContacts(
  searchTerm: string,
  companyId?: string
): Promise<Contact[]> {
  const supabase = createClient()

  let query = supabase
    .from('contacts')
    .select('*')
    .eq('is_active', true)

  if (companyId) {
    query = query.eq('company_id', companyId)
  }

  // Search in name, email, or phone
  query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)

  const { data, error } = await query.order('name', { ascending: true })

  if (error) {
    console.error('Error searching contacts:', error)
    return []
  }

  return data || []
}

/**
 * Update contact permission flags (is_client, is_vendor, etc.)
 */
export async function updateContactPermissions(
  contactId: string,
  permissions: Partial<Pick<Contact, 'is_client' | 'is_vendor' | 'is_contractor_1099' | 'is_employee' | 'is_subcontractor' | 'is_supplier' | 'is_lead' | 'is_partner'>>
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('contacts')
    .update(permissions)
    .eq('id', contactId)

  if (error) {
    console.error('Error updating contact permissions:', error)
    return false
  }

  return true
}
