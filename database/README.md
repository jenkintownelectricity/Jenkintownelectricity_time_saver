# Database Setup Instructions

## Overview
This database schema is **100% portable** and can be deployed to ANY PostgreSQL host while you maintain complete ownership and control of your data.

## Deployment Options

### Option 1: Vercel + Neon (Recommended for Easy Deployment)
**Best for:** Quick deployment, automatic scaling
**Cost:** Free tier available

1. Create account at [Neon.tech](https://neon.tech)
2. Create new database
3. Copy connection string
4. Add to Vercel environment variables

### Option 2: Vercel + Supabase
**Best for:** Built-in auth, realtime features
**Cost:** Free tier available

1. Create account at [Supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Database > Connection String
4. Copy connection string
5. Add to Vercel environment variables

### Option 3: Your Own VPS/Server
**Best for:** Complete control, custom requirements
**Cost:** Depends on VPS provider

1. Install PostgreSQL on your server
2. Create database: `createdb appio_ai`
3. Run schema.sql
4. Configure firewall/security

### Option 4: AWS RDS, Google Cloud SQL, Azure, etc.
**Best for:** Enterprise needs, existing cloud infrastructure
**Cost:** Varies by provider

1. Create PostgreSQL instance
2. Configure security groups
3. Run schema.sql
4. Get connection string

## Setup Steps

### 1. Create the Database

#### Using pgAdmin:
1. Open pgAdmin
2. Right-click "Databases" → "Create" → "Database"
3. Name it "appio_ai"
4. Click "Save"
5. Right-click the database → "Query Tool"
6. Open `schema.sql` file
7. Click "Execute" (F5)

#### Using psql command line:
```bash
# Create database
createdb appio_ai

# Run schema
psql -d appio_ai -f database/schema.sql
```

#### Using cloud provider web UI:
1. Most providers have SQL editor
2. Copy entire contents of `schema.sql`
3. Paste and execute

### 2. Configure Environment Variables

Create `.env.local` in your project root:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@host:5432/appio_ai"

# Or for Neon/Supabase with connection pooling:
DATABASE_URL="postgresql://username:password@host:5432/appio_ai?sslmode=require"

# Optional: Direct connection (without pooling)
DIRECT_DATABASE_URL="postgresql://username:password@host:5432/appio_ai"
```

### 3. Install Dependencies

```bash
npm install pg
# or
npm install @vercel/postgres
# or for Prisma ORM:
npm install @prisma/client
```

### 4. Test Connection

Run this test:
```bash
node database/test-connection.js
```

## Data Ownership & Portability

### Export Your Data (Full Backup)
```bash
# Export entire database
pg_dump -h hostname -U username -d appio_ai > backup_$(date +%Y%m%d).sql

# Export only data (no schema)
pg_dump -h hostname -U username -d appio_ai --data-only > data_backup.sql

# Export specific table
pg_dump -h hostname -U username -d appio_ai -t entities > entities_backup.sql
```

### Import/Restore Your Data
```bash
# Restore from backup
psql -h hostname -U username -d appio_ai < backup.sql

# Restore to different database
psql -h new_hostname -U new_username -d new_database < backup.sql
```

### Migrate to Different Provider

**You OWN the data** - you can move it anywhere:

1. **Export from current provider:**
   ```bash
   pg_dump -h old_host -U old_user -d appio_ai > migration_backup.sql
   ```

2. **Create database on new provider:**
   - Run `schema.sql` on new provider
   - Or skip schema if backup includes it

3. **Import to new provider:**
   ```bash
   psql -h new_host -U new_user -d appio_ai < migration_backup.sql
   ```

4. **Update environment variable:**
   - Change `DATABASE_URL` to new connection string
   - Deploy updated config

**That's it!** Your app now connects to the new database.

## Security Best Practices

### 1. Connection String Security
- ✅ **DO:** Store in environment variables
- ✅ **DO:** Use connection pooling
- ✅ **DO:** Enable SSL (sslmode=require)
- ❌ **DON'T:** Commit connection strings to git
- ❌ **DON'T:** Expose in client-side code

### 2. Database User Permissions
Create dedicated user with limited permissions:
```sql
-- Create app user
CREATE USER appio_app WITH PASSWORD 'strong_password';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE appio_ai TO appio_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO appio_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO appio_app;
```

### 3. Backups
- **Automated:** Set up daily backups (most providers offer this)
- **Manual:** Run weekly backups to your own storage
- **Test restores:** Verify backups work before you need them

### 4. Monitoring
- Enable query logging
- Set up alerts for slow queries
- Monitor database size and connections

## Database Maintenance

### Regular Tasks

**Weekly:**
- Review slow queries
- Check database size
- Test backup restore

**Monthly:**
- Vacuum analyze tables
- Review and optimize indexes
- Update statistics

**Quarterly:**
- Review and archive old data
- Audit user permissions
- Update PostgreSQL version (if applicable)

### Useful Queries

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('appio_ai'));

-- Check table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Count records per entity type
SELECT entity_type, COUNT(*)
FROM entities
GROUP BY entity_type
ORDER BY COUNT(*) DESC;

-- Check connection count
SELECT count(*) FROM pg_stat_activity;
```

## Troubleshooting

### Connection Issues
```bash
# Test connection
psql -h hostname -U username -d appio_ai -c "SELECT version();"

# Check if database exists
psql -h hostname -U username -l | grep appio_ai
```

### Schema Issues
```bash
# Re-run schema (will show errors for existing objects)
psql -h hostname -U username -d appio_ai -f database/schema.sql

# Drop and recreate (WARNING: deletes all data)
dropdb appio_ai && createdb appio_ai
psql -h hostname -U username -d appio_ai -f database/schema.sql
```

### Performance Issues
```sql
-- Rebuild indexes
REINDEX DATABASE appio_ai;

-- Update statistics
ANALYZE;

-- Find slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Migration Guide

If you already have data in localStorage, we'll create a migration script to move it to PostgreSQL.

See `database/migrate-from-localstorage.ts` for the migration tool.

## Support & Resources

- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **pgAdmin:** https://www.pgadmin.org/
- **Neon Docs:** https://neon.tech/docs/
- **Supabase Docs:** https://supabase.com/docs

## Your Data, Your Control

This setup ensures:
- ✅ You own the schema
- ✅ You own the data
- ✅ You can backup anytime
- ✅ You can migrate anywhere
- ✅ No vendor lock-in
- ✅ Full SQL access
- ✅ Complete control
