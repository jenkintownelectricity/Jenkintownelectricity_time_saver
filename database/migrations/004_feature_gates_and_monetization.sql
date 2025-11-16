-- ============================================================================
-- Migration 004: Feature Gates, Monetization & Scalable Toggle System
-- ============================================================================
-- Date: 2025-11-16
-- Description: Add scalable feature toggle system with monetization controls
--
-- This migration implements:
-- 1. DEVELOPER-controlled feature gates (for monetization)
-- 2. USER-controlled preferences (for convenience)
-- 3. Subscription plans and user subscriptions
-- 4. Usage tracking for limits and quotas
-- 5. Audit logging for compliance
-- ============================================================================

-- ============================================================================
-- SUBSCRIPTION PLANS (Developer-defined pricing tiers)
-- ============================================================================
CREATE TABLE public.subscription_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Plan Info
  name TEXT NOT NULL UNIQUE, -- 'free', 'starter', 'professional', 'enterprise'
  display_name TEXT NOT NULL, -- 'Free Beta', 'Starter', 'Professional', 'Enterprise'
  description TEXT,

  -- Pricing
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Trial
  trial_days INTEGER DEFAULT 0,

  -- Limits
  limits JSONB DEFAULT '{
    "max_companies": 1,
    "max_team_members": 3,
    "max_contacts": 100,
    "max_documents_per_month": 50,
    "max_receipts_per_month": 100,
    "max_photo_analyses_per_month": 20,
    "max_nec_lookups_per_day": 10,
    "max_api_calls_per_month": 0,
    "max_linked_companies": 0,
    "storage_gb": 1
  }',

  -- Feature Access (what's included in this plan)
  features JSONB DEFAULT '{
    "receipts": true,
    "tax_compliance": true,
    "team_management": false,
    "company_management": false,
    "vapi_calls": false,
    "appointments": true,
    "photo_analysis": true,
    "nec_lookup": true,
    "voice_assistant": false,
    "estimates": true,
    "work_orders": true,
    "invoices": true,
    "analytics": false,
    "customer_portal": false,
    "api_access": false,
    "white_label": false,
    "priority_support": false,
    "custom_integrations": false
  }',

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true, -- Show in pricing page
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER SUBSCRIPTIONS (Track what plan each user is on)
-- ============================================================================
CREATE TABLE public.user_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Relationships
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE RESTRICT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,

  -- Subscription Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused'
  )),

  -- Dates
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  canceled_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  -- Billing
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  payment_method TEXT, -- 'stripe', 'paypal', 'invoice', 'comp'

  -- Grandfathering & Discounts
  is_grandfathered BOOLEAN DEFAULT false, -- Lock in special pricing
  discount_percent DECIMAL(5,2) DEFAULT 0,
  lifetime_deal BOOLEAN DEFAULT false,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, company_id) -- One subscription per user per company
);

-- ============================================================================
-- FEATURE GATES (Developer-controlled monetization switches)
-- ============================================================================
CREATE TABLE public.feature_gates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Feature Info
  feature_key TEXT NOT NULL UNIQUE, -- 'receipts', 'tax_compliance', 'photo_analysis', etc.
  feature_name TEXT NOT NULL, -- 'Receipt Management', 'Tax Compliance', etc.
  description TEXT,
  category TEXT, -- 'core', 'documents', 'ai', 'integrations', 'analytics'

  -- Monetization Controls (DEVELOPER ONLY)
  is_enabled_globally BOOLEAN DEFAULT true, -- Global kill switch
  minimum_plan TEXT, -- 'free', 'starter', 'professional', 'enterprise'

  -- Usage Limits (applied globally or per plan)
  has_usage_limit BOOLEAN DEFAULT false,
  usage_limit_type TEXT CHECK (usage_limit_type IN ('daily', 'monthly', 'total', null)),

  -- Beta/Early Access
  is_beta BOOLEAN DEFAULT false,
  beta_access_users JSONB DEFAULT '[]', -- Array of user IDs with early access

  -- Dependencies (features that must be enabled for this to work)
  requires_features JSONB DEFAULT '[]', -- ['vapi_calls', 'appointments']

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER PREFERENCES (User-controlled feature toggles for convenience)
-- ============================================================================
CREATE TABLE public.user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Relationships
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,

  -- Feature Toggles (User's personal on/off switches)
  -- These only work if the feature gate allows it AND their plan includes it
  feature_toggles JSONB DEFAULT '{
    "receipts_enabled": true,
    "tax_compliance_enabled": true,
    "team_management_enabled": true,
    "company_management_enabled": true,
    "vapi_calls_enabled": true,
    "appointments_enabled": true,
    "photo_analysis_enabled": true,
    "nec_lookup_enabled": true,
    "voice_assistant_enabled": true,
    "estimates_enabled": true,
    "work_orders_enabled": true,
    "invoices_enabled": true,
    "analytics_enabled": true,
    "customer_portal_enabled": true
  }',

  -- UI/UX Preferences
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  sidebar_collapsed BOOLEAN DEFAULT false,
  default_view TEXT DEFAULT 'dashboard',

  -- Notification Preferences
  notifications JSONB DEFAULT '{
    "email_receipts": true,
    "email_invoices": true,
    "email_appointments": true,
    "email_work_calls": true,
    "push_work_calls": true,
    "push_appointments": true,
    "sms_work_calls": false,
    "sms_appointments": false
  }',

  -- Format Preferences
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  time_format TEXT DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'America/New_York',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, company_id)
);

