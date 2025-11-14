# Billing System - Developer Guide

**Status:** 🔴 DISABLED - Beta Testing Mode

This document explains how to work with the billing and monetization system in the codebase.

---

## Quick Reference

### Master Toggle

```typescript
const { ownerSettings } = useAppStore()

// Check if monetization is enabled
if (ownerSettings.monetization.enabled) {
  // Apply fees, enforce limits, etc.
} else {
  // Beta mode - all features free, no limits
}
```

### Toggle Locations

**Main Toggle:**
- File: `lib/store.ts`
- Path: `ownerSettings.monetization.enabled`
- Default: `false` (disabled during beta)

**Sub-Toggles:**
- `ownerSettings.monetization.subscriptions.enabled` - Subscription billing
- `ownerSettings.monetization.callBidding.enabled` - Call claim fees
- `ownerSettings.monetization.apiManagement.enabled` - API cost tracking
- `ownerSettings.monetization.jakeChatbot.enabled` - Jake lead fees
- `ownerSettings.monetization.marketplace.enabled` - Referral commissions

---

## Subscription Tiers

Defined in `lib/store.ts`:

```typescript
export interface UserProfile {
  subscriptionTier?: 'free' | 'team_small' | 'team_medium' | 'team_large'
  apiMode?: 'byoa' | 'managed' // Bring Your Own APIs vs Managed
}

export interface CompanyAccount {
  subscription?: {
    tier: 'free' | 'team_small' | 'team_medium' | 'team_large'
    status: 'active' | 'trial' | 'past_due' | 'cancelled'
    apiMode: 'byoa' | 'managed'
    maxUsers: number
    currentUsers: number
    billingCycle: 'monthly' | 'annual'
    nextBillingDate?: number
    stripeCustomerId?: string
    stripeSubscriptionId?: string
  }
}
```

### Tier Limits

Use the `getSubscriptionLimits()` function:

```typescript
const { getSubscriptionLimits } = useAppStore()

const limits = getSubscriptionLimits('team_small')
// Returns: { maxUsers: 3, features: ['all'] }
```

**Tier Breakdown:**
- **Free:** 1 user, all features, BYOA only
- **Team Small ($30/mo):** 3 users, all features
- **Team Medium ($80/mo):** 10 users, all features + network bidding
- **Team Large ($80 + $10/user):** Unlimited users, all features + priority support

---

## Billing Functions

All billing functions are in `lib/store.ts` and include automatic toggle guards.

### 1. Feature Access Control

```typescript
const { canAccessFeature } = useAppStore()

if (canAccessFeature('network_bidding')) {
  // Show network bidding UI
}
```

**Behavior:**
- Returns `true` if monetization disabled (beta mode)
- Returns `true` if subscription limits not enforced
- Returns tier-based access when fully enabled

### 2. Team Size Limits

```typescript
const { canAddTeamMemberToTier } = useAppStore()

const handleAddMember = () => {
  if (!canAddTeamMemberToTier(currentCompanyCode)) {
    alert('You have reached your team size limit for this tier. Please upgrade.')
    return
  }

  // Proceed with adding team member
  addTeamMember({ ...memberData })
}
```

**Behavior:**
- Returns `true` if monetization disabled (beta mode)
- Returns `true` if subscription limits not enforced
- Checks `currentUsers < maxUsers` when fully enabled

### 3. Call Claim Fees

```typescript
const { calculateCallClaimFee, recordBillableEvent, claimCall } = useAppStore()

const handleClaimCall = (callId: string, callType: 'emergency' | 'daytime' | 'scheduled') => {
  const fee = calculateCallClaimFee(callType)

  if (fee > 0) {
    // Show fee to user
    if (!confirm(`Claim this call? Transaction fee: $${fee.toFixed(2)}`)) {
      return
    }
  }

  // Claim the call
  claimCall(callId, userProfile.memberNumber)

  // Record the billable event
  if (fee > 0) {
    recordBillableEvent('call_claim', fee, {
      callId,
      callType,
      memberNumber: userProfile.memberNumber
    })
  }
}
```

**Behavior:**
- Returns `0` if monetization disabled (beta mode)
- Returns configured fee when enabled:
  - Emergency: $5.00
  - Daytime: $3.00
  - Scheduled: $2.00

### 4. Bonus Pool Fees

