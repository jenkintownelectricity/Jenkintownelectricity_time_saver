# 💰 Monetization Strategy & Feature Toggles

**Current Phase**: Free Beta Testing (5 contractors)
**Next Phase**: Paid Pilot (10 companies @ monthly subscription)
**Future Phase**: Full Monetization with Payment Funnels

---

## 🎯 Rollout Plan

### Phase 1: Free Beta (CURRENT)
- **Goal**: Get 5 contractors using the platform for free
- **Duration**: Until bugs are worked out and feedback is incorporated
- **All money features**: OFF (Toggle = `false`)
- **Focus**: Build features, fix bugs, gather feedback

### Phase 2: Paid Pilot
- **Goal**: 10 companies paying monthly subscriptions
- **Revenue Model**: Monthly subscription only
- **Money toggles**: Subscription billing ON, all other revenue OFF
- **Focus**: Validate willingness to pay, refine pricing

### Phase 3: Full Monetization
- **Goal**: Scale to 100+ companies
- **Revenue Models**: Multiple revenue streams active
- **Money toggles**: All revenue features available
- **Focus**: Maximize revenue per customer

---

## 💸 Revenue Feature Toggles

All monetary features are controlled by toggles in `/lib/monetization.ts` (to be created).

### 1. **Monthly Subscriptions**
**Status**: 🔴 OFF (Phase 2)
**Toggle**: `ENABLE_SUBSCRIPTIONS`

**Pricing Tiers** (Planned):
```typescript
const SUBSCRIPTION_TIERS = {
  starter: {
    price: 49,
    name: 'Starter',
    features: ['1 company', '3 team members', 'Basic features'],
    enabled: false
  },
  professional: {
    price: 99,
    name: 'Professional',
    features: ['3 companies', '10 team members', 'All features', 'Priority support'],
    enabled: false
  },
  enterprise: {
    price: 199,
    name: 'Enterprise',
    features: ['Unlimited companies', 'Unlimited team members', 'All features', 'Dedicated support', 'Custom integrations'],
    enabled: false
  }
}
```

**Implementation Locations**:
- Signup flow: Show pricing page before account creation
- Settings page: "Upgrade Plan" section
- Usage limits: Enforce team member and company limits
- Stripe integration: `/api/stripe/create-subscription`

---

### 2. **Work Call Bidding Bonuses**
**Status**: 🔴 OFF (Phase 3)
**Toggle**: `ENABLE_CALL_BONUSES`

**How it Works**:
- Company owner adds bonuses to calls ($25-$100)
- Team member claims call → earns bonus
- Platform takes **15% commission** on bonus payouts
- Weekly payouts via Stripe Connect

**Example Revenue**:
- Emergency call: $100 bonus → Platform keeps $15
- Daytime call: $25 bonus → Platform keeps $3.75
- 100 calls/week @ avg $50 bonus = **$750/week platform revenue**

**Implementation Locations**:
- `work-call-bidding.tsx`: Show/hide bonus amounts based on toggle
- `lib/store.ts`: `callStats.totalBonusEarned` only tracks if enabled
- Settings: Payout configuration (bank account, payment schedule)
- `/api/stripe/process-bonus-payout`: Handle bonus distributions

---

### 3. **Per-Call Transaction Fees**
**Status**: 🔴 OFF (Phase 3)
**Toggle**: `ENABLE_TRANSACTION_FEES`

**Fee Structure**:
- **$0.50 per call** created in the system
- Charged to company owner when creating call
- Alternative: Free tier (10 calls/month), paid ($0.50/call after)

**Example Revenue**:
- Company creates 200 calls/month → **$100/month in fees**

**Implementation Locations**:
- `createWorkCall()` in `lib/store.ts`: Check balance/billing before creating
- `/api/stripe/charge-call-fee`: Process $0.50 charge
- Dashboard: Show "Calls Remaining" counter for free tier

---

### 4. **Premium Integrations**
**Status**: 🔴 OFF (Phase 3)
**Toggle**: `ENABLE_PREMIUM_INTEGRATIONS`

**Free Integrations**:
- VAPI (Voice AI)
- Claude (Photo Analysis)
- Email/SMTP

**Premium Integrations** (Requires Pro/Enterprise plan):
- QuickBooks
- Stripe
- Google Calendar
- Microsoft 365
- Zapier
- Slack

**Implementation Locations**:
- `settings.tsx`: Show "Upgrade to unlock" for premium integrations
- Integration auth flows: Check subscription tier before connecting

---

### 5. **NEC Database Access**
**Status**: 🔴 OFF (Phase 3)
**Toggle**: `ENABLE_NEC_PREMIUM`

**Free Tier**:
- 10 NEC code lookups per day
- Basic codes only

**Premium Tier** ($9.99/month add-on):
- Unlimited lookups
- Full NEC 2023 database
- Code history and bookmarking
- AI-powered code recommendations

**Implementation Locations**:
- `nec-lookup.tsx`: Show lookup counter and upgrade CTA
- `/api/nec/lookup`: Check usage limits

---

### 6. **Photo Analysis Credits**
**Status**: 🔴 OFF (Phase 3)
**Toggle**: `ENABLE_PHOTO_CREDITS`

**Free Tier**:
- 20 photo analyses per month

**Paid**:
- $0.25 per photo analysis (pay-as-you-go)
- Or: Unlimited on Pro/Enterprise plans

**Implementation Locations**:
- `photo-analysis.tsx`: Show credits remaining
- `/api/photo/analyze`: Check credits before processing
- Settings: "Buy More Credits" button

---