-- ============================================================================
-- USAGE TRACKING (Track usage for limits and quotas)
-- ============================================================================
CREATE TABLE public.usage_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Relationships
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,

  -- What was used
  feature_key TEXT NOT NULL, -- 'photo_analysis', 'nec_lookup', 'api_call', etc.
  resource_type TEXT, -- 'photo', 'document', 'api_request', 'storage_mb'
  resource_id UUID, -- ID of the thing that was created/used

  -- Usage Amount
  quantity INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'count', -- 'count', 'mb', 'minutes', 'credits'

  -- Period Tracking
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT DEFAULT 'monthly' CHECK (period_type IN ('daily', 'monthly', 'yearly')),

  -- Billing
  billable BOOLEAN DEFAULT false,
  billed_amount DECIMAL(10,2) DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes for fast lookups
  CONSTRAINT idx_usage_period CHECK (period_start <= period_end)
);

-- ============================================================================
-- FEATURE USAGE SUMMARY (Aggregated usage stats for quick checks)
-- ============================================================================
CREATE TABLE public.feature_usage_summary (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Relationships
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,

  -- Feature
  feature_key TEXT NOT NULL,

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Usage Stats
  total_count INTEGER DEFAULT 0,
  limit_count INTEGER, -- What's their limit for this period
  percent_used DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN limit_count IS NOT NULL AND limit_count > 0
    THEN (total_count::DECIMAL / limit_count * 100)
    ELSE 0 END
  ) STORED,

  -- Timestamps
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, company_id, feature_key, period_start)
);

-- ============================================================================
-- AUDIT LOG (Track changes to subscriptions and feature access)
-- ============================================================================
CREATE TABLE public.feature_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Who
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  performed_by_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,

  -- What
  action TEXT NOT NULL, -- 'feature_enabled', 'feature_disabled', 'plan_changed', 'limit_exceeded', etc.
  entity_type TEXT NOT NULL, -- 'feature_gate', 'user_subscription', 'user_preference'
  entity_id UUID,

  -- Details
  feature_key TEXT,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,

  -- Metadata
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES (Performance optimization)
-- ============================================================================

-- Subscription Plans
CREATE INDEX idx_subscription_plans_name ON public.subscription_plans(name);
CREATE INDEX idx_subscription_plans_active ON public.subscription_plans(is_active) WHERE is_active = true;
CREATE INDEX idx_subscription_plans_visible ON public.subscription_plans(is_visible) WHERE is_visible = true;

-- User Subscriptions
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_company_id ON public.user_subscriptions(company_id);
CREATE INDEX idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_stripe_customer ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX idx_user_subscriptions_active ON public.user_subscriptions(status, current_period_end)
  WHERE status IN ('trialing', 'active');

-- Feature Gates
CREATE INDEX idx_feature_gates_key ON public.feature_gates(feature_key);
CREATE INDEX idx_feature_gates_enabled ON public.feature_gates(is_enabled_globally) WHERE is_enabled_globally = true;
CREATE INDEX idx_feature_gates_minimum_plan ON public.feature_gates(minimum_plan);

-- User Preferences
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_user_preferences_company_id ON public.user_preferences(company_id);

-- Usage Tracking
CREATE INDEX idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_company_id ON public.usage_tracking(company_id);
CREATE INDEX idx_usage_tracking_subscription_id ON public.usage_tracking(subscription_id);
CREATE INDEX idx_usage_tracking_feature ON public.usage_tracking(feature_key);
CREATE INDEX idx_usage_tracking_period ON public.usage_tracking(period_start, period_end);
CREATE INDEX idx_usage_tracking_created ON public.usage_tracking(created_at);

