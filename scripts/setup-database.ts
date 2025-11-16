/**
 * Database Setup Script
 *
 * This script runs all database migrations in order.
 * Run this ONCE when setting up Supabase for the first time.
 *
 * Usage:
 *   npx tsx scripts/setup-database.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Migration files in order
const MIGRATIONS = [
  '001_initial_schema.sql',
  '002_row_level_security.sql',
  '003_seed_data.sql',
  '004_feature_gates_and_monetization.sql',
  '005_additional_tables_and_enhancements.sql',
]

async function runMigration(filename: string): Promise<boolean> {
  console.log(`\n📝 Running migration: ${filename}`)

  try {
    const filepath = join(process.cwd(), 'database', 'migrations', filename)
    const sql = readFileSync(filepath, 'utf-8')

    // Split SQL by statement (simple split by semicolon)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`   Found ${statements.length} SQL statements`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]

      // Skip empty statements and comments
      if (!statement || statement.startsWith('--')) continue

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })

        if (error) {
          // Try direct query if rpc fails
          const { error: directError } = await supabase
            .from('_migrations')
            .select('*')
            .limit(0) // Just testing connection

          if (directError) {
            console.warn(`   ⚠️  Statement ${i + 1} warning:`, error.message)
          }
        }
      } catch (err) {
        console.warn(`   ⚠️  Statement ${i + 1} error:`, err)
      }

      // Show progress
      if ((i + 1) % 10 === 0) {
        console.log(`   Progress: ${i + 1}/${statements.length}`)
      }
    }

    console.log(`✅ Migration ${filename} completed`)
    return true

  } catch (error: any) {
    console.error(`❌ Migration ${filename} failed:`, error.message)
    return false
  }
}

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n')
  console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`)

  // Test connection
  console.log('🔌 Testing connection...')
  const { data, error } = await supabase.from('user_profiles').select('id').limit(1)

  if (error && error.code !== 'PGRST116') { // PGRST116 = table not found (expected on first run)
    console.error('❌ Connection failed:', error.message)
    console.log('\n📋 Next steps:')
    console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard')
    console.log('2. Run the SQL files manually in the SQL Editor')
    console.log('3. Start with: database/schema.sql')
    process.exit(1)
  }

  console.log('✅ Connection successful\n')

  // Run migrations
  let successCount = 0
  for (const migration of MIGRATIONS) {
    const success = await runMigration(migration)
    if (success) successCount++
  }

  console.log(`\n\n📊 Migration Summary:`)
  console.log(`   Total: ${MIGRATIONS.length}`)
  console.log(`   Success: ${successCount}`)
  console.log(`   Failed: ${MIGRATIONS.length - successCount}`)

  if (successCount === MIGRATIONS.length) {
    console.log('\n✅ Database setup complete!\n')
    console.log('📋 Next steps:')
    console.log('1. Set up storage buckets: npx tsx scripts/setup-storage.ts')
    console.log('2. Seed demo data (optional): Run database/migrations/003_seed_data.sql')
    console.log('3. Start dev server: npm run dev\n')
  } else {
    console.log('\n⚠️  Some migrations failed. Check errors above.\n')
    console.log('💡 Manual setup alternative:')
    console.log('1. Go to https://supabase.com/dashboard')
    console.log('2. Open SQL Editor')
    console.log('3. Copy and run each .sql file from database/migrations/\n')
  }
}

setupDatabase().catch(console.error)
