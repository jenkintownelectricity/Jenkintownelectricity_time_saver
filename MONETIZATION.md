# Monetization Strategy & Implementation Guide

**Status:** 🔴 ALL FEATURES DISABLED - Beta Testing Phase

**Current Phase:** Phase 0 - Free Beta (5 contractors)
**Next Phase:** Phase 1 - Subscription Only (10 companies)
**Future Phase:** Phase 2 - Full Monetization Funnel

---

## Revenue Streams Overview

### 1. Subscription Tiers

#### Free Tier (Solo)
- **Price:** $0/month
- **Limits:**
  - 1 user only
  - BYOA (Bring Your Own APIs) required
  - Full feature access
  - No team management
  - No call bidding network access
- **Target:** Solo electricians, beta testers, proof of concept

#### Team Small
- **Price:** $30/month
- **Limits:**
  - Up to 3 users
  - Choose: BYOA or Managed APIs (2x markup)
  - Full team features
  - Call bidding within own team
  - Basic support
- **Target:** Small electrical companies, 2-3 person crews

#### Team Medium
- **Price:** $80/month
- **Limits:**
  - Up to 10 users
  - Choose: BYOA or Managed APIs (2x markup)
  - Full team features
  - Call bidding network access
  - Priority support
  - Multi-company linking
- **Target:** Medium electrical contractors, multiple crews

#### Team Large
- **Price:** $80 base + $10/user beyond 10
- **Limits:**
  - Unlimited users
  - Choose: BYOA or Managed APIs (2x markup)
  - Enterprise features
  - Dedicated support
  - Custom integrations
  - White-label options (future)
- **Target:** Large electrical contractors, regional companies

---

## 2. Call Bidding & Alert System Monetization

**Toggle:** `monetization.callBidding.enabled`

### Transaction Fees
- **Per Claimed Call:** $2-5 flat fee (type-dependent)
  - Emergency calls: $5
  - Daytime calls: $3
  - Scheduled calls: $2
- **Collected from:** Call claimer (deducted from bonus or invoiced)
- **When charged:** On successful claim/completion

### Bonus Pool Fee
- **Percentage:** 10-15% of call bonus amount
- **Example:** $100 emergency bonus = $10-15 platform fee
- **Collected from:** Company posting the call
- **When charged:** On call posting

### Network Access Fee
- **Monthly:** $50/month per company
- **Unlocks:** Access to receive calls from connected companies
- **Value prop:** Expand service area, fill downtime
- **Free tier:** Can only bid within own company

### Premium Features (Future)
- **Priority Claiming:** $1 to jump bidding queue
- **Auto-Accept Zones:** $25/month for geographic auto-claiming
- **Analytics Dashboard:** $15/month for call performance metrics
- **Lead Generation:** Companies pay $10-50 per qualified lead sent to network

---

## 3. API Management Service

**Toggle:** `monetization.apiManagement.enabled`

### Bring Your Own APIs (BYOA)
- **Cost:** Free
- **User provides:**
  - OpenAI/Anthropic API keys (for Jake chatbot)
  - Twilio API keys (SMS/voice)
  - SendGrid API keys (email)
  - QuickBooks OAuth credentials
  - Google Maps API keys
- **Liability:** User responsible for costs & rate limits
- **Setup:** User enters keys in Settings > API Configuration

### Managed APIs
- **Cost:** 2x actual API cost + usage fees
- **We provide:**
  - All API keys pre-configured
  - Centralized billing (one invoice)
  - Rate limit management
  - Error handling & retries
  - Usage dashboard
  - Cost predictions
- **Markup breakdown:**
  - 1x covers actual API costs
  - 0.5x covers infrastructure (proxies, monitoring, support)
  - 0.5x profit margin
- **Billing:** Monthly invoice based on usage tracking

### Example Cost Scenarios

**OpenAI API (GPT-4):**
- Actual cost: $0.03 per 1K tokens
- Managed cost: $0.06 per 1K tokens
- Average monthly use (50 Jake conversations): ~$15 actual, $30 managed

**Twilio SMS:**
- Actual cost: $0.0079 per SMS
- Managed cost: $0.0158 per SMS
- Average monthly use (200 SMS): ~$1.58 actual, $3.16 managed

**Total Typical Monthly API Costs:**
- BYOA mode: $20-40/month (user pays directly to providers)
- Managed mode: $40-80/month (user pays us, we pay providers)
- **Our profit per customer:** $20-40/month

---

## 4. Jake Chatbot Integration

**Toggle:** `monetization.jakeChatbot.enabled`