-- Feature Usage Summary
CREATE INDEX idx_feature_usage_summary_user_id ON public.feature_usage_summary(user_id);
CREATE INDEX idx_feature_usage_summary_feature ON public.feature_usage_summary(feature_key);
CREATE INDEX idx_feature_usage_summary_period ON public.feature_usage_summary(period_start);

-- Audit Log
CREATE INDEX idx_feature_audit_log_user_id ON public.feature_audit_log(user_id);
CREATE INDEX idx_feature_audit_log_performed_by ON public.feature_audit_log(performed_by_user_id);
CREATE INDEX idx_feature_audit_log_action ON public.feature_audit_log(action);
CREATE INDEX idx_feature_audit_log_entity ON public.feature_audit_log(entity_type, entity_id);
CREATE INDEX idx_feature_audit_log_created ON public.feature_audit_log(created_at);

-- ============================================================================
-- TRIGGERS (Auto-update timestamps)
-- ============================================================================

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_gates_updated_at BEFORE UPDATE ON public.feature_gates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA: Default Subscription Plans
-- ============================================================================

INSERT INTO public.subscription_plans (name, display_name, description, price_monthly, price_yearly, limits, features, sort_order) VALUES

-- FREE BETA (Current phase)
('free', 'Free Beta', 'Perfect for testing and getting started. Limited features.', 0, 0,
'{
  "max_companies": 1,
  "max_team_members": 3,
  "max_contacts": 50,
  "max_documents_per_month": 25,
  "max_receipts_per_month": 50,
  "max_photo_analyses_per_month": 10,
  "max_nec_lookups_per_day": 5,
  "max_api_calls_per_month": 0,
  "max_linked_companies": 0,
  "storage_gb": 1
}',
'{
  "receipts": true,
  "tax_compliance": true,
  "team_management": false,
  "company_management": false,
  "vapi_calls": false,
  "appointments": true,
  "photo_analysis": true,
  "nec_lookup": true,
  "voice_assistant": false,
  "estimates": true,
  "work_orders": true,
  "invoices": true,
  "analytics": false,
  "customer_portal": false,
  "api_access": false,
  "white_label": false,
  "priority_support": false,
  "custom_integrations": false
}', 1),

-- STARTER (Phase 2)
('starter', 'Starter', 'Great for solo contractors and small teams.', 49, 470,
'{
  "max_companies": 1,
  "max_team_members": 3,
  "max_contacts": 500,
  "max_documents_per_month": 100,
  "max_receipts_per_month": 200,
  "max_photo_analyses_per_month": 50,
  "max_nec_lookups_per_day": 50,
  "max_api_calls_per_month": 1000,
  "max_linked_companies": 1,
  "storage_gb": 10
}',
'{
  "receipts": true,
  "tax_compliance": true,
  "team_management": true,
  "company_management": false,
  "vapi_calls": true,
  "appointments": true,
  "photo_analysis": true,
  "nec_lookup": true,
  "voice_assistant": true,
  "estimates": true,
  "work_orders": true,
  "invoices": true,
  "analytics": true,
  "customer_portal": false,
  "api_access": false,
  "white_label": false,
  "priority_support": false,
  "custom_integrations": false
}', 2),

-- PROFESSIONAL (Phase 2)
('professional', 'Professional', 'Perfect for growing businesses with multiple teams.', 99, 950,
'{
  "max_companies": 3,
  "max_team_members": 10,
  "max_contacts": 2000,
  "max_documents_per_month": 500,
  "max_receipts_per_month": 1000,
  "max_photo_analyses_per_month": 200,
  "max_nec_lookups_per_day": null,
  "max_api_calls_per_month": 10000,
  "max_linked_companies": 5,
  "storage_gb": 50
}',
'{
  "receipts": true,
  "tax_compliance": true,
  "team_management": true,
  "company_management": true,
  "vapi_calls": true,
  "appointments": true,
  "photo_analysis": true,
  "nec_lookup": true,
  "voice_assistant": true,
  "estimates": true,
  "work_orders": true,
  "invoices": true,
  "analytics": true,
  "customer_portal": true,
  "api_access": true,
  "white_label": false,
  "priority_support": true,
  "custom_integrations": true
}', 3),