```typescript
const { calculateBonusPoolFee, addIncomingCall } = useAppStore()

const handlePostCall = (bonusAmount: number) => {
  const fee = calculateBonusPoolFee(bonusAmount)
  const totalCost = bonusAmount + fee

  if (fee > 0) {
    alert(`Total cost: $${totalCost.toFixed(2)} (Bonus: $${bonusAmount}, Platform fee: $${fee.toFixed(2)})`)
  }

  // Post the call
  addIncomingCall({
    callType: 'emergency',
    callBonus: bonusAmount,
    // ... other fields
  })

  // Record billing
  if (fee > 0) {
    recordBillableEvent('bonus_pool_fee', fee, {
      bonusAmount,
      feePercentage: ownerSettings.monetization.callBidding.bonusPoolFee
    })
  }
}
```

**Behavior:**
- Returns `0` if monetization disabled (beta mode)
- Returns `bonusAmount * 0.15` (15%) when enabled

### 5. Recording Billable Events

```typescript
const { recordBillableEvent } = useAppStore()

// Record any billable event
recordBillableEvent('api_usage', 2.50, {
  provider: 'openai',
  tokens: 1000,
  endpoint: '/v1/chat/completions'
})

recordBillableEvent('lead_generation', 7.50, {
  leadId: 'lead_123',
  source: 'jake_chatbot',
  customerName: 'John Doe'
})
```

**Behavior:**
- If monetization disabled: Logs to console with `[BETA MODE]` prefix
- If monetization enabled: Logs to console with `[BILLING]` prefix
- Future: Will store to database `billing_events` table

---

## Example Usage Patterns

### Pattern 1: Guarding Paid Features

```typescript
import { useAppStore } from '@/lib/store'

const CallBiddingDashboard = () => {
  const { ownerSettings, userProfile, companyAccounts } = useAppStore()

  // Show banner if monetization will be enabled soon
  const showUpgradePrompt = !ownerSettings.monetization.enabled &&
                           companyAccounts.length > 0

  return (
    <div>
      {showUpgradePrompt && (
        <Banner>
          Note: Call bidding network access will require a subscription when we exit beta.
          Enjoy unlimited access during beta testing!
        </Banner>
      )}

      {/* Your UI here */}
    </div>
  )
}
```

### Pattern 2: Showing Fees in UI

```typescript
const CallCard = ({ call }: { call: IncomingCall }) => {
  const { calculateCallClaimFee } = useAppStore()
  const fee = calculateCallClaimFee(call.callType)

  return (
    <Card>
      <h3>{call.description}</h3>
      <p>Bonus: ${call.callBonus.toFixed(2)}</p>
      {fee > 0 && (
        <p className="text-sm text-muted-foreground">
          Platform fee: ${fee.toFixed(2)}
        </p>
      )}
      <Button onClick={() => handleClaim(call.id)}>
        Claim Call
      </Button>
    </Card>
  )
}
```

### Pattern 3: Team Size Enforcement

```typescript
const AddMemberModal = () => {
  const { canAddTeamMemberToTier, currentCompanyCode, addTeamMember } = useAppStore()

  const handleSubmit = () => {
    if (!canAddTeamMemberToTier(currentCompanyCode)) {
      toast.error('Team size limit reached', {
        description: 'Upgrade to add more team members'
      })
      return
    }

    addTeamMember({ ...formData })
    toast.success('Team member added')
  }

  return (
    <Modal>
      <Form onSubmit={handleSubmit}>
        {/* Form fields */}
      </Form>
    </Modal>
  )
}
```

---

## Toggle Control Panel (Future)

When monetization is ready to be enabled, create an admin panel at `/settings/monetization`:

```typescript
const MonetizationSettings = () => {
  const { ownerSettings, setOwnerSetting } = useAppStore()

  const toggleMonetization = (enabled: boolean) => {
    // Update master switch
    setOwnerSetting('monetization', {
      ...ownerSettings.monetization,
      enabled
    })

    if (enabled) {
      alert('⚠️ MONETIZATION ENABLED\n\nAll billing features are now active:\n- Subscription limits enforced\n- Call fees applied\n- Usage tracking enabled')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monetization Control</CardTitle>
        <CardDescription>
          Master control for all billing and subscription features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Master Switch</p>
            <p className="text-sm text-muted-foreground">
              {ownerSettings.monetization.enabled
                ? '🟢 Billing Active'
                : '🔴 Beta Mode - All Features Free'}
            </p>
          </div>
          <Switch
            checked={ownerSettings.monetization.enabled}
            onCheckedChange={toggleMonetization}
          />
        </div>

        {/* Individual toggle controls for each subsystem */}
        <Separator className="my-4" />

        <div className="space-y-3">
          <ToggleRow
            label="Subscription Billing"
            enabled={ownerSettings.monetization.subscriptions.enabled}
            onToggle={(enabled) => setOwnerSetting('monetization.subscriptions.enabled', enabled)}
          />
          <ToggleRow
            label="Call Bidding Fees"
            enabled={ownerSettings.monetization.callBidding.enabled}
            onToggle={(enabled) => setOwnerSetting('monetization.callBidding.enabled', enabled)}
          />
          {/* ... more toggles */}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## Testing Monetization Features

### Beta Mode (Current)

All monetization features should work with fees = $0 and limits = unlimited:

```bash
# All functions return "free" values
calculateCallClaimFee('emergency') // Returns 0
canAddTeamMemberToTier(companyCode) // Returns true
canAccessFeature('anything') // Returns true
```

### Enabling for Testing

Temporarily enable monetization in browser console:

```javascript
// Get the store
const store = useAppStore.getState()

