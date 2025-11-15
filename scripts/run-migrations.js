#!/usr/bin/env node

/**
 * Supabase Migration Runner
 *
 * This script automatically runs database migrations from the database/ folder.
 *
 * Usage:
 *   node scripts/run-migrations.js
 *
 * Prerequisites:
 *   - SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: Missing Supabase credentials')
  console.error('')
  console.error('Required environment variables:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('The SERVICE_ROLE_KEY is required to create tables.')
  console.error('Find it in: Supabase Dashboard → Project Settings → API → service_role key')
  console.error('')
  console.error('Add it to your .env.local file:')
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here')
  process.exit(1)
}

// Create Supabase client with service role (admin) permissions
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runSQLFile(filePath, description) {
  console.log(`\n📄 Running: ${description}`)
  console.log(`   File: ${filePath}`)

  try {
    const sql = readFileSync(filePath, 'utf8')

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Try direct query instead
      const { error: directError } = await supabase
        .from('_migrations')
        .insert({ name: filePath, executed_at: new Date().toISOString() })

      // If RPC doesn't work, we need to split and execute commands
      // For now, show error and suggest manual approach
      throw new Error(error.message || directError?.message || 'Unknown error')
    }

    console.log(`   ✅ Success!`)
    return true
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 Supabase Migration Runner')
  console.log('================================')

  const migrations = [
    {
      file: join(__dirname, '../database/schema.sql'),
      description: 'Main Schema (Tables, Indexes, Triggers)'
    },
    {
      file: join(__dirname, '../database/migrations/002_row_level_security.sql'),
      description: 'Row Level Security Policies'
    }
  ]

  let allSuccess = true

  for (const migration of migrations) {
    const success = await runSQLFile(migration.file, migration.description)
    if (!success) {
      allSuccess = false
      break
    }
  }

  console.log('\n================================')
  if (allSuccess) {
    console.log('✅ All migrations completed successfully!')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Verify tables in Supabase Dashboard → Table Editor')
    console.log('  2. Test authentication flow')
    console.log('  3. Start building! 🎉')
  } else {
    console.log('❌ Migrations failed')
    console.log('')
    console.log('Alternative approach:')
    console.log('  1. Open Supabase Dashboard → SQL Editor')
    console.log('  2. Copy contents of database/schema.sql')
    console.log('  3. Paste and run in SQL Editor')
    console.log('  4. Repeat for database/migrations/002_row_level_security.sql')
  }
  console.log('')
}

main().catch(console.error)
