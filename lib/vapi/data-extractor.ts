/**
 * Data Extraction from VAPI Transcripts
 * Uses NLP and pattern matching to extract customer information from call transcripts
 */

import { ExtractedData, CallUrgency } from '@/lib/types/vapi'

/**
 * Extract customer data from transcript
 */
export function extractDataFromTranscript(transcript: string): ExtractedData {
  const data: ExtractedData = {}

  // Extract name
  data.customerName = extractName(transcript)

  // Extract phone number
  data.customerPhone = extractPhoneNumber(transcript)

  // Extract email
  data.customerEmail = extractEmail(transcript)

  // Extract address
  data.address = extractAddress(transcript)

  // Extract service requested
  data.serviceRequested = extractServiceType(transcript)

  // Extract date and time preferences
  const dateTime = extractDateTime(transcript)
  data.preferredDate = dateTime.date
  data.preferredTime = dateTime.time

  // Extract urgency level
  data.urgency = extractUrgency(transcript)

  // Extract budget/price expectations
  data.budget = extractBudget(transcript)

  // Extract additional notes
  data.notes = extractNotes(transcript)

  return data
}

/**
 * Extract name from transcript
 */
function extractName(transcript: string): string | undefined {
  const namePatterns = [
    /my name is ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
    /this is ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
    /I'm ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
    /call me ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
    /speaking with ([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i
  ]

  for (const pattern of namePatterns) {
    const match = transcript.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  return undefined
}

/**
 * Extract phone number from transcript
 */
function extractPhoneNumber(transcript: string): string | undefined {
  // Remove common phone number words
  const normalized = transcript
    .replace(/\b(phone|number|call|reach|contact)\b/gi, '')
    .replace(/\b(at|is|me)\b/gi, '')

  // Patterns for phone numbers
  const phonePatterns = [
    /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/,
    /\((\d{3})\)\s*(\d{3})[-.\s]?(\d{4})/,
    /(\d{10})/
  ]

  for (const pattern of phonePatterns) {
    const match = normalized.match(pattern)
    if (match) {
      const phone = match[0].replace(/[^\d]/g, '')
      if (phone.length === 10) {
        return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`
      }
    }
  }

  return undefined
}

/**
 * Extract email from transcript
 */
function extractEmail(transcript: string): string | undefined {
  const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/
  const match = transcript.match(emailPattern)
  return match ? match[1] : undefined
}

/**
 * Extract address from transcript
 */
function extractAddress(transcript: string): string | undefined {
  // Look for address patterns
  const addressPatterns = [
    /(\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Circle|Cir))/i,
    /(?:address|location|site|property)\s+(?:is|at)?\s*([^\n.?!]+)/i
  ]

  for (const pattern of addressPatterns) {
    const match = transcript.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  return undefined
}

/**
 * Extract service type from transcript
 */
function extractServiceType(transcript: string): string | undefined {
  const lowerTranscript = transcript.toLowerCase()

  // Electrical service keywords
  const serviceKeywords = {
    'Panel Upgrade': ['panel', 'upgrade panel', 'electrical panel', 'breaker box', 'fuse box'],
    'Outlet Installation': ['outlet', 'plug', 'receptacle', 'socket'],
    'Wiring': ['wiring', 'rewire', 'wire', 'electrical wiring'],
    'Light Fixture': ['light', 'fixture', 'lighting', 'chandelier', 'lamp'],
    'Circuit Breaker': ['breaker', 'circuit breaker', 'tripped breaker'],
    'GFCI Installation': ['gfci', 'ground fault'],
    'Generator Installation': ['generator', 'backup power', 'standby generator'],
    'EV Charger': ['ev charger', 'electric vehicle', 'car charger', 'tesla charger'],
    'Ceiling Fan': ['ceiling fan', 'fan installation'],
    'Smoke Detector': ['smoke detector', 'smoke alarm', 'carbon monoxide'],
    'Inspection': ['inspection', 'inspect', 'check'],
    'Emergency Repair': ['emergency', 'urgent', 'power out', 'no power', 'sparking'],
    'General Electrical': ['electrical', 'electrician', 'electrical work']
  }

  // Find matching service
  for (const [service, keywords] of Object.entries(serviceKeywords)) {
    for (const keyword of keywords) {
      if (lowerTranscript.includes(keyword)) {
        return service
      }
    }
  }

  return 'General Electrical Service'
}

/**
 * Extract date and time from transcript
 */
function extractDateTime(transcript: string): { date?: string; time?: string } {
  const result: { date?: string; time?: string } = {}

  // Extract dates
  const datePatterns = [
    // Specific dates
    /(?:on\s+)?(\w+\s+\d{1,2}(?:st|nd|rd|th)?(?:\s+\d{4})?)/i,
    // Days of week
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    // Relative dates
    /(today|tomorrow|next week|this week)/i
  ]

  for (const pattern of datePatterns) {
    const match = transcript.match(pattern)
    if (match) {
      result.date = match[1]
      break
    }
  }

  // Extract times
  const timePatterns = [
    /(\d{1,2}:\d{2}\s*(?:am|pm))/i,
    /(\d{1,2}\s*(?:am|pm))/i,
    /(morning|afternoon|evening)/i
  ]

  for (const pattern of timePatterns) {
    const match = transcript.match(pattern)
    if (match) {
      result.time = match[1]
      break
    }
  }

  return result
}

/**
 * Extract urgency level from transcript
 */
function extractUrgency(transcript: string): CallUrgency {
  const lowerTranscript = transcript.toLowerCase()

  // Emergency keywords
  const emergencyKeywords = [
    'emergency',
    'urgent',
    'asap',
    'right away',
    'immediately',
    'sparking',
    'smoke',
    'burning smell',
    'no power',
    'power out'
  ]

  for (const keyword of emergencyKeywords) {
    if (lowerTranscript.includes(keyword)) {
      return CallUrgency.EMERGENCY
    }
  }

  // Scheduled keywords
  const scheduledKeywords = [
    'appointment',
    'schedule',
    'book',
    'set up',
    'plan for',
    'next week',
    'next month'
  ]

  for (const keyword of scheduledKeywords) {
    if (lowerTranscript.includes(keyword)) {
      return CallUrgency.SCHEDULED
    }
  }

  return CallUrgency.ROUTINE
}

/**
 * Extract budget/price expectations
 */
function extractBudget(transcript: string): number | undefined {
  // Look for dollar amounts
  const budgetPatterns = [
    /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/,
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*dollars?/i
  ]

  for (const pattern of budgetPatterns) {
    const match = transcript.match(pattern)
    if (match) {
      const amount = match[1].replace(/,/g, '')
      return parseFloat(amount)
    }
  }

  return undefined
}

/**
 * Extract additional notes from transcript
 */
function extractNotes(transcript: string): string {
  // Extract important information that doesn't fit other categories
  const notes: string[] = []

  // Look for problem descriptions
  const problemPatterns = [
    /(?:problem|issue|concern)\s+(?:is|with)?\s*([^\n.?!]+)/i,
    /(?:having trouble|difficulty)\s+(?:with)?\s*([^\n.?!]+)/i
  ]

  for (const pattern of problemPatterns) {
    const match = transcript.match(pattern)
    if (match) {
      notes.push(match[1].trim())
    }
  }

  // Look for special requirements
  const requirementPatterns = [
    /(?:need|require|must)\s+([^\n.?!]+)/i,
    /(?:prefer|would like)\s+([^\n.?!]+)/i
  ]

  for (const pattern of requirementPatterns) {
    const match = transcript.match(pattern)
    if (match) {
      notes.push(match[1].trim())
    }
  }

  return notes.join('; ')
}

/**
 * Parse natural language date to Date object
 */
export function parseNaturalLanguageDate(dateStr: string): Date | null {
  const lowerDate = dateStr.toLowerCase().trim()
  const today = new Date()

  // Handle relative dates
  if (lowerDate === 'today') {
    return today
  }

  if (lowerDate === 'tomorrow') {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  }

  // Days of week
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayIndex = daysOfWeek.indexOf(lowerDate)

  if (dayIndex !== -1) {
    const targetDay = new Date(today)
    const currentDay = today.getDay()
    let daysToAdd = dayIndex - currentDay

    if (daysToAdd <= 0) {
      daysToAdd += 7 // Next week
    }

    targetDay.setDate(targetDay.getDate() + daysToAdd)
    return targetDay
  }

  // Try to parse as regular date
  try {
    const parsed = new Date(dateStr)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
  } catch (error) {
    console.error('Failed to parse date:', error)
  }

  return null
}

/**
 * Parse natural language time to 24-hour format
 */
export function parseNaturalLanguageTime(timeStr: string): string | null {
  const lowerTime = timeStr.toLowerCase().trim()

  // Handle time ranges
  if (lowerTime === 'morning') {
    return '09:00'
  }
  if (lowerTime === 'afternoon') {
    return '14:00'
  }
  if (lowerTime === 'evening') {
    return '18:00'
  }

  // Parse standard time format
  const timePattern = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i
  const match = lowerTime.match(timePattern)

  if (match) {
    let hours = parseInt(match[1])
    const minutes = match[2] ? parseInt(match[2]) : 0
    const meridiem = match[3]?.toLowerCase()

    // Convert to 24-hour format
    if (meridiem === 'pm' && hours !== 12) {
      hours += 12
    } else if (meridiem === 'am' && hours === 12) {
      hours = 0
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  return null
}

/**
 * Validate extracted data
 */
export function validateExtractedData(data: ExtractedData): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check for minimum required data
  if (!data.customerName && !data.customerPhone) {
    errors.push('Missing customer contact information (name or phone required)')
  }

  if (data.customerPhone && !isValidPhoneNumber(data.customerPhone)) {
    errors.push('Invalid phone number format')
  }

  if (data.customerEmail && !isValidEmail(data.customerEmail)) {
    errors.push('Invalid email address format')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate phone number
 */
function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/
  return phoneRegex.test(phone)
}

/**
 * Validate email address
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