// Enable monetization
store.setOwnerSetting('monetization', {
  ...store.ownerSettings.monetization,
  enabled: true,
  callBidding: { ...store.ownerSettings.monetization.callBidding, enabled: true }
})

// Now test fee calculations
store.calculateCallClaimFee('emergency') // Returns 5.00
```

### Automated Testing

```typescript
import { useAppStore } from '@/lib/store'

describe('Billing Functions', () => {
  it('should return zero fees when monetization disabled', () => {
    const { calculateCallClaimFee, ownerSettings } = useAppStore.getState()
    expect(ownerSettings.monetization.enabled).toBe(false)
    expect(calculateCallClaimFee('emergency')).toBe(0)
  })

  it('should return configured fees when enabled', () => {
    const store = useAppStore.getState()

    // Enable monetization
    store.setOwnerSetting('monetization', {
      ...store.ownerSettings.monetization,
      enabled: true,
      callBidding: { enabled: true, transactionFee: { emergency: 5.00 }}
    })

    expect(store.calculateCallClaimFee('emergency')).toBe(5.00)
  })
})
```

---

## Migration Checklist

When transitioning from beta to paid:

### Phase 0 → Phase 1 (Subscriptions Only)
- [ ] Create Stripe account
- [ ] Add Stripe API keys to settings
- [ ] Enable `monetization.subscriptions.enabled = true`
- [ ] Enable `monetization.subscriptions.enforceLimits = true`
- [ ] Test subscription signup flow
- [ ] Test team size limits
- [ ] Add billing page to UI
- [ ] Add upgrade prompts

### Phase 1 → Phase 2 (Full Monetization)
- [ ] Enable `monetization.callBidding.enabled = true`
- [ ] Enable `monetization.apiManagement.enabled = true`
- [ ] Test call fee calculations
- [ ] Test API usage tracking
- [ ] Add fee disclosures to UI
- [ ] Update terms of service
- [ ] Implement payment processing for fees
- [ ] Add usage dashboard

### Database Migration
- [ ] Create `billing_events` table
- [ ] Create `subscriptions` table
- [ ] Create `api_usage` table
- [ ] Create `invoices` table
- [ ] Migrate localStorage data to DB
- [ ] Update `recordBillableEvent()` to write to DB
- [ ] Implement invoice generation

---

## Important Files

### Core Billing Logic
- `lib/store.ts` - All billing functions and toggles
- `MONETIZATION.md` - Business strategy and pricing

### Where to Add Billing Checks
- `components/call-bidding.tsx` - Add fee display to call cards
- `components/team-management.tsx` - Add team size limit checks
- `components/account-menu.tsx` - Add subscription status display
- `app/settings/page.tsx` - Add monetization control panel (future)

### Future Implementation
- `lib/billing.ts` - Extract billing logic from store
- `lib/stripe.ts` - Stripe integration helpers
- `app/api/billing/*` - Billing API endpoints
- `components/billing/*` - Billing UI components

---

## FAQs

**Q: Why are all toggles disabled by default?**
A: We're in beta testing phase. Need to work out bugs before charging money.

**Q: When will monetization be enabled?**
A: After 5 contractors test for free, then 10 paid subscriptions, then full monetization rollout.

**Q: How do I test billing features?**
A: Use browser console to temporarily enable toggles, or create test cases.

**Q: What happens to beta users when we enable billing?**
A: Beta testers get grandfathered pricing (50% off forever) as defined in MONETIZATION.md.

**Q: Where are billable events stored?**
A: Currently just logged to console. Will migrate to database in Phase 2.

**Q: How do I add a new billing feature?**
1. Add toggle to `ownerSettings.monetization`
2. Add function to `AppState` interface
3. Implement function with toggle guard
4. Use in component with proper UI feedback

---

**Last Updated:** 2025-11-14
**Maintainer:** Jenkintown Electricity
