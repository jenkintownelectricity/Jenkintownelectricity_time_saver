import { createClient } from '@/lib/supabase/client'
import type { Company, CompanyMember } from './types'

/**
 * Get all companies the current user is a member of
 */
export async function getUserCompanies(): Promise<Company[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get companies through company_members
  const { data: members } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (!members || members.length === 0) return []

  const companyIds = members.map(m => m.company_id)

  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .in('id', companyIds)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching companies:', error)
    return []
  }

  return companies || []
}

/**
 * Get a single company by ID
 */
export async function getCompanyById(companyId: string): Promise<Company | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()

  if (error) {
    console.error('Error fetching company:', error)
    return null
  }

  return data
}

/**
 * Get a company by its code (e.g., "ABC-DEF")
 */
export async function getCompanyByCode(code: string): Promise<Company | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('code', code)
    .single()

  if (error) {
    console.error('Error fetching company by code:', error)
    return null
  }

  return data
}

/**
 * Create a new company
 */
export async function createCompany(
  name: string,
  code: string,
  settings?: Partial<Company['settings']>
): Promise<Company | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('No authenticated user')
    return null
  }

  const defaultSettings = {
    bidMode: 'first-come' as const,
    emergencyBonus: 100,
    daytimeBonus: 25,
    scheduledBonus: 50,
    emergencyTimeout: 5,
    daytimeTimeout: 15,
    scheduledTimeout: 15,
    ...settings,
  }

  // Create company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({
      name,
      code,
      owner_id: user.id,
      settings: defaultSettings,
    })
    .select()
    .single()

  if (companyError) {
    console.error('Error creating company:', companyError)
    return null
  }

  // Add owner as member
  const { error: memberError } = await supabase
    .from('company_members')
    .insert({
      company_id: company.id,
      user_id: user.id,
      role: 'owner',
      is_active: true,
    })

  if (memberError) {
    console.error('Error adding owner as member:', memberError)
    // Rollback: delete the company
    await supabase.from('companies').delete().eq('id', company.id)
    return null
  }

  return company
}

/**
 * Update company settings
 */
export async function updateCompanySettings(
  companyId: string,
  settings: Partial<Company['settings']>
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('companies')
    .update({ settings })
    .eq('id', companyId)

  if (error) {
    console.error('Error updating company settings:', error)
    return false
  }

  return true
}

/**
 * Link companies together (for network marketplace)
 */
export async function linkCompany(
  companyId: string,
  targetCompanyCode: string
): Promise<boolean> {
  const supabase = createClient()

  // Get target company
  const targetCompany = await getCompanyByCode(targetCompanyCode)
  if (!targetCompany) {
    console.error('Target company not found')
    return false
  }

  // Get current company
  const currentCompany = await getCompanyById(companyId)
  if (!currentCompany) {
    console.error('Current company not found')
    return false
  }

  // Add to linked_companies array
  const linkedCompanies = Array.isArray(currentCompany.linked_companies)
    ? [...currentCompany.linked_companies, targetCompany.id]
    : [targetCompany.id]

  const { error } = await supabase
    .from('companies')
    .update({ linked_companies: linkedCompanies })
    .eq('id', companyId)

  if (error) {
    console.error('Error linking company:', error)
    return false
  }

  return true
}

/**
 * Get company members
 */
export async function getCompanyMembers(companyId: string): Promise<CompanyMember[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('company_members')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Error fetching company members:', error)
    return []
  }

  return data || []
}

/**
 * Add a member to a company
 */
export async function addCompanyMember(
  companyId: string,
  userId: string,
  role: CompanyMember['role'] = 'member',
  jobTitle?: string
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('company_members')
    .insert({
      company_id: companyId,
      user_id: userId,
      role,
      job_title: jobTitle,
      is_active: true,
    })

  if (error) {
    console.error('Error adding company member:', error)
    return false
  }

  return true
}

/**
 * Update member's on-call status
 */
export async function updateMemberOnCallStatus(
  companyId: string,
  userId: string,
  isOnCall: boolean
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('company_members')
    .update({ is_on_call: isOnCall })
    .eq('company_id', companyId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating on-call status:', error)
    return false
  }

  return true
}
