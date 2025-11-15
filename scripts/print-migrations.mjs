#!/usr/bin/env node

/**
 * Migration SQL Printer
 *
 * Prints migration SQL files to the terminal for easy copy-paste
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const migrations = [
  {
    file: join(__dirname, '../database/schema.sql'),
    name: 'SCHEMA (Tables, Indexes, Triggers)',
    step: 1
  },
  {
    file: join(__dirname, '../database/migrations/002_row_level_security.sql'),
    name: 'ROW LEVEL SECURITY POLICIES',
    step: 2
  }
]

console.log('\n' + '='.repeat(80))
console.log('📋 SUPABASE MIGRATION SQL')
console.log('='.repeat(80))
console.log('\nInstructions:')
console.log('  1. Open Supabase Dashboard → SQL Editor → New Query')
console.log('  2. Copy the SQL for each step below')
console.log('  3. Paste into SQL Editor and click Run\n')
console.log('='.repeat(80))

for (const migration of migrations) {
  const content = readFileSync(migration.file, 'utf8')

  console.log(`\n\n${'█'.repeat(80)}`)
  console.log(`█ STEP ${migration.step}: ${migration.name}`)
  console.log(`█ File: ${migration.file.replace(__dirname + '/../', '')}`)
  console.log(`█ Size: ${content.length.toLocaleString()} characters`)
  console.log('█'.repeat(80))
  console.log('\n--- COPY EVERYTHING BELOW THIS LINE ---\n')
  console.log(content)
  console.log('\n--- COPY EVERYTHING ABOVE THIS LINE ---\n')
  console.log(`✅ After running Step ${migration.step}, you should see: "Success. No rows returned"\n`)
}

console.log('\n' + '='.repeat(80))
console.log('✅ DONE!')
console.log('='.repeat(80))
console.log('\nAfter running both steps:')
console.log('  → Check Table Editor - you should see 7 tables')
console.log('  → Tables: user_profiles, companies, company_members, contacts,')
console.log('           financial_documents, work_calls, call_statistics\n')
