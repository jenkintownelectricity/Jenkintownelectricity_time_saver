/**
 * Input validation utilities for form fields
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }

  return { isValid: true }
}

/**
 * Validates phone number format
 * Accepts various formats: (123) 456-7890, 123-456-7890, 1234567890, etc.
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' }
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '')

  if (digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number must be at least 10 digits' }
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number is too long' }
  }

  return { isValid: true }
}

/**
 * Validates required text field
 */
export function validateRequired(value: string, fieldName: string = 'This field'): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` }
  }

  return { isValid: true }
}

/**
 * Validates text length
 */
export function validateLength(
  value: string,
  min?: number,
  max?: number,
  fieldName: string = 'This field'
): ValidationResult {
  const length = value.trim().length

  if (min !== undefined && length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters` }
  }

  if (max !== undefined && length > max) {
    return { isValid: false, error: `${fieldName} must not exceed ${max} characters` }
  }

  return { isValid: true }
}

/**
 * Validates company code format (ABC-DEF)
 */
export function validateCompanyCode(code: string): ValidationResult {
  if (!code) {
    return { isValid: false, error: 'Company code is required' }
  }

  const codeRegex = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/
  if (!codeRegex.test(code)) {
    return { isValid: false, error: 'Company code must be in format ABC-DEF (3 characters, dash, 3 characters)' }
  }

  return { isValid: true }
}

/**
 * Validates URL format
 */
export function validateUrl(url: string): ValidationResult {
  if (!url) {
    return { isValid: false, error: 'URL is required' }
  }

  try {
    new URL(url)
    return { isValid: true }
  } catch {
    return { isValid: false, error: 'Invalid URL format' }
  }
}

/**
 * Validates positive number
 */
export function validatePositiveNumber(value: number | string, fieldName: string = 'Value'): ValidationResult {
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a number` }
  }

  if (num <= 0) {
    return { isValid: false, error: `${fieldName} must be greater than 0` }
  }

  return { isValid: true }
}

/**
 * Sanitizes string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}
