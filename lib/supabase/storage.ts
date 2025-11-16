import { createClient } from './client'

/**
 * Supabase Storage Buckets Configuration
 *
 * Buckets to create in Supabase Dashboard:
 * 1. receipts - Receipt images and scans
 * 2. photos - Job site photos for AI analysis
 * 3. documents - Generated PDFs (invoices, estimates, work orders)
 * 4. avatars - User profile pictures
 * 5. logos - Company logos and branding
 * 6. attachments - General file attachments
 */

// Storage bucket names
export const BUCKETS = {
  RECEIPTS: 'receipts',
  PHOTOS: 'photos',
  DOCUMENTS: 'documents',
  AVATARS: 'avatars',
  LOGOS: 'logos',
  ATTACHMENTS: 'attachments',
} as const

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: {
    cacheControl?: string
    upsert?: boolean
  }
) {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      upsert: options?.upsert || false,
    })

  if (error) {
    console.error(`[Storage] Upload failed:`, error)
    throw error
  }

  return data
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Get signed URL for private files (expires in 1 hour)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
) {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    console.error(`[Storage] Get signed URL failed:`, error)
    throw error
  }

  return data.signedUrl
}

/**
 * Delete a file from storage
 */
export async function deleteFile(bucket: string, path: string) {
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    console.error(`[Storage] Delete failed:`, error)
    throw error
  }
}

/**
 * Upload receipt image
 */
export async function uploadReceipt(
  userId: string,
  receiptId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${receiptId}.${ext}`

  await uploadFile(BUCKETS.RECEIPTS, path, file)
  return getPublicUrl(BUCKETS.RECEIPTS, path)
}

/**
 * Upload job site photo for AI analysis
 */
export async function uploadPhoto(
  userId: string,
  photoId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${photoId}.${ext}`

  await uploadFile(BUCKETS.PHOTOS, path, file)
  return getPublicUrl(BUCKETS.PHOTOS, path)
}

/**
 * Upload generated PDF document
 */
export async function uploadDocument(
  userId: string,
  documentId: string,
  documentType: string,
  pdfBlob: Blob
): Promise<string> {
  const path = `${userId}/${documentType}/${documentId}.pdf`

  await uploadFile(BUCKETS.DOCUMENTS, path, pdfBlob, {
    cacheControl: '3600',
    upsert: true,
  })

  return getPublicUrl(BUCKETS.DOCUMENTS, path)
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${userId}.${ext}`

  await uploadFile(BUCKETS.AVATARS, path, file, { upsert: true })
  return getPublicUrl(BUCKETS.AVATARS, path)
}

/**
 * Upload company logo
 */
export async function uploadLogo(
  companyId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${companyId}.${ext}`

  await uploadFile(BUCKETS.LOGOS, path, file, { upsert: true })
  return getPublicUrl(BUCKETS.LOGOS, path)
}

/**
 * List all files in a user's folder
 */
export async function listUserFiles(bucket: string, userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(userId, {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    })

  if (error) {
    console.error(`[Storage] List files failed:`, error)
    throw error
  }

  return data
}

/**
 * Get storage usage stats for a user
 */
export async function getStorageUsage(userId: string): Promise<{
  receipts: number
  photos: number
  documents: number
  total: number
}> {
  const buckets = [BUCKETS.RECEIPTS, BUCKETS.PHOTOS, BUCKETS.DOCUMENTS]
  const usage = {
    receipts: 0,
    photos: 0,
    documents: 0,
    total: 0,
  }

  for (const bucket of buckets) {
    try {
      const files = await listUserFiles(bucket, userId)
      const bucketSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0)

      if (bucket === BUCKETS.RECEIPTS) usage.receipts = bucketSize
      if (bucket === BUCKETS.PHOTOS) usage.photos = bucketSize
      if (bucket === BUCKETS.DOCUMENTS) usage.documents = bucketSize

      usage.total += bucketSize
    } catch (error) {
      console.error(`[Storage] Failed to get usage for ${bucket}:`, error)
    }
  }

  return usage
}
