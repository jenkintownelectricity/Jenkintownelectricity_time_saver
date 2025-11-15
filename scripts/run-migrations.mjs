#!/usr/bin/env node

/**
 * Supabase Migration Runner
 *
 * Automatically runs database migrations using Supabase REST API
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env.local
const envPath = join(__dirname, '../.env.local')
const envContent = readFileSync(envPath, 'utf8')
const env = Object.fromEntries(
  envContent
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('='))
    .map(([key, ...values]) => [key.trim(), values.join('=').trim()])
)

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

async function executeSQLFile(filePath, description) {
  console.log(`\n📄 ${description}`)
  console.log(`   Reading: ${filePath}`)

  try {
    const sql = readFileSync(filePath, 'utf8')

    console.log(`   Executing SQL... (${sql.length} characters)`)

    // Use Supabase's PostgREST API to execute raw SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`HTTP ${response.status}: ${error}`)
    }

    console.log(`   ✅ Success!`)
    return true

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 Supabase Migration Runner')
  console.log('================================\n')

  // Check for service role key
  if (!serviceRoleKey) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local\n')
    console.log('To get your service role key:')
    console.log('  1. Go to: https://etofgqxycitcmkvbjidw.supabase.co')
    console.log('  2. Click: Project Settings → API')
    console.log('  3. Copy: service_role key (under "Project API keys")')
    console.log('  4. Add to .env.local:')
    console.log('     SUPABASE_SERVICE_ROLE_KEY=eyJhbG...\n')
    console.log('⚠️  Keep this key SECRET - it has admin access!\n')
    process.exit(1)
  }

  const migrations = [
    {
      file: join(__dirname, '../database/schema.sql'),
      description: 'Creating tables, indexes, and triggers'
    },
    {
      file: join(__dirname, '../database/migrations/002_row_level_security.sql'),
      description: 'Setting up Row Level Security policies'
    }
  ]

  let success = true

  for (const migration of migrations) {
    const result = await executeSQLFile(migration.file, migration.description)
    if (!result) {
      success = false
      break
    }
  }

  console.log('\n================================')

  if (success) {
    console.log('✅ Database setup complete!\n')
    console.log('Verify in Supabase Dashboard:')
    console.log('  → Table Editor (should see 7 tables)')
    console.log('  → SQL Editor (run: SELECT tablename FROM pg_tables WHERE schemaname = \'public\';)\n')
  } else {
    console.log('❌ Migration failed\n')
    console.log('Manual alternative:')
    console.log('  1. Open Supabase Dashboard → SQL Editor')
    console.log('  2. Copy all content from: database/schema.sql')
    console.log('  3. Paste in SQL Editor and click Run')
    console.log('  4. Repeat for: database/migrations/002_row_level_security.sql\n')
  }
}

main().catch(console.error)
