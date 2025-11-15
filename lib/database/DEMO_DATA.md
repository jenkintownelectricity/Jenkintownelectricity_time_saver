# 🌱 Demo Data System

Automatic demo data seeding for new users to get started quickly with realistic sample data.

---

## 📋 What Gets Created

When a new user signs up, the system automatically creates:

### 1. Demo Company
- **Name**: Based on user's first name (e.g., "John's Electric Co.")
- **Code**: Randomly generated (e.g., "ABC-XYZ")
- **Settings**: Pre-configured with realistic work call bidding settings
  - First-come bid mode
  - $100 emergency bonus
  - $25 daytime bonus
  - $50 scheduled bonus
  - Appropriate timeouts for each call type

### 2. Sample Contacts (8 total)

Showcasing the flexible permission-based contact system:

#### Commercial Client
- **ABC Manufacturing** - Major client with maintenance contract
- Tags: commercial, maintenance-contract, priority
- Custom fields: account_number, contract_value, renewal_date

#### Residential Client
- **John & Sarah Thompson** - Residential customer
- Tags: residential, referral
- Custom fields: home_size, panel_type

#### Vendor/Supplier
- **Electrical Supply Warehouse** - Primary supplier
- Permission flags: `is_vendor: true`, `is_supplier: true`
- Custom fields: account_rep, discount_rate
- Payment terms: Net 30

#### 1099 Contractor/Subcontractor
- **Mike Stevens - Licensed Electrician** - Subcontractor
- Permission flags: `is_contractor_1099: true`, `is_subcontractor: true`
- Rating: 4.8/5
- Custom fields: license_number, insurance_expiry, specialty

#### Employee
- **David Rodriguez** - Journeyman Electrician
- Permission flag: `is_employee: true`
- Custom fields: employee_id, hire_date, hourly_rate, certifications

#### Lead
- **Green Tech Solutions** - Potential client
- Permission flag: `is_lead: true`
- Custom fields: lead_source, interest, budget_range, follow_up_date

#### Partner
- **Allied Electrical Services** - Partner company
- Permission flag: `is_partner: true`
- Custom fields: partnership_since, specialties, revenue_share

#### Multi-Role Example
- **Building Management Corp** - Both client AND vendor
- Permission flags: `is_client: true`, `is_vendor: true`
- Shows how one contact can have multiple roles simultaneously

### 3. Demo Work Calls (5 total)

#### Emergency Calls (2)
1. **Power Outage - ABC Manufacturing**
   - Complete power loss in production area
   - $100 bonus
   - 5-minute timeout
   - Linked to ABC Manufacturing contact

2. **Sparking Outlet - Building Management Corp**
   - Safety hazard in tenant unit
   - $100 bonus
   - 5-minute timeout

#### Daytime Calls (2)
1. **Panel Upgrade - Thompson Residence**
   - Replace 100A with 200A service
   - $25 bonus
   - 15-minute timeout
   - Linked to Thompson contact

2. **Install EV Charger**
   - 240V outlet for electric vehicle
   - $25 bonus
   - 15-minute timeout

#### Scheduled Call (1)
1. **Quarterly Maintenance - Green Tech Solutions**
   - Scheduled 2 days in the future
   - $50 bonus
   - 15-minute timeout
   - Linked to Green Tech contact

---

## 🔧 How It Works

### Automatic Seeding on Signup

The demo data is automatically created when a user signs up:

**File**: `app/signup/page.tsx`
```typescript
// After creating user profile
const { seedDemoData } = await import('@/lib/database/seed-demo-data')
await seedDemoData()
```

### Manual Seeding

You can also trigger demo data creation manually:

```typescript
import { useManualDemoDataSeeder } from '@/lib/hooks/use-demo-data'

function MyComponent() {
  const { seedDemo, isSeeding, error } = useManualDemoDataSeeder()

  const handleSeedDemo = async () => {
    const success = await seedDemo()
    if (success) {
      console.log('Demo data created!')
    }
  }

  return (
    <button onClick={handleSeedDemo} disabled={isSeeding}>
      {isSeeding ? 'Creating Demo Data...' : 'Seed Demo Data'}
    </button>
  )
}
```

### Idempotent Design

The seeder checks if data exists before creating:

```typescript
const needs = await needsDemoData()
// Only seeds if user has NO companies
```

This prevents duplicate demo data if the function is called multiple times.

---

## 🎨 Customization

### Modify Sample Contacts

Edit `lib/database/seed-demo-data.ts` to change contacts:

```typescript
const sampleContacts = [
  {
    name: 'Your Custom Contact',
    email: 'contact@example.com',
    is_client: true,
    custom_fields: {
      your_custom_field: 'value',
    },
  },
  // Add more contacts...
]
```

### Modify Work Calls

Change the work calls in the same file:

```typescript
const sampleWorkCalls = [
  {
    call_type: 'emergency' as const,
    title: 'Your Custom Call',
    description: 'Custom description',
    bonus: 150, // Custom bonus amount
  },
]
```

### Disable Auto-Seeding

To disable automatic seeding on signup, remove from `app/signup/page.tsx`:

```typescript
// Comment out or remove these lines:
// const { seedDemoData } = await import('@/lib/database/seed-demo-data')
// await seedDemoData()
```

---

## 🎯 Welcome Dialog

New users see a welcome dialog explaining the demo data:

**File**: `components/welcome-dialog.tsx`

The dialog:
- ✅ Appears on first login
- ✅ Explains what was created
- ✅ Provides next steps
- ✅ Marks onboarding as complete when dismissed

To integrate in your app:

```typescript
import { WelcomeDialog } from '@/components/welcome-dialog'

export default function RootLayout() {
  return (
    <>
      <YourAppContent />
      <WelcomeDialog />
    </>
  )
}
```

---

## 📊 Database Tables Populated

The seeder creates records in these tables:

- ✅ `companies` - 1 company
- ✅ `company_members` - 1 member (the user)
- ✅ `contacts` - 8 contacts
- ✅ `work_calls` - 5 work calls

**NOT created** (left for users to explore):
- `financial_documents` - Users create invoices/estimates
- `call_statistics` - Generated from actual work call activity

---

## 🔍 Verification

To verify demo data was created:

**In Supabase Dashboard:**
1. Go to Table Editor
2. Check `companies` table - should see 1 company
3. Check `contacts` table - should see 8 contacts
4. Check `work_calls` table - should see 5 calls

**In Your App:**
```typescript
import { getUserCompanies, getContacts, getWorkCalls } from '@/lib/database'

const companies = await getUserCompanies()
console.log(`${companies.length} companies`) // Should be 1

const contacts = await getContacts()
console.log(`${contacts.length} contacts`) // Should be 8

const calls = await getWorkCalls(companies[0].id)
console.log(`${calls.length} work calls`) // Should be 5
```

---

## 🚀 Next Steps for Users

After demo data is created, users should:

1. **Explore Work Calls** - See the bidding system in action
2. **View Contacts** - Understand the flexible permission system
3. **Customize Settings** - Update company settings, add API keys
4. **Create Real Data** - Add their own contacts and work calls
5. **Invite Team Members** - Add employees to the company

---

## 🛠️ Development Tips

### Testing the Seeder

```bash
# Sign up a new user
# Demo data should appear automatically

# Or run manually in console:
import { seedDemoData } from '@/lib/database/seed-demo-data'
await seedDemoData()
```

### Debugging

The seeder includes console logging:

```
🌱 Seeding demo data...
📋 Company: John's Electric Co. (ABC-XYZ)
✅ Company created: uuid-here
👥 Creating 8 sample contacts...
  ✓ ABC Manufacturing
  ✓ John & Sarah Thompson
  ✓ Electrical Supply Warehouse
  ...
✅ Created 8 contacts
📞 Creating 5 demo work calls...
  ✓ EMERGENCY: Power Outage - ABC Manufacturing
  ✓ DAYTIME: Panel Upgrade - Thompson Residence
  ...
✅ Created 5 work calls
🎉 Demo data seeded successfully!
```

### Resetting Demo Data

To reset and recreate demo data:

1. Delete all records from `work_calls`, `contacts`, `company_members`, `companies`
2. Run `seedDemoData()` again
3. Or create a "Reset to Demo Data" button using `useManualDemoDataSeeder`

---

## 📝 Notes

- Demo data is created **per user**, not globally
- Each user gets their own isolated demo company and contacts
- Work calls have realistic expiration times based on call type
- Custom fields showcase the flexibility of the JSONB system
- Permission flags demonstrate how one contact can have multiple roles

---

## 🎨 Future Enhancements

Potential improvements:

- [ ] Allow users to choose demo data template (residential vs. commercial focus)
- [ ] Add demo financial documents (invoices, estimates)
- [ ] Create demo call statistics for charts
- [ ] Add more diverse contact examples
- [ ] Industry-specific demo data templates
- [ ] "Tour" mode that highlights features with demo data

---

Happy building! 🚀
