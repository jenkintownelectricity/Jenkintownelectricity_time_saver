# 🗄️ AppIo.AI Database Setup

Complete database schema for your flexible, permission-based architecture.

---

## 🎯 **Architecture Overview**

This database is designed for **infinite customization** without schema changes!

### **Key Features:**
- ✅ **Universal Contacts** - One table with permission flags (client, vendor, contractor, employee, etc.)
- ✅ **Universal Financial Documents** - One table for invoices, estimates, work orders, etc.
- ✅ **Multi-Role Support** - Same contact can be client AND vendor simultaneously
- ✅ **JSONB Custom Fields** - Add unlimited fields without migrations
- ✅ **Row Level Security (RLS)** - Multi-tenant data isolation
- ✅ **Vercel/Railway/Render Ready** - Works with all major hosting platforms

---

## 📁 **File Structure**

```
database/
├── schema.sql                      # ⭐ Main schema - run this first!
├── migrations/
│   ├── 001_initial_schema.sql     # Version tracking
│   ├── 002_row_level_security.sql # ⭐ Security policies - run second!
│   └── 003_seed_data.sql          # Optional demo data
└── README.md                       # This file
```

---

## 🚀 **Quick Start (3 Steps)**

### **Step 1: Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose a name and password
4. Wait for project to initialize (~2 minutes)

### **Step 2: Get Your Credentials**

1. Go to Project Settings > API
2. Copy these values to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Step 3: Run the Schema**

1. Open Supabase Dashboard > SQL Editor
2. Click "New Query"
3. Copy ALL contents of `schema.sql`
4. Paste and click "Run"
5. You should see: `Success. No rows returned`

6. Run the security policies:
   - Copy ALL contents of `migrations/002_row_level_security.sql`
   - Paste and click "Run"

**Done! Your database is ready!** 🎉

---

## 📊 **Database Tables Explained**

### **1. user_profiles**
Extends Supabase authentication with app-specific data.

```sql
-- Each authenticated user gets a profile
{
  id: uuid,              -- Links to auth.users
  full_name: text,
  email: text,
  phone: text,
  role: 'user' | 'admin' | 'owner',
  preferences: jsonb,    -- Infinite custom settings
  metadata: jsonb        -- Store anything!
}
```

### **2. companies** (Multi-tenant)
Your businesses that users belong to.

```sql
{
  id: uuid,
  name: text,
  code: text,            -- ABC-DEF format
  owner_id: uuid,
  settings: jsonb,       -- Bonuses, timeouts, etc.
  linked_companies: []   -- Network marketplace
}
```

### **3. contacts** ⭐ **UNIVERSAL TABLE**
Replaces separate clients/vendors/contractors tables!

```sql
{
  id: uuid,
  name: text,
  email: text,

  -- 🎯 PERMISSION FLAGS (Mix & match!)
  is_client: boolean,
  is_contractor_1099: boolean,
  is_employee: boolean,
  is_vendor: boolean,
  is_subcontractor: boolean,
  is_supplier: boolean,
  is_lead: boolean,
  is_partner: boolean,

  -- ✨ INFINITE CUSTOMIZATION
  custom_fields: jsonb   -- Add ANY fields without migrations!
}
```

**Example:**
```json
{
  "name": "ABC Construction",
  "is_client": true,
  "is_vendor": true,     // Same person is BOTH!
  "custom_fields": {
    "license_number": "12345",
    "insurance_expiry": "2025-12-31",
    "specialty": "residential",
    "preferred_payment": "NET30"
    // Add whatever you want!
  }
}
```

### **4. financial_documents** ⭐ **UNIVERSAL TABLE**
One table for invoices, estimates, work orders, quotes, etc.!

```sql
{
  id: uuid,

  -- 🎯 DOCUMENT TYPE (Add new types anytime!)
  document_type: 'invoice' | 'estimate' | 'work_order' |
                 'quote' | 'proposal' | 'contract' | etc.,

  document_number: text,  -- INV-001, EST-001, etc.
  line_items: jsonb,      -- Flexible line items
  subtotal: decimal,
  total: decimal,

  -- 🔧 FEATURES PER TYPE
  features_enabled: jsonb, // Turn features on/off!

  -- ✨ INFINITE CUSTOMIZATION
  custom_fields: jsonb
}
```

**Example:**
```json
{
  "document_type": "invoice",
  "line_items": [
    {
      "description": "200A Panel",
      "quantity": 1,
      "unit_price": 800.00,
      "total": 800.00
    }
  ],
  "features_enabled": {
    "allow_partial_payment": true,
    "require_signature": false,
    "send_reminders": true
  }
}
```

### **5. work_calls**
Your Uber-style job bidding system.

