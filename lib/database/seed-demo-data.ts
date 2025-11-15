import { createClient } from '@/lib/supabase/client'
import { createCompany, addCompanyMember } from './companies'
import { createContact } from './contacts'
import { createWorkCall } from './work-calls'
import type { Contact } from './types'

/**
 * Check if user needs demo data (no companies exist)
 */
export async function needsDemoData(): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // Check if user has any companies
  const { data: members } = await supabase
    .from('company_members')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  return !members || members.length === 0
}

/**
 * Generate a unique company code
 */
function generateCompanyCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''

  // First part (3 chars)
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  code += '-'

  // Second part (3 chars)
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return code
}

/**
 * Seed demo data for a new user
 */
export async function seedDemoData(): Promise<{
  success: boolean
  companyId?: string
  error?: string
}> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'No authenticated user' }
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const userName = profile?.full_name || 'Demo User'
    const companyName = `${userName.split(' ')[0]}'s Electric Co.`
    const companyCode = generateCompanyCode()

    console.log('🌱 Seeding demo data...')
    console.log(`📋 Company: ${companyName} (${companyCode})`)

    // Step 1: Create demo company
    const company = await createCompany(companyName, companyCode, {
      bidMode: 'first-come',
      emergencyBonus: 100,
      daytimeBonus: 25,
      scheduledBonus: 50,
      emergencyTimeout: 5,
      daytimeTimeout: 15,
      scheduledTimeout: 15,
    })

    if (!company) {
      return { success: false, error: 'Failed to create demo company' }
    }

    console.log(`✅ Company created: ${company.id}`)

    // Step 2: Create sample contacts showcasing different permission flags
    const sampleContacts = [
      // Client examples
      {
        name: 'ABC Manufacturing',
        email: 'contact@abcmanufacturing.com',
        phone: '(215) 555-0101',
        address: '1234 Industrial Blvd',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19019',
        is_client: true,
        is_active: true,
        notes: 'Major commercial client - regular maintenance contracts',
        tags: ['commercial', 'maintenance-contract', 'priority'],
        custom_fields: {
          account_number: 'ACC-10234',
          contract_value: 50000,
          renewal_date: '2025-12-31',
        },
      },
      {
        name: 'John & Sarah Thompson',
        email: 'thompsonjs@email.com',
        phone: '(215) 555-0102',
        address: '456 Oak Street',
        city: 'Jenkintown',
        state: 'PA',
        zip: '19046',
        is_client: true,
        is_active: true,
        notes: 'Residential client - referred by neighbor',
        tags: ['residential', 'referral'],
        custom_fields: {
          home_size: '2400 sq ft',
          panel_type: '200A',
        },
      },

      // Vendor/Supplier
      {
        name: 'Electrical Supply Warehouse',
        email: 'sales@elec-supply.com',
        phone: '(215) 555-0103',
        address: '789 Commerce Dr',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19154',
        is_vendor: true,
        is_supplier: true,
        is_active: true,
        payment_terms: 'Net 30',
        notes: 'Primary supplier - 15% contractor discount',
        tags: ['supplier', 'preferred'],
        custom_fields: {
          account_rep: 'Mike Johnson',
          discount_rate: 15,
        },
      },

      // 1099 Contractor (can also be subcontractor)
      {
        name: 'Mike Stevens - Licensed Electrician',
        email: 'mike@stevenselectric.com',
        phone: '(215) 555-0104',
        mobile: '(215) 555-0105',
        address: '321 Contractor Lane',
        city: 'Abington',
        state: 'PA',
        zip: '19001',
        is_contractor_1099: true,
        is_subcontractor: true,
        is_active: true,
        tax_id: 'XX-XXXXXXX',
        payment_terms: 'Upon completion',
        notes: 'Reliable subcontractor for commercial projects',
        rating: 4.8,
        tags: ['licensed', 'commercial', 'reliable'],
        custom_fields: {
          license_number: 'PA-EL-12345',
          insurance_expiry: '2025-12-31',
          specialty: 'Commercial installations',
        },
      },

      // Employee
      {
        name: 'David Rodriguez',
        email: 'david.r@company.com',
        phone: '(215) 555-0106',
        mobile: '(215) 555-0107',
        is_employee: true,
        is_active: true,
        job_title: 'Journeyman Electrician',
        notes: 'Lead electrician - 8 years experience',
        tags: ['employee', 'journeyman', 'team-lead'],
        custom_fields: {
          employee_id: 'EMP-001',
          hire_date: '2017-03-15',
          hourly_rate: 45,
          certifications: ['Journeyman License', 'OSHA 30'],
        },
      } as Partial<Contact>,

      // Lead (potential client)
      {
        name: 'Green Tech Solutions',
        email: 'info@greentechsol.com',
        phone: '(215) 555-0108',
        address: '555 Innovation Way',
        city: 'King of Prussia',
        state: 'PA',
        zip: '19406',
        is_lead: true,
        is_active: true,
        notes: 'Interested in solar panel installation - quote requested',
        tags: ['lead', 'solar', 'commercial'],
        custom_fields: {
          lead_source: 'Website contact form',
          interest: 'Solar panel installation',
          budget_range: '$100k-$150k',
          follow_up_date: '2025-02-01',
        },
      },

      // Partner (another electrical company)
      {
        name: 'Allied Electrical Services',
        email: 'partnerships@alliedelectric.com',
        phone: '(215) 555-0109',
        address: '999 Partnership Plaza',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19102',
        is_partner: true,
        is_active: true,
        notes: 'Partner company for overflow work and specialties',
        tags: ['partner', 'overflow', 'industrial'],
        custom_fields: {
          partnership_since: '2023-06-01',
          specialties: ['Industrial', 'High-voltage', 'Controls'],
          revenue_share: '10%',
        },
      },

      // Multi-role example (client who is also a vendor)
      {
        name: 'Building Management Corp',
        email: 'facilities@buildingmgmt.com',
        phone: '(215) 555-0110',
        address: '777 Property Row',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19103',
        is_client: true,
        is_vendor: true,
        is_active: true,
        notes: 'Property management company - we service their buildings AND they refer clients to us',
        tags: ['commercial', 'property-management', 'referral-partner'],
        custom_fields: {
          properties_managed: 45,
          monthly_retainer: 5000,
          referral_commission: '5%',
        },
      },
    ]

    console.log(`👥 Creating ${sampleContacts.length} sample contacts...`)

    const createdContacts = []
    for (const contactData of sampleContacts) {
      const contact = await createContact({
        ...contactData,
        company_id: company.id,
      } as Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>)

      if (contact) {
        createdContacts.push(contact)
        console.log(`  ✓ ${contact.name}`)
      }
    }

    console.log(`✅ Created ${createdContacts.length} contacts`)

    // Step 3: Create demo work calls
    const now = new Date()

    const sampleWorkCalls = [
      // Emergency call
      {
        call_type: 'emergency' as const,
        title: 'Power Outage - ABC Manufacturing',
        description: 'Complete power loss in production area. Urgent - production halted.',
        location: '1234 Industrial Blvd, Philadelphia, PA',
        customer_name: 'ABC Manufacturing',
        customer_phone: '(215) 555-0101',
        customer_email: 'contact@abcmanufacturing.com',
        contact_id: createdContacts.find(c => c.name === 'ABC Manufacturing')?.id,
        bonus: 100,
      },

      // Daytime call
      {
        call_type: 'daytime' as const,
        title: 'Panel Upgrade - Thompson Residence',
        description: 'Replace 100A panel with 200A service. Home inspector flagged old panel.',
        location: '456 Oak Street, Jenkintown, PA',
        customer_name: 'John Thompson',
        customer_phone: '(215) 555-0102',
        customer_email: 'thompsonjs@email.com',
        contact_id: createdContacts.find(c => c.name === 'John & Sarah Thompson')?.id,
        bonus: 25,
      },

      // Scheduled call
      {
        call_type: 'scheduled' as const,
        title: 'Quarterly Maintenance - Green Tech Solutions',
        description: 'Scheduled quarterly electrical inspection and preventive maintenance.',
        location: '555 Innovation Way, King of Prussia, PA',
        customer_name: 'Green Tech Solutions',
        customer_phone: '(215) 555-0108',
        customer_email: 'info@greentechsol.com',
        contact_id: createdContacts.find(c => c.name === 'Green Tech Solutions')?.id,
        bonus: 50,
        scheduled_for: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      },

      // Another emergency
      {
        call_type: 'emergency' as const,
        title: 'Sparking Outlet - Building Management Corp',
        description: 'Tenant reports sparking outlet in unit 405. Safety hazard.',
        location: '777 Property Row, Philadelphia, PA',
        customer_name: 'Building Management Corp',
        customer_phone: '(215) 555-0110',
        customer_email: 'facilities@buildingmgmt.com',
        contact_id: createdContacts.find(c => c.name === 'Building Management Corp')?.id,
        bonus: 100,
      },

      // Daytime service call
      {
        call_type: 'daytime' as const,
        title: 'Install EV Charger - Residential',
        description: 'Customer wants 240V outlet installed in garage for electric vehicle charging.',
        location: '456 Oak Street, Jenkintown, PA',
        customer_name: 'Sarah Thompson',
        customer_phone: '(215) 555-0102',
        customer_email: 'thompsonjs@email.com',
        contact_id: createdContacts.find(c => c.name === 'John & Sarah Thompson')?.id,
        bonus: 25,
      },
    ]

    console.log(`📞 Creating ${sampleWorkCalls.length} demo work calls...`)

    let callsCreated = 0
    for (const callData of sampleWorkCalls) {
      const call = await createWorkCall(company.id, callData)
      if (call) {
        callsCreated++
        console.log(`  ✓ ${call.call_type.toUpperCase()}: ${call.title}`)
      }
    }

    console.log(`✅ Created ${callsCreated} work calls`)
    console.log('🎉 Demo data seeded successfully!')

    return {
      success: true,
      companyId: company.id,
    }
  } catch (error) {
    console.error('❌ Error seeding demo data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
