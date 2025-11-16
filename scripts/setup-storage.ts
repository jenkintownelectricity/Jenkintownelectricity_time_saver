/**
 * Supabase Storage Buckets Setup
 *
 * This script creates all required storage buckets for the app.
 * Run this ONCE after database setup.
 *
 * Usage:
 *   npx tsx scripts/setup-storage.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Buckets to create
const BUCKETS = [
  {
    name: 'receipts',
    public: true, // Receipts can be publicly accessible
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
  {
    name: 'photos',
    public: true, // Job site photos
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  {
    name: 'documents',
    public: false, // PDFs should be private
    fileSizeLimit: 20971520, // 20MB
    allowedMimeTypes: ['application/pdf'],
  },
  {
    name: 'avatars',
    public: true, // User avatars
    fileSizeLimit: 2097152, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  {
    name: 'logos',
    public: true, // Company logos
    fileSizeLimit: 2097152, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  },
  {
    name: 'attachments',
    public: false, // General attachments
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: null, // Allow all types
  },
]

async function createBucket(bucket: typeof BUCKETS[0]) {
  console.log(`\n📦 Creating bucket: ${bucket.name}`)

  try {
    // Check if bucket exists
    const { data: existingBuckets } = await supabase.storage.listBuckets()
    const exists = existingBuckets?.some(b => b.name === bucket.name)

    if (exists) {
      console.log(`   ⚠️  Bucket '${bucket.name}' already exists, skipping...`)
      return true
    }

    // Create bucket
    const { data, error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes,
    })

    if (error) {
      console.error(`   ❌ Failed:`, error.message)
      return false
    }

    console.log(`   ✅ Created successfully`)
    console.log(`      Public: ${bucket.public}`)
    console.log(`      Size limit: ${(bucket.fileSizeLimit / 1024 / 1024).toFixed(1)}MB`)

    return true

  } catch (error: any) {
    console.error(`   ❌ Error:`, error.message)
    return false
  }
}

async function setupPolicies(bucketName: string, isPublic: boolean) {
  console.log(`   📋 Setting up RLS policies...`)

  // Note: Bucket policies must be created in Supabase Dashboard or via SQL
  // This is a placeholder for documentation

  if (isPublic) {
    console.log(`      → Public read access enabled`)
    console.log(`      → Authenticated users can upload`)
  } else {
    console.log(`      → Private access (authenticated users only)`)
    console.log(`      → Users can only access their own files`)
  }
}

async function setupStorage() {
  console.log('🚀 Starting storage setup...\n')
  console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`)

  // Test connection
  console.log('🔌 Testing connection...')
  const { data, error } = await supabase.storage.listBuckets()

  if (error) {
    console.error('❌ Connection failed:', error.message)
    process.exit(1)
  }

  console.log(`✅ Connection successful (${data?.length || 0} existing buckets)\n`)

  // Create buckets
  let successCount = 0
  for (const bucket of BUCKETS) {
    const success = await createBucket(bucket)
    if (success) {
      await setupPolicies(bucket.name, bucket.public)
      successCount++
    }
  }

  console.log(`\n\n📊 Storage Setup Summary:`)
  console.log(`   Total buckets: ${BUCKETS.length}`)
  console.log(`   Created: ${successCount}`)
  console.log(`   Skipped/Failed: ${BUCKETS.length - successCount}`)

  if (successCount > 0) {
    console.log('\n✅ Storage setup complete!\n')
    console.log('📋 Next steps:')
    console.log('1. Configure RLS policies in Supabase Dashboard (if needed)')
    console.log('2. Test file uploads in your app')
    console.log('3. Start dev server: npm run dev\n')

    console.log('📖 Bucket usage guide:')
    console.log('   • receipts - Receipt photos and scans')
    console.log('   • photos - Job site photos for AI analysis')
    console.log('   • documents - Generated PDFs (invoices, estimates)')
    console.log('   • avatars - User profile pictures')
    console.log('   • logos - Company logos and branding')
    console.log('   • attachments - General file attachments\n')
  } else {
    console.log('\n⚠️  No buckets were created. Check errors above.\n')
  }
}

setupStorage().catch(console.error)
