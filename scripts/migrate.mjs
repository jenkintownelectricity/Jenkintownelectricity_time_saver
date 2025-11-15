#!/usr/bin/env node

/**
 * Direct Supabase Migration Runner
 * Uses Supabase client to execute SQL
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
const envPath = join(__dirname, '../.env.local')
const envContent = readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...values] = trimmed.split('=')
    if (key && values.length) {
      env[key.trim()] = values.join('=').trim()
    }
  }
})

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing credentials in .env.local')
  process.exit(1)
}

// Create client with service role
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSQLDirect(sqlContent, description) {
  console.log(`\n📝 ${description}`)

  try {
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`   Found ${statements.length} SQL statements`)

    let executed = 0
    for (const statement of statements) {
      if (statement.trim().length > 10) {
        const { error } = await supabase.rpc('exec', { sql: statement + ';' })

        if (error) {
          // Try using pg_query if exec doesn't exist
          const { error: error2 } = await supabase.rpc('pg_query', { query: statement + ';' })

          if (error2) {
            console.error(`   ❌ Failed at statement ${executed + 1}:`, error.message || error2.message)
            return false
          }
        }
        executed++
        if (executed % 10 === 0) {
          process.stdout.write(`   Progress: ${executed}/${statements.length}\r`)
        }
      }
    }

    console.log(`   ✅ Executed ${executed} statements successfully`)
    return true

  } catch (error) {
    console.error(`   ❌ Error:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Supabase Direct Migration')
  console.log('============================')
  console.log(`\n🔗 URL: ${SUPABASE_URL}`)

  // Read SQL files
  const schemaPath = join(__dirname, '../database/schema.sql')
  const rlsPath = join(__dirname, '../database/migrations/002_row_level_security.sql')

  const schema = readFileSync(schemaPath, 'utf8')
  const rls = readFileSync(rlsPath, 'utf8')

  console.log('\n📂 Files loaded:')
  console.log(`   schema.sql: ${schema.length.toLocaleString()} chars`)
  console.log(`   002_row_level_security.sql: ${rls.length.toLocaleString()} chars`)

  // Execute
  const result1 = await executeSQLDirect(schema, 'Creating schema')
  if (!result1) {
    console.log('\n❌ Schema creation failed')
    console.log('\nℹ️  Supabase may not allow SQL execution via RPC.')
    console.log('Please use the manual approach in: database/SETUP_CHECKLIST.md')
    process.exit(1)
  }

  const result2 = await executeSQLDirect(rls, 'Setting up RLS')
  if (!result2) {
    console.log('\n⚠️  RLS setup failed')
    process.exit(1)
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ Database ready!')
  console.log('='.repeat(50))
}

main().catch(console.error)
