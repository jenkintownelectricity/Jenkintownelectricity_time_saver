/**
 * Monetization Configuration
 *
 * This file contains all revenue feature toggles and pricing configuration.
 * All features are OFF by default during beta testing.
 *
 * Phase 1 (CURRENT): All toggles = false (Free beta with 5 contractors)
 * Phase 2 (PILOT): Subscriptions + Seat Limits = true (10 companies paying)
 * Phase 3 (FULL): All toggles = true (Full monetization)
 */

export type MonetizationPhase = 'BETA' | 'PILOT' | 'FULL'

export interface SubscriptionTier {
  id: string
  name: string
  price: number
  features: string[]
  maxCompanies: number
  maxTeamMembers: number
  enabled: boolean
}

export const MONETIZATION_CONFIG = {
  // ========================================
  // CURRENT PHASE
  // ========================================
  PHASE: 'BETA' as MonetizationPhase, // Change to 'PILOT' or 'FULL' when ready

  // ========================================
  // FEATURE TOGGLES
  // ========================================

  /**
   * Monthly Subscriptions (Phase 2+)
   * Enable paid subscription tiers and enforce limits
   */
  ENABLE_SUBSCRIPTIONS: false,

  /**
   * Work Call Bidding Bonuses (Phase 3+)
   * Platform takes 15% commission on bonus payouts
   */
  ENABLE_CALL_BONUSES: false,

  /**
   * Per-Call Transaction Fees (Phase 3+)
   * Charge $0.50 per call created
   */
  ENABLE_TRANSACTION_FEES: false,

  /**
   * Premium Integrations (Phase 3+)
   * Lock advanced integrations behind Pro/Enterprise plans
   */
  ENABLE_PREMIUM_INTEGRATIONS: false,

  /**
   * NEC Database Premium (Phase 3+)
   * Limit free lookups, charge for unlimited access
   */
  ENABLE_NEC_PREMIUM: false,

  /**
   * Photo Analysis Credits (Phase 3+)
   * Limit free analyses, charge per photo or unlimited on Pro
   */
  ENABLE_PHOTO_CREDITS: false,

  /**
   * Team Member Seat Limits (Phase 2+)
   * Enforce seat limits per plan, charge for additional seats
   */
  ENABLE_SEAT_LIMITS: false,

  /**
   * Company Network Fees (Phase 3+)
   * Limit free company linking, charge for additional links
   */
  ENABLE_NETWORK_FEES: false,

  /**
   * White Label / Custom Branding (Phase 3+)
   * Enterprise-only custom branding feature
   */
  ENABLE_WHITE_LABEL: false,

  /**
   * API Access (Phase 3+)
   * Charge for API access and webhooks
   */
  ENABLE_API_ACCESS: false,

  // ========================================
  // STRIPE CONFIGURATION
  // ========================================
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',

  // ========================================
  // PRICING CONFIGURATION
  // ========================================

  /**
   * Subscription Tiers
   */
  SUBSCRIPTION_TIERS: {
    starter: {
      id: 'starter',
      name: 'Starter',
      price: 49,
      features: [
        '1 company',
        '3 team members',
        'Basic integrations',
        '20 photo analyses/month',
        '10 NEC lookups/day',
        'Email support',
      ],
      maxCompanies: 1,
      maxTeamMembers: 3,
      enabled: false, // Will enable in Phase 2
    } as SubscriptionTier,

    professional: {
      id: 'professional',
      name: 'Professional',
      price: 99,
      features: [
        '3 companies',
        '10 team members',
        'All integrations',
        'Unlimited photo analyses',
        'Unlimited NEC lookups',
        'Work call bidding',
        'Priority support',
      ],
      maxCompanies: 3,
      maxTeamMembers: 10,
      enabled: false, // Will enable in Phase 2
    } as SubscriptionTier,

    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      features: [
        'Unlimited companies',
        'Unlimited team members',
        'All features',
        'White label branding',
        'API access',
        'Dedicated support',
        'Custom integrations',
      ],
      maxCompanies: -1, // -1 = unlimited
      maxTeamMembers: -1, // -1 = unlimited
      enabled: false, // Will enable in Phase 2
    } as SubscriptionTier,
  },

  /**
   * Work Call Bonuses
   */
  CALL_BONUS_COMMISSION: 0.15, // Platform takes 15% of bonuses
  MIN_PAYOUT_THRESHOLD: 50, // Minimum $50 to trigger payout

  /**
   * Transaction Fees
   */
  TRANSACTION_FEE_PER_CALL: 0.50, // $0.50 per call created
  FREE_CALLS_PER_MONTH: 10, // First 10 calls free per month

  /**
   * NEC Premium
   */
  NEC_PREMIUM_PRICE: 9.99, // $9.99/month add-on
  NEC_FREE_LOOKUPS_PER_DAY: 10, // Free tier: 10 lookups/day

  /**
   * Photo Analysis
   */
  PHOTO_CREDIT_PRICE: 0.25, // $0.25 per analysis
  FREE_PHOTOS_PER_MONTH: 20, // Free tier: 20 photos/month

  /**
   * Additional Seats
   */
  SEAT_PRICE_PER_MONTH: 10, // $10/month per additional seat

  /**
   * Company Network
   */
  FREE_LINKED_COMPANIES: 3, // First 3 links free
  LINKED_COMPANY_PRICE: 5, // $5/month per additional link

  /**
   * White Label
   */
  WHITE_LABEL_PRICE: 99, // +$99/month on Enterprise

  /**
   * API Access
   */
  API_TIER_PRICE: 29, // $29/month for API access
  FREE_API_CALLS_PER_MONTH: 10000, // 10k calls included
  ADDITIONAL_API_CALL_PRICE: 0.01, // $0.01 per call over limit

  // ========================================
  // BETA TESTING CONFIGURATION
  // ========================================

  /**
   * Beta testers (first 5 contractors)
   * These users get lifetime free access or 50% discount
   */
  BETA_TESTER_EMAILS: [] as string[],
  BETA_TESTER_DISCOUNT: 0.50, // 50% lifetime discount

  // ========================================
  // USAGE LIMITS (ENFORCED WHEN ENABLED)
  // ========================================

  /**
   * Get usage limits based on subscription tier
   */
  getUsageLimits: (tier: 'starter' | 'professional' | 'enterprise' | 'free') => {
    if (!MONETIZATION_CONFIG.ENABLE_SUBSCRIPTIONS) {
      // During beta, no limits
      return {
        maxCompanies: -1,
        maxTeamMembers: -1,
        maxPhotosPerMonth: -1,
        maxNECLookupsPerDay: -1,
        maxCallsPerMonth: -1,
      }
    }

    switch (tier) {
      case 'starter':
        return {
          maxCompanies: 1,
          maxTeamMembers: 3,
          maxPhotosPerMonth: 20,
          maxNECLookupsPerDay: 10,
          maxCallsPerMonth: 100,
        }
      case 'professional':
        return {
          maxCompanies: 3,
          maxTeamMembers: 10,
          maxPhotosPerMonth: -1, // unlimited
          maxNECLookupsPerDay: -1, // unlimited
          maxCallsPerMonth: -1, // unlimited
        }
      case 'enterprise':
        return {
          maxCompanies: -1, // unlimited
          maxTeamMembers: -1, // unlimited
          maxPhotosPerMonth: -1, // unlimited
          maxNECLookupsPerDay: -1, // unlimited
          maxCallsPerMonth: -1, // unlimited
        }
      default: // free tier
        return {
          maxCompanies: 1,
          maxTeamMembers: 1,
          maxPhotosPerMonth: 5,
          maxNECLookupsPerDay: 3,
          maxCallsPerMonth: 10,
        }
    }
  },

  /**
   * Check if a feature is available for a given tier
   */
  isFeatureAvailable: (
    feature: 'premium_integrations' | 'call_bonuses' | 'white_label' | 'api_access',
    tier: 'starter' | 'professional' | 'enterprise' | 'free'
  ): boolean => {
    switch (feature) {
      case 'premium_integrations':
        return tier === 'professional' || tier === 'enterprise'
      case 'call_bonuses':
        return tier === 'professional' || tier === 'enterprise'
      case 'white_label':
        return tier === 'enterprise'
      case 'api_access':
        return tier === 'enterprise'
      default:
        return false
    }
  },
}

/**
 * Helper function to check if user is beta tester
 */
export const isBetaTester = (email: string): boolean => {
  return MONETIZATION_CONFIG.BETA_TESTER_EMAILS.includes(email.toLowerCase())
}

/**
 * Helper function to get current phase
 */
export const getCurrentPhase = (): MonetizationPhase => {
  return MONETIZATION_CONFIG.PHASE
}

/**
 * Helper function to check if any payment features are enabled
 */
export const isMonetizationEnabled = (): boolean => {
  return (
    MONETIZATION_CONFIG.ENABLE_SUBSCRIPTIONS ||
    MONETIZATION_CONFIG.ENABLE_CALL_BONUSES ||
    MONETIZATION_CONFIG.ENABLE_TRANSACTION_FEES
  )
}

export default MONETIZATION_CONFIG
