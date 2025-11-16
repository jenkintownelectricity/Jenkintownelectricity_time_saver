import { NextRequest, NextResponse } from 'next/server'
import Tesseract from 'tesseract.js'
import { OCRResult, ReceiptCategory } from '@/lib/types/receipts'

/**
 * OCR API Route for Receipt Processing
 *
 * This endpoint accepts an image file and extracts text using Tesseract.js
 * Then attempts to parse vendor, date, amount, and category from the text
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Perform OCR
    const { data } = await Tesseract.recognize(buffer, 'eng', {
      logger: (m) => {
        // Optional: log progress
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
        }
      },
    })

    const rawText = data.text

    // Parse extracted text
    const result = parseReceiptText(rawText)

    return NextResponse.json(result)
  } catch (error) {
    console.error('OCR processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
}

/**
 * Parse receipt text to extract structured data
 */
function parseReceiptText(text: string): OCRResult {
  const lines = text.split('\n').filter((line) => line.trim())

  // Initialize result
  const result: OCRResult = {
    rawText: text,
    confidence: 0.5, // Default confidence
  }

  // Extract vendor (usually first few lines)
  const vendorLine = lines.slice(0, 3).find((line) => {
    // Look for lines that might be vendor names
    return line.length > 2 && line.length < 50 && !line.match(/^\d/)
  })
  if (vendorLine) {
    result.vendor = vendorLine.trim()
  }

  // Extract amount (look for currency patterns)
  const amountPattern = /\$?\s*(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)/g
  const amounts: number[] = []
  let match

  while ((match = amountPattern.exec(text)) !== null) {
    const amount = parseFloat(match[1].replace(/,/g, ''))
    if (amount > 0 && amount < 1000000) {
      amounts.push(amount)
    }
  }

  // Usually the largest amount is the total
  if (amounts.length > 0) {
    result.amount = Math.max(...amounts)
  }

  // Extract date
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
    /(\d{1,2}-\d{1,2}-\d{2,4})/,
    /(\d{4}-\d{2}-\d{2})/,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/i,
  ]

  for (const pattern of datePatterns) {
    const dateMatch = text.match(pattern)
    if (dateMatch) {
      result.date = dateMatch[0]
      break
    }
  }

  // Attempt to categorize based on vendor or keywords
  result.category = categorizeReceipt(text)

  // Extract description (use vendor or first meaningful line)
  result.description = result.vendor || lines[0]?.substring(0, 100) || 'Receipt'

  // Increase confidence if we found key fields
  let foundFields = 0
  if (result.vendor) foundFields++
  if (result.amount) foundFields++
  if (result.date) foundFields++
  if (result.category && result.category !== ReceiptCategory.OTHER) foundFields++

  result.confidence = Math.min(0.3 + (foundFields * 0.2), 1.0)

  return result
}

/**
 * Categorize receipt based on keywords
 */
function categorizeReceipt(text: string): ReceiptCategory {
  const lowerText = text.toLowerCase()

  // Define keyword mappings
  const categoryKeywords: Record<ReceiptCategory, string[]> = {
    [ReceiptCategory.MATERIALS]: [
      'home depot',
      'lowes',
      'lumber',
      'plywood',
      'hardware',
      'building materials',
      'supply',
    ],
    [ReceiptCategory.TOOLS]: [
      'tool',
      'drill',
      'saw',
      'hammer',
      'milwaukee',
      'dewalt',
      'makita',
    ],
    [ReceiptCategory.EQUIPMENT]: [
      'equipment',
      'machinery',
      'generator',
      'compressor',
      'ladder',
    ],
    [ReceiptCategory.FUEL]: [
      'gas',
      'fuel',
      'shell',
      'exxon',
      'chevron',
      'bp',
      'mobil',
      'gasoline',
    ],
    [ReceiptCategory.VEHICLE]: [
      'auto',
      'car wash',
      'oil change',
      'tire',
      'repair',
      'maintenance',
    ],
    [ReceiptCategory.MEALS]: [
      'restaurant',
      'cafe',
      'pizza',
      'burger',
      'food',
      'mcdonalds',
      'subway',
      'starbucks',
    ],
    [ReceiptCategory.OFFICE]: [
      'staples',
      'office depot',
      'paper',
      'printer',
      'office',
    ],
    [ReceiptCategory.INSURANCE]: ['insurance', 'policy', 'premium'],
    [ReceiptCategory.LICENSES]: ['license', 'permit fee', 'registration'],
    [ReceiptCategory.PERMITS]: ['permit', 'inspection'],
    [ReceiptCategory.EDUCATION]: [
      'training',
      'course',
      'certification',
      'seminar',
      'class',
    ],
    [ReceiptCategory.MARKETING]: [
      'advertising',
      'marketing',
      'business cards',
      'sign',
    ],
    [ReceiptCategory.PHONE]: ['verizon', 'at&t', 't-mobile', 'phone', 'wireless'],
    [ReceiptCategory.INTERNET]: ['internet', 'comcast', 'spectrum', 'wifi'],
    [ReceiptCategory.RENT]: ['rent', 'lease', 'storage'],
    [ReceiptCategory.UTILITIES]: ['electric', 'water', 'utility', 'power', 'gas bill'],
    [ReceiptCategory.LABOR]: ['labor', 'payroll', 'wages'],
    [ReceiptCategory.OTHER]: [],
  }

  // Check each category for keyword matches
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return category as ReceiptCategory
      }
    }
  }

  return ReceiptCategory.OTHER
}
