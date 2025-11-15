# 🚀 Database Setup Checklist

Quick reference guide to get your database up and running in Supabase.

---

## ✅ Prerequisites (COMPLETED)

- [x] Supabase project created
- [x] Environment variables configured in `.env.local`
- [x] Database schema files created
- [x] Build verified successful

---

## 📋 Setup Steps

### Step 1: Run Main Schema ⭐ **DO THIS FIRST**

1. Open your Supabase Dashboard: https://etofgqxycitcmkvbjidw.supabase.co
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy **ALL** contents from `database/schema.sql`
5. Paste into SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. ✅ Success message: `Success. No rows returned`

**What this does:**
- Creates all tables (user_profiles, companies, contacts, financial_documents, work_calls)
- Sets up indexes for performance
- Creates auto-update triggers for timestamps

---

### Step 2: Run Security Policies ⭐ **DO THIS SECOND**

1. In Supabase SQL Editor, click **New Query**
2. Copy **ALL** contents from `database/migrations/002_row_level_security.sql`
3. Paste into SQL Editor
4. Click **Run**
5. ✅ Success message: `Success. No rows returned`

**What this does:**
- Enables Row Level Security (RLS) on all tables
- Creates policies to protect your data
- Ensures users only see their own data
- Enables network marketplace sharing

---

### Step 3: Verify Tables Created

1. In Supabase Dashboard, go to **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ user_profiles
   - ✅ companies
   - ✅ company_members
   - ✅ contacts
   - ✅ financial_documents
   - ✅ work_calls
   - ✅ call_statistics

If you see all 7 tables, you're ready to go! 🎉

---

### Step 4: Optional - Add Demo Data

⚠️ **Skip this in production!** Only for testing.

1. Open `database/migrations/003_seed_data.sql`
2. Uncomment the sections you want
3. Replace `'YOUR_USER_ID'` with actual user ID from Supabase
4. Run in SQL Editor

---

## 🔍 How to Find User IDs

After you sign up your first test user:

1. Go to **Authentication** > **Users** in Supabase Dashboard
2. Click on the user
3. Copy the **User UID**
4. Use this ID in seed data

---

## 🎯 Next Steps After Database Setup

Once your database is ready:

1. **Create authentication UI** (login/signup pages)
2. **Test user registration** - verify user_profiles are auto-created
3. **Migrate Zustand store** - move from localStorage to Supabase
4. **Add real-time subscriptions** - live updates for work calls
5. **Deploy to Vercel** - go live!

---

## 🆘 Troubleshooting

### "No rows returned" - Is that good?
✅ **YES!** This means SQL executed successfully. It's normal for DDL statements (CREATE TABLE, etc.).

### "Permission denied for schema public"
❌ Check that you're using the correct Supabase project and credentials.

### "Relation already exists"
⚠️ You already ran the schema. To start fresh:
1. Go to **Database** > **Tables** in Supabase
2. Delete all tables manually
3. Re-run schema.sql

### Can't see other users' data
✅ **This is correct!** RLS is working. Each user sees only their own data.

---

## 📊 Database Architecture Summary

Your database uses a **flexible permission-based architecture**:

### Universal Contacts Table
Instead of separate tables for clients/vendors/contractors, everyone is in the `contacts` table with permission flags:
- `is_client` - Turn on for clients
- `is_vendor` - Turn on for vendors
- `is_contractor_1099` - Turn on for contractors
- `is_employee` - Turn on for employees
- **Mix and match!** Same person can be client AND vendor

### Universal Financial Documents
One table for all document types:
- Invoices (`document_type: 'invoice'`)
- Estimates (`document_type: 'estimate'`)
- Work Orders (`document_type: 'work_order'`)
- Add new types without schema changes!

### Infinite Customization
Every table has `custom_fields` JSONB column:
```json
{
  "license_number": "12345",
  "insurance_expiry": "2025-12-31",
  "specialty": "residential",
  "custom_anything": "you want!"
}
```

**No migrations needed!** Just store whatever you need.

---

## ✨ You're All Set!

Your database is production-ready with:
- ✅ Multi-tenant security (RLS)
- ✅ Flexible schema (JSONB custom fields)
- ✅ Scalable architecture (Supabase + PostgreSQL)
- ✅ Authentication ready (Supabase Auth)
- ✅ Network marketplace support
- ✅ Performance optimized (indexes)

**Ready to build!** 🚀