### Lead Capture & Conversion
- Jake conversations auto-create customer entities
- SMS/voice calls logged automatically
- Appointment booking triggers job creation
- Lead scoring based on conversation quality

### Monetization Opportunities
- **Pay-per-lead:** Contractors pay $5-10 per qualified lead from Jake
- **Conversion bonus:** 15% of job value if Jake books appointment
- **White-label Jake:** $200/month for custom branded chatbot
- **Jake network:** Overflow leads routed to paying contractors

### Jake as Lead Funnel
```
Customer inquiry → Jake chatbot → Qualification → Lead entity created
→ If qualified: Book appointment + notify on-call contractor
→ If overflow: Route to bidding network (we take 15% of bonus)
→ If outside area: Sell lead to network contractor ($10 fee)
```

---

## 5. Additional Revenue Opportunities

### Marketplace & Referrals
- **Vendor referrals:** 5-10% commission on referred purchases
  - Electrical supplies
  - Equipment
  - Insurance
  - Financing
- **Directory listing:** $50/month for premium placement
- **Advertising:** $100-500/month for supplier ads in app

### Data & Analytics
- **Benchmark reports:** $25/month for industry comparison data
- **Export services:** $10 per QuickBooks export batch
- **Historical analysis:** $50 one-time for data migration from old systems

### Training & Support
- **Onboarding:** $200 one-time setup fee (waived for annual subscriptions)
- **Training sessions:** $100/hour for team training
- **Priority support:** $50/month for phone/video support
- **Custom development:** $150/hour for custom features

---

## Implementation Toggles

All monetization features controlled via `ownerSettings.monetization` object:

```typescript
monetization: {
  // Master switch - turns ALL money features on/off
  enabled: false,

  // Subscription system
  subscriptions: {
    enabled: false,
    enforceLimits: false, // If false, all tiers get enterprise features
    billingProvider: 'stripe', // 'stripe' | 'manual'
  },

  // Call bidding fees
  callBidding: {
    enabled: false,
    transactionFee: {
      emergency: 5.00,
      daytime: 3.00,
      scheduled: 2.00
    },
    bonusPoolFee: 0.15, // 15%
    networkAccessFee: 50.00, // per month
  },

  // API management
  apiManagement: {
    enabled: false,
    allowBYOA: true,
    managedMarkup: 2.0, // 2x multiplier
    trackUsage: false,
  },

  // Jake integration
  jakeChatbot: {
    enabled: false,
    leadFee: 7.50,
    conversionBonus: 0.15, // 15%
    whitelabelFee: 200.00,
  },

  // Marketplace
  marketplace: {
    enabled: false,
    referralCommission: 0.08, // 8%
    premiumListingFee: 50.00,
  }
}
```

---

## Rollout Plan

### Phase 0: Beta Testing (Current)
**Timeline:** Now - 3 months
**Users:** 5 contractors (free)
**Focus:** Bug fixes, feature completion, user feedback
**Monetization:** ❌ Disabled

**Success Criteria:**
- All features working smoothly
- 5 contractors using daily for 30+ days
- <10 critical bugs per month
- Positive user feedback
- Database migration complete

### Phase 1: Subscription Launch
**Timeline:** Months 4-6
**Users:** 10 companies (paid subscriptions only)
**Focus:** Validate pricing, payment processing, support systems
**Monetization:** ✅ Subscriptions only ($30-80/month)

**Success Criteria:**
- 10 paying customers acquired
- <5% monthly churn
- Payments processing smoothly
- Support load manageable
- Positive ROI on first cohort

### Phase 2: Full Monetization
**Timeline:** Month 7+
**Users:** Scale to 50+ companies
**Focus:** Call bidding fees, API management, Jake integration
**Monetization:** ✅ All revenue streams

**Success Criteria:**
- 50+ paying customers
- Multiple revenue streams active
- $5K+ MRR (Monthly Recurring Revenue)
- Net margin >60%
- Proven scalability

---

## Financial Projections

### Conservative Scenario (50 customers at Month 12)

**Subscription Revenue:**
- 10 Free (solo): $0
- 20 Team Small: $30 × 20 = $600
- 15 Team Medium: $80 × 15 = $1,200
- 5 Team Large (avg 15 users): $130 × 5 = $650
- **Total MRR:** $2,450

**Call Bidding Revenue:**
- Avg 100 calls/month across network
- Transaction fees: 100 × $3 avg = $300
- Bonus pool fees: 100 × $50 avg × 15% = $750
- Network access: 30 companies × $50 = $1,500
- **Total MRR:** $2,550

**API Management Revenue:**
- 25 customers on managed APIs
- Avg profit: $30/customer
- **Total MRR:** $750

