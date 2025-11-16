# 🚀 Supabase Database Setup Guide

Complete guide to set up your PostgreSQL database with Supabase for infinite scalability.

---

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Project Created**: Create a new Supabase project
3. **Credentials**: Get your project URL and keys from Settings → API

---

## 🔑 Step 1: Configure Environment Variables

Your `.env.local` file should already be created with your credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

✅ **Already done!** Your credentials are configured.

---

## 🗄️ Step 2: Run Database Migrations

### Option A: Automatic Setup (Recommended)

Run the automated setup script:

```bash
# Install tsx (TypeScript executor) if not already installed
npm install -D tsx

# Run database setup
npx tsx scripts/setup-database.ts
```

This will:
- ✅ Test your Supabase connection
- ✅ Run all migrations in order
- ✅ Create all tables, indexes, and functions
- ✅ Set up Row Level Security (RLS)
- ✅ Seed default subscription plans and feature gates

### Option B: Manual Setup (Alternative)

If the automatic setup fails, run migrations manually in Supabase Dashboard:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Click on **SQL Editor** in the left sidebar
3. Copy and paste each file in order:
   - `database/schema.sql` - Main schema with all tables
   - `database/migrations/002_row_level_security.sql` - Security policies
   - `database/migrations/003_seed_data.sql` - Demo data (optional)
   - `database/migrations/004_feature_gates_and_monetization.sql` - Monetization system
   - `database/migrations/005_additional_tables_and_enhancements.sql` - Additional features

4. Click **Run** for each file

---

## 📦 Step 3: Set Up Storage Buckets

Run the storage setup script:

```bash
npx tsx scripts/setup-storage.ts
```

This creates 6 storage buckets:
- **receipts** - Receipt images (10MB limit, public)
- **photos** - Job site photos (10MB limit, public)
- **documents** - Generated PDFs (20MB limit, private)
- **avatars** - User profile pictures (2MB limit, public)
- **logos** - Company logos (2MB limit, public)
- **attachments** - General files (50MB limit, private)

---

## 🔄 Step 4: Migrate Existing Data (Optional)

If you have data in localStorage (from Zustand), migrate it to Supabase:

```typescript
import { migrateZustandToSupabase } from '@/scripts/migrate-zustand-to-supabase'

// Run migration
const result = await migrateZustandToSupabase()
console.log('Migrated:', result.totalMigrated, 'records')
```

Or add a migration button to your settings page:

```tsx
<Button onClick={async () => {
  const result = await migrateZustandToSupabase()
  alert(`Migrated ${result.totalMigrated} records!`)
}}>
  Migrate Data to Supabase
</Button>
```

---

## ✅ Step 5: Verify Setup

Test your database connection:

```bash
npm run dev
```

Then visit:
- `http://localhost:3000/login` - Test authentication
- Check browser console for any Supabase errors

---

## 📊 Database Architecture Overview

### Core Tables (7)
1. **user_profiles** - User accounts and profiles
2. **companies** - Multi-tenant businesses
3. **company_members** - Team membership
4. **contacts** - Universal contact system (clients, vendors, contractors)
5. **financial_documents** - Universal documents (invoices, estimates, work orders)
6. **work_calls** - Uber-style job bidding
7. **call_statistics** - Performance tracking

### Monetization Tables (6)
8. **subscription_plans** - Pricing tiers (Free, Starter, Pro, Enterprise)
9. **user_subscriptions** - User plan tracking
10. **feature_gates** - Developer-controlled feature toggles
11. **user_preferences** - User-controlled preferences
12. **usage_tracking** - Usage quotas and limits
13. **feature_usage_summary** - Aggregated usage stats
14. **feature_audit_log** - Compliance and audit trail

### Additional Tables (5)
15. **notifications** - In-app notifications
16. **email_queue** - Async email sending
17. **webhook_events** - Integration webhooks
18. **api_rate_limits** - Rate limiting
19. **activity_log** - User activity tracking

### Views (2)
- **dashboard_stats** - Fast dashboard queries (materialized)
- **monthly_revenue_stats** - Revenue analytics (materialized)

---

## 🔥 Key Features

### ✅ Universal Tables with Permission Flags
No separate tables for customers/vendors/employees - just toggle flags!

```sql
-- Same contact can be BOTH client AND vendor
UPDATE contacts SET
  is_client = true,
  is_vendor = true
WHERE id = '...';
```

### ✅ JSONB Custom Fields Everywhere
Add any field without migrations:

```sql
UPDATE contacts SET custom_fields = jsonb_set(
  custom_fields,
  '{insurance_expiry}',
  '"2025-12-31"'
);
```

### ✅ Full-Text Search
Lightning-fast search across contacts and documents:

```sql
SELECT * FROM contacts
WHERE search_vector @@ to_tsquery('john & electrician');
```

### ✅ Row Level Security (RLS)
Multi-tenant data isolation - users only see their own data:

```sql
-- Users can only SELECT their own contacts
CREATE POLICY contacts_select ON contacts
  FOR SELECT USING (auth.uid() = user_id);
```

### ✅ Real-time Subscriptions
Instant notifications for work calls:

```typescript
supabase
  .channel('work_calls')
  .on('INSERT', { table: 'work_calls' }, (payload) => {
    showNotification(payload.new)
  })
  .subscribe()
```

---

## 🔧 Maintenance

### Refresh Materialized Views (Run daily)

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_revenue_stats;
```

Or use the helper function:

```sql
SELECT refresh_all_materialized_views();
```

### Clean Up Old Notifications (Run weekly)

```sql
SELECT cleanup_old_notifications();
```

### Retry Failed Webhooks

```sql
SELECT retry_failed_webhooks();
```

---

## 🐛 Troubleshooting

### Error: "relation does not exist"
- **Fix**: Run migrations in order (001, 002, 003, etc.)

### Error: "permission denied for table"
- **Fix**: Check RLS policies or use service role key for admin operations

### Error: "Cannot read properties of null"
- **Fix**: Make sure user is authenticated before querying

### Slow Queries
- **Fix**: Check indexes with `EXPLAIN ANALYZE`
- Refresh materialized views

---

## 📚 Useful SQL Queries

### Get all tables
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### Get table size
```sql
SELECT
  pg_size_pretty(pg_total_relation_size('contacts')) as size;
```

### Check RLS policies
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### See active subscriptions
```sql
SELECT
  up.full_name,
  sp.display_name as plan,
  us.status,
  us.current_period_end
FROM user_subscriptions us
JOIN user_profiles up ON us.user_id = up.id
JOIN subscription_plans sp ON us.plan_id = sp.id;
```

---

## 🎯 Next Steps

1. ✅ Database is set up!
2. 📱 Build your first feature using Supabase
3. 🔄 Set up Realtime notifications
4. 💳 Integrate Stripe for subscriptions
5. 📧 Set up email sending (Resend/SendGrid)

---

## 📞 Support

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Project Issues**: https://github.com/jenkintownelectricity/issues

---

**Built with ❤️ for infinite scalability**
