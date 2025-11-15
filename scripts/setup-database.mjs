#!/usr/bin/env node

/**
 * Simple Database Setup Script
 *
 * Run this to automatically set up your Supabase database.
 *
 * Usage: node scripts/setup-database.mjs
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read .env.local
function loadEnv() {
  try {
    const envPath = join(__dirname, '../.env.local')
    const content = readFileSync(envPath, 'utf8')

    const env = {}
    content.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=')
        env[key] = values.join('=')
      }
    })
    return env
  } catch (error) {
    console.error('❌ Could not read .env.local file')
    process.exit(1)
  }
}

const env = loadEnv()
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

async function runSQL(sql, description) {
  console.log(`\n📝 ${description}`)

  try {
    // Use Supabase's SQL endpoint
    const url = `${SUPABASE_URL}/rest/v1/rpc/exec`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql })
    })

    if (response.ok) {
      console.log('   ✅ Success')
      return true
    } else {
      const errorText = await response.text()
      console.error(`   ❌ Error: ${errorText}`)
      return false
    }
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 Supabase Database Setup')
  console.log('===========================')

  // Check credentials
  if (!SUPABASE_URL) {
    console.error('\n❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local')
    process.exit(1)
  }

  if (!SERVICE_KEY) {
    console.error('\n❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
    console.log('\n📖 How to get your service role key:')
    console.log('   1. Open: https://etofgqxycitcmkvbjidw.supabase.co')
    console.log('   2. Go to: Project Settings → API')
    console.log('   3. Find: "service_role" key in Project API keys section')
    console.log('   4. Copy and add to .env.local:\n')
    console.log('      SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...\n')
    console.log('   ⚠️  This key is secret - never commit it to git!\n')
    process.exit(1)
  }

  console.log(`\n🔗 Supabase URL: ${SUPABASE_URL}`)
  console.log(`🔑 Service key: ${SERVICE_KEY.substring(0, 20)}...`)

  // Read SQL files
  const schemaPath = join(__dirname, '../database/schema.sql')
  const rlsPath = join(__dirname, '../database/migrations/002_row_level_security.sql')

  console.log('\n📂 Reading migration files...')
  const schema = readFileSync(schemaPath, 'utf8')
  const rls = readFileSync(rlsPath, 'utf8')

  console.log(`   schema.sql: ${schema.length.toLocaleString()} characters`)
  console.log(`   002_row_level_security.sql: ${rls.length.toLocaleString()} characters`)

  // Execute migrations
  console.log('\n⚙️  Running migrations...')

  const result1 = await runSQL(schema, 'Creating tables, indexes, and triggers')
  if (!result1) {
    console.log('\n❌ Failed to run schema.sql')
    console.log('\n💡 Try the manual approach instead:')
    console.log('   See: database/SETUP_CHECKLIST.md')
    process.exit(1)
  }

  const result2 = await runSQL(rls, 'Setting up Row Level Security policies')
  if (!result2) {
    console.log('\n⚠️  Schema created but RLS policies failed')
    console.log('   You may need to run 002_row_level_security.sql manually')
    process.exit(1)
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ Database setup complete!')
  console.log('='.repeat(50))
  console.log('\n🎯 Next steps:')
  console.log('   1. Verify tables: Supabase Dashboard → Table Editor')
  console.log('   2. Check for 7 tables: user_profiles, companies, etc.')
  console.log('   3. Start building your app! 🚀\n')
}

main().catch(error => {
  console.error('\n💥 Unexpected error:', error.message)
  console.log('\n💡 Manual setup instructions: database/SETUP_CHECKLIST.md\n')
  process.exit(1)
})