**Jake Integration Revenue:**
- 50 leads/month × $7.50 = $375
- 10 conversions × avg $500 job × 15% = $750
- **Total MRR:** $1,125

**Total MRR:** $6,875
**Total ARR:** $82,500

**Costs:**
- API infrastructure: $500/month
- Hosting (AWS/Vercel): $200/month
- Support (part-time): $1,000/month
- Payment processing (3%): $206/month
- **Total Costs:** $1,906/month

**Net Profit:** $4,969/month ($59,628/year)
**Net Margin:** 72%

### Aggressive Scenario (200 customers at Month 24)

**Total MRR:** $35,000
**Total ARR:** $420,000
**Net Profit:** ~$25,000/month ($300,000/year)

---

## Key Functions to Implement

### Subscription Management
```typescript
// Check if feature is available for user's tier
canAccessFeature(feature: string, userTier: string): boolean

// Enforce team size limits
canAddTeamMember(currentSize: number, tier: string): boolean

// Calculate monthly bill
calculateSubscriptionFee(tier: string, userCount: number): number

// Handle subscription changes
upgradeSubscription(userId: string, newTier: string): void
downgradeSubscription(userId: string, newTier: string): void
```

### Billing Functions
```typescript
// Track billable events
recordCallClaim(callId: string, memberId: string, fee: number): void
recordAPIUsage(endpoint: string, cost: number): void
recordLeadGeneration(leadId: string, fee: number): void

// Generate invoices
generateMonthlyInvoice(companyId: string, month: string): Invoice
calculateAPIMarkup(actualCost: number, markup: number): number

// Payment processing (Stripe integration)
createCustomer(companyAccount: CompanyAccount): StripeCustomer
chargeSubscription(customerId: string, amount: number): Payment
processRefund(paymentId: string, amount: number): Refund
```

### Usage Tracking
```typescript
// Monitor API usage for billing
trackOpenAITokens(requestId: string, tokens: number): void
trackTwilioSMS(messageId: string, cost: number): void
trackEmailSends(emailId: string, count: number): void

// Generate usage reports
getMonthlyAPIUsage(companyId: string, month: string): UsageReport
predictMonthlyAPIcost(companyId: string): number
```

### Jake Integration
```typescript
// Handle Jake webhook
processJakeConversation(webhookData: any): void
createLeadFromJake(conversationId: string): Customer
bookAppointmentFromJake(customerId: string, datetime: Date): Job
calculateLeadValue(leadData: any): number
```

---

## Toggle Implementation Strategy

All money features wrapped in conditionals:

```typescript
// Example: Call claim with optional billing
const handleClaimCall = (callId: string) => {
  const call = getIncomingCall(callId)
  const settings = ownerSettings.monetization

  // Core functionality (always runs)
  claimCall(callId, userProfile.memberNumber)

  // Billing (only if enabled)
  if (settings.enabled && settings.callBidding.enabled) {
    const fee = settings.callBidding.transactionFee[call.callType]
    recordCallClaim(callId, userProfile.memberNumber, fee)
    // Show user the fee
    toast(`Call claimed! Fee: $${fee.toFixed(2)}`)
  }
}
```

---

## Database Schema (Future)

When migrating from localStorage to production database:

### Tables Needed
```sql
-- Subscription tracking
subscriptions (id, company_id, tier, status, billing_cycle, next_billing_date)

-- Billing events
billing_events (id, company_id, type, amount, status, created_at)

-- API usage metering
api_usage (id, company_id, endpoint, tokens, cost, timestamp)

-- Call bidding transactions
call_transactions (id, call_id, member_id, fee, status, timestamp)

-- Jake leads
jake_leads (id, conversation_id, customer_id, value, status, created_at)

-- Invoices
invoices (id, company_id, amount, items, status, due_date, paid_date)
```

---

## Notes for Future Implementation

1. **Payment Processing:** Use Stripe for subscription billing and usage-based charges
2. **Webhooks:** Set up Stripe webhooks for payment events
3. **Dunning:** Automated retry logic for failed payments
4. **Tax Handling:** Implement tax calculation for different jurisdictions
5. **Refund Policy:** 30-day money-back guarantee for subscriptions
6. **Annual Discounts:** 20% off for annual subscriptions (add to pricing tiers)
7. **Free Trial:** 14-day free trial for Team Small/Medium tiers
8. **Grandfather Clause:** Beta testers get 50% off forever
9. **Referral Program:** $50 credit for each successful referral
10. **Compliance:** Terms of service, privacy policy, GDPR compliance

---

**Last Updated:** 2025-11-14
**Document Owner:** Jenkintown Electricity
**Status:** Living document - update as strategy evolves