### 7. **Team Member Seats**
**Status**: 🔴 OFF (Phase 2)
**Toggle**: `ENABLE_SEAT_LIMITS`

**Pricing**:
- Starter: 3 seats included
- Professional: 10 seats included
- Additional seats: **$10/month per seat**

**Implementation Locations**:
- Company management: Block adding members if over limit
- Settings: "Add Seat" button with pricing
- Billing: `/api/stripe/add-seat`

---

### 8. **Company Network Fees**
**Status**: 🔴 OFF (Phase 3)
**Toggle**: `ENABLE_NETWORK_FEES`

**Free**:
- Link up to 3 companies

**Paid**:
- Unlimited company linking on Pro/Enterprise
- Or: $5/month per additional linked company

**Implementation Locations**:
- `account-menu.tsx`: Block linking if over free limit
- Settings: Network management with upgrade CTA

---

### 9. **White Label / Custom Branding**
**Status**: 🔴 OFF (Phase 3)
**Toggle**: `ENABLE_WHITE_LABEL`

**Enterprise Feature Only**:
- Custom domain (contractor.yourbrand.com)
- Custom logo and colors
- Remove AppIo.AI branding
- **+$99/month**

**Implementation Locations**:
- `app/layout.tsx`: Load custom branding config
- Settings: Branding customization panel (Enterprise only)

---

### 10. **API Access**
**Status**: 🔴 OFF (Phase 3)
**Toggle**: `ENABLE_API_ACCESS`

**Developer Tier**: $29/month
- REST API access
- Webhooks
- 10,000 API calls/month
- Additional calls: $0.01 per call

**Implementation Locations**:
- `/api/v1/*`: API routes with authentication
- Settings: API key generation
- Dashboard: API usage stats

---

## 📊 Revenue Projection Calculator

**Phase 2 - Paid Pilot** (10 companies):
```
10 companies × $99/month = $990/month
Annual: $11,880
```

**Phase 3 - Scale** (100 companies):
```
Subscriptions:
- 60 companies × $49 = $2,940
- 30 companies × $99 = $2,970
- 10 companies × $199 = $1,990
Subtotal: $7,900/month

Call Bonuses (15% commission):
- 100 companies × 50 calls/month × $30 avg bonus × 15% = $22,500/month

Transaction Fees:
- 100 companies × 100 calls/month × $0.50 = $5,000/month

Add-ons (NEC Premium):
- 40 companies × $9.99 = $399.60/month

Total Monthly: $35,799.60
Annual: $429,595.20
```

---

## 🔧 Implementation Checklist

### Phase 1 (Current - FREE):
- [x] Build all core features
- [x] Work call bidding system
- [x] Account & company management
- [x] Set all toggles to `false`
- [ ] Create `/lib/monetization.ts` config file
- [ ] Add "Beta Testing - Free" badge to UI

### Phase 2 (Paid Pilot - SUBSCRIPTIONS ONLY):
- [ ] Create Stripe account
- [ ] Set up subscription plans
- [ ] Build `/api/stripe/create-subscription`
- [ ] Add pricing page before signup
- [ ] Enable `ENABLE_SUBSCRIPTIONS = true`
- [ ] Enable `ENABLE_SEAT_LIMITS = true`
- [ ] Add upgrade CTAs throughout UI
- [ ] Email 10 target companies with pricing

### Phase 3 (Full Monetization):
- [ ] Stripe Connect setup for bonus payouts
- [ ] Enable `ENABLE_CALL_BONUSES = true`
- [ ] Enable `ENABLE_TRANSACTION_FEES = true`
- [ ] Enable `ENABLE_PREMIUM_INTEGRATIONS = true`
- [ ] Enable `ENABLE_NEC_PREMIUM = true`
- [ ] Enable `ENABLE_PHOTO_CREDITS = true`
- [ ] Build billing dashboard
- [ ] Implement usage tracking and limits
- [ ] Set up automated invoicing

---

## 🚨 Important Notes

1. **All money features are OFF by default** - Build first, monetize later
2. **Store toggles in environment variables** - Easy to turn on/off without code changes
3. **Test payment flows in Stripe Test Mode** - Before going live
4. **Grandfather early beta users** - Offer lifetime discount to first 5 contractors
5. **Compliance**: Ensure PCI compliance for payment processing
6. **Terms of Service**: Update TOS when enabling paid features

---

## 📝 Monetization Config File Location

All toggles will be stored in:
```
/lib/monetization.ts
```

Example structure:
```typescript
export const MONETIZATION_CONFIG = {
  // Global
  PHASE: 'BETA', // 'BETA' | 'PILOT' | 'FULL'

  // Features
  ENABLE_SUBSCRIPTIONS: false,
  ENABLE_CALL_BONUSES: false,
  ENABLE_TRANSACTION_FEES: false,
  ENABLE_PREMIUM_INTEGRATIONS: false,
  ENABLE_NEC_PREMIUM: false,
  ENABLE_PHOTO_CREDITS: false,
  ENABLE_SEAT_LIMITS: false,
  ENABLE_NETWORK_FEES: false,
  ENABLE_WHITE_LABEL: false,
  ENABLE_API_ACCESS: false,

  // Stripe
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,

  // Pricing
  SUBSCRIPTION_TIERS: { /* ... */ },
  CALL_BONUS_COMMISSION: 0.15,
  TRANSACTION_FEE: 0.50,
  NEC_PREMIUM_PRICE: 9.99,
  PHOTO_CREDIT_PRICE: 0.25,
  SEAT_PRICE: 10,
}
```

---

**Last Updated**: 2025-11-14
**Next Review**: When moving to Phase 2 (Paid Pilot)