-- ENTERPRISE (Phase 3)
('enterprise', 'Enterprise', 'Unlimited everything with white label and dedicated support.', 199, 1910,
'{
  "max_companies": null,
  "max_team_members": null,
  "max_contacts": null,
  "max_documents_per_month": null,
  "max_receipts_per_month": null,
  "max_photo_analyses_per_month": null,
  "max_nec_lookups_per_day": null,
  "max_api_calls_per_month": null,
  "max_linked_companies": null,
  "storage_gb": 500
}',
'{
  "receipts": true,
  "tax_compliance": true,
  "team_management": true,
  "company_management": true,
  "vapi_calls": true,
  "appointments": true,
  "photo_analysis": true,
  "nec_lookup": true,
  "voice_assistant": true,
  "estimates": true,
  "work_orders": true,
  "invoices": true,
  "analytics": true,
  "customer_portal": true,
  "api_access": true,
  "white_label": true,
  "priority_support": true,
  "custom_integrations": true
}', 4);

-- ============================================================================
-- SEED DATA: Default Feature Gates
-- ============================================================================

INSERT INTO public.feature_gates (feature_key, feature_name, description, category, is_enabled_globally, minimum_plan) VALUES

-- Core Features (Always Free)
('receipts', 'Receipt Management', 'Upload and categorize receipts', 'core', true, 'free'),
('tax_compliance', 'Tax Compliance', 'Quarterly and annual tax tracking', 'core', true, 'free'),
('appointments', 'Appointment Scheduling', 'Schedule customer appointments', 'core', true, 'free'),
('nec_lookup', 'NEC Code Lookup', 'National Electrical Code reference', 'core', true, 'free'),

-- Document Features (Free with limits)
('estimates', 'Estimates', 'Create professional estimates', 'documents', true, 'free'),
('work_orders', 'Work Orders', 'Track job progress', 'documents', true, 'free'),
('invoices', 'Invoices', 'Generate and send invoices', 'documents', true, 'free'),

-- Team Features (Paid)
('team_management', 'Team Management', 'Manage team members and permissions', 'team', true, 'starter'),
('company_management', 'Company Management', 'Multi-company/DBA support', 'team', true, 'professional'),

-- AI Features (Paid)
('photo_analysis', 'Photo Analysis', 'AI-powered job site photo analysis', 'ai', true, 'free'),
('voice_assistant', 'Voice Assistant', 'Hands-free voice commands', 'ai', true, 'starter'),
('vapi_calls', 'VAPI Call Handling', 'AI phone call handling', 'ai', true, 'starter'),

-- Analytics Features (Paid)
('analytics', 'Advanced Analytics', 'Business performance insights', 'analytics', true, 'starter'),
('customer_portal', 'Customer Portal', 'Online customer access', 'analytics', true, 'professional'),

-- Enterprise Features
('api_access', 'API Access', 'REST API and webhooks', 'integrations', true, 'professional'),
('white_label', 'White Label Branding', 'Custom branding and domain', 'integrations', true, 'enterprise'),
('priority_support', 'Priority Support', 'Dedicated support team', 'core', true, 'professional'),
('custom_integrations', 'Custom Integrations', 'QuickBooks, Stripe, etc.', 'integrations', true, 'professional');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if user has access to a feature
CREATE OR REPLACE FUNCTION check_feature_access(
  p_user_id UUID,
  p_company_id UUID,
  p_feature_key TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_access BOOLEAN := false;
  v_gate_enabled BOOLEAN;
  v_min_plan TEXT;
  v_user_plan TEXT;
  v_feature_in_plan BOOLEAN;
  v_user_toggle_enabled BOOLEAN;
BEGIN
  -- 1. Check if feature gate is globally enabled
  SELECT is_enabled_globally, minimum_plan
  INTO v_gate_enabled, v_min_plan
  FROM public.feature_gates
  WHERE feature_key = p_feature_key;

  IF NOT v_gate_enabled THEN
    RETURN false;
  END IF;

  -- 2. Check user's subscription plan
  SELECT sp.name, (sp.features->>p_feature_key)::BOOLEAN
  INTO v_user_plan, v_feature_in_plan
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND (us.company_id = p_company_id OR us.company_id IS NULL)
    AND us.status IN ('trialing', 'active')
  ORDER BY us.created_at DESC
  LIMIT 1;

  IF NOT v_feature_in_plan THEN
    RETURN false;
  END IF;

  -- 3. Check user's personal toggle
  SELECT (feature_toggles->>p_feature_key)::BOOLEAN
  INTO v_user_toggle_enabled
  FROM public.user_preferences
  WHERE user_id = p_user_id
    AND (company_id = p_company_id OR company_id IS NULL)
  LIMIT 1;

  IF v_user_toggle_enabled IS NULL THEN
    v_user_toggle_enabled := true; -- Default to enabled if no preference set
  END IF;

  RETURN v_user_toggle_enabled;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Run this migration in Supabase
-- 2. Update frontend to check feature access via API
-- 3. Add billing integration (Stripe)
-- 4. Add usage tracking hooks
-- ============================================================================