```sql
{
  id: uuid,
  call_type: 'emergency' | 'daytime' | 'scheduled',
  title: text,
  bonus: decimal,
  status: 'active' | 'claimed' | 'completed' | 'expired',
  claimed_by_user_id: uuid,
  bids: jsonb,           -- Bidding system data
  custom_fields: jsonb
}
```

---

## 🔒 **Security (Row Level Security)**

Your data is **automatically secured** with RLS policies:

✅ **Multi-tenant isolation** - Users only see their own data
✅ **Company-based access** - Members see company data
✅ **Network marketplace** - See linked companies' calls
✅ **Role-based permissions** - Owners have more access

**How it works:**
```sql
-- Users can only read contacts from companies they belong to
CREATE POLICY "Users can read company contacts"
  ON public.contacts FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_members
      WHERE user_id = auth.uid()
    )
  );
```

This happens **automatically** - you don't need to write any security code!

---

## 🎨 **Adding Custom Fields (No Migrations!)**

You can add unlimited fields without changing the database:

### **Example 1: Add fields to a contact**
```typescript
// No migration needed!
const contact = {
  name: "John Contractor",
  is_contractor_1099: true,
  custom_fields: {
    license_number: "CA-12345",
    insurance_expiry: "2025-12-31",
    specialty: "residential",
    hourly_rate: 75.00,
    languages: ["English", "Spanish"],
    certifications: ["OSHA", "Arc Flash"],
    // Add whatever you need!
  }
}
```

### **Example 2: Add a new contact type**
```typescript
// Just add a new boolean flag!
ALTER TABLE contacts ADD COLUMN is_inspector BOOLEAN DEFAULT false;

// Or use custom_fields without migration:
custom_fields: {
  contact_type: "inspector",
  inspection_areas: ["electrical", "plumbing"]
}
```

### **Example 3: Add new document type**
```sql
-- Update the constraint to add new types
ALTER TABLE financial_documents
DROP CONSTRAINT financial_documents_document_type_check;

ALTER TABLE financial_documents
ADD CONSTRAINT financial_documents_document_type_check
CHECK (document_type IN (
  'invoice', 'estimate', 'work_order', 'quote',
  'proposal', 'contract', 'receipt', 'credit_note',
  'purchase_order', 'maintenance_agreement'  -- NEW!
));
```

---

## 🔄 **Future Migrations**

When you need to add new features:

1. Create new migration file:
   ```bash
   database/migrations/004_add_new_feature.sql
   ```

2. Write your changes:
   ```sql
   -- Migration 004: Add messaging system
   CREATE TABLE messages (...);
   ```

3. Run in Supabase SQL Editor

4. Track in version control

---

## 🌐 **Hosting on Vercel/Railway/Render**

### **Vercel**
1. Connect your GitHub repo
2. Add environment variables (Supabase URLs)
3. Deploy!

### **Railway**
1. New Project > Deploy from GitHub
2. Add Supabase environment variables
3. Deploy!

### **Render**
1. New Web Service > Connect GitHub
2. Add environment variables
3. Deploy!

**All platforms work with Supabase!** The database is remote and accessible from anywhere.

---

## 📝 **Testing Your Setup**

### **1. Test Authentication**
```typescript
// Sign up a test user
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'testpassword123'
})
```

### **2. Test Creating Data**
```typescript
// Create a contact (RLS will auto-filter by user)
const { data, error } = await supabase
  .from('contacts')
  .insert({
    name: 'Test Contact',
    email: 'test@contact.com',
    is_client: true,
    custom_fields: { vip: true }
  })
```

### **3. Test RLS**
```typescript
// Try to read all contacts (will only see your own!)
const { data } = await supabase
  .from('contacts')
  .select('*')

// You'll only see contacts from companies you belong to
```

---

## 🆘 **Troubleshooting**

### **"No rows returned" - is that good?**
✅ Yes! It means the SQL ran successfully without errors.

### **"Permission denied" when inserting data**
- Make sure RLS policies are set up (run `002_row_level_security.sql`)
- Make sure you're authenticated (`supabase.auth.getUser()`)

### **Can't see data from other users**
✅ That's correct! RLS is working. Users are isolated.

### **How do I add a new field?**
Just use `custom_fields` JSONB - no migration needed!

---

## 🎯 **Next Steps**

1. ✅ Create Supabase project
2. ✅ Run `schema.sql`
3. ✅ Run `002_row_level_security.sql`
4. ✅ Add environment variables to your app
5. 🚀 Start building!

---

## 📚 **Resources**

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [JSONB in PostgreSQL](https://www.postgresql.org/docs/current/datatype-json.html)

---

## 🎉 **You're Ready!**

Your database is now:
- ✅ Flexible (add features without migrations)
- ✅ Secure (RLS multi-tenant isolation)
- ✅ Scalable (works with Vercel/Railway/Render)
- ✅ Future-proof (infinite customization)

**Happy building!** 🚀
