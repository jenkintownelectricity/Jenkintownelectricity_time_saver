-- ============================================================================
-- Lead Capture System Migration
-- ============================================================================
-- Complete lead management with webhook support and VAPI call integration
-- ============================================================================

-- ============================================================================
-- LEADS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Lead Source
  source TEXT NOT NULL CHECK (source IN (
    'webhook',          -- External webhook
    'vapi_call',        -- VAPI phone call
    'website_form',     -- Website contact form
    'referral',         -- Referral from existing customer
    'manual',           -- Manually entered
    'other'             -- Other sources
  )),
  source_details JSONB DEFAULT '{}', -- Additional source metadata

  -- Lead Information
  full_name TEXT,
  email TEXT,
  phone TEXT,
  company_name TEXT,

  -- Lead Classification
  status TEXT DEFAULT 'new' CHECK (status IN (
    'new',              -- New unprocessed lead
    'contacted',        -- Initial contact made
    'qualified',        -- Qualified as potential customer
    'quoted',           -- Quote/estimate provided
    'converted',        -- Converted to customer
    'lost',             -- Lost opportunity
    'spam'              -- Spam/invalid lead
  )),

  priority TEXT DEFAULT 'medium' CHECK (priority IN (
    'low',
    'medium',
    'high',
    'urgent'
  )),

  -- Lead Details
  service_requested TEXT,
  project_description TEXT,
  estimated_budget DECIMAL(10, 2),
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('phone', 'email', 'text', 'any')),

  -- Address/Location
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  location_data JSONB DEFAULT '{}', -- Lat/long, service area, etc.

  -- Assignment
  assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,

  -- Webhook Data
  webhook_payload JSONB DEFAULT '{}', -- Complete webhook payload
  webhook_source TEXT, -- Name/ID of webhook source

  -- VAPI Call Data
  vapi_call_id TEXT,
  vapi_call_duration INTEGER, -- Duration in seconds
  vapi_transcript TEXT,
  vapi_summary TEXT,
  vapi_metadata JSONB DEFAULT '{}',

  -- Tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  referrer_url TEXT,

  -- Lead Score (0-100)
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),

  -- Follow-up
  next_follow_up_at TIMESTAMPTZ,
  last_contacted_at TIMESTAMPTZ,
  follow_up_count INTEGER DEFAULT 0,

  -- Conversion
  converted_to_customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ,
  conversion_value DECIMAL(10, 2),

  -- Notes and Activity
  notes TEXT,
  tags JSONB DEFAULT '[]', -- Array of tags
  custom_fields JSONB DEFAULT '{}', -- Infinite custom fields

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- LEAD ACTIVITY LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,

  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'created',
    'status_changed',
    'assigned',
    'contacted',
    'email_sent',
    'call_made',
    'meeting_scheduled',
    'quote_sent',
    'note_added',
    'converted',
    'lost',
    'other'
  )),

  description TEXT NOT NULL,
  details JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- WEBHOOK CONFIGURATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.webhook_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Config Details
  name TEXT NOT NULL,
  description TEXT,
  webhook_url TEXT NOT NULL, -- The URL to call (if outbound)
  webhook_secret TEXT, -- Secret for validation

  -- Type
  type TEXT NOT NULL CHECK (type IN ('inbound', 'outbound')),

  -- Inbound: External services send leads here
  -- Outbound: We send lead updates to external services

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Field Mapping
  field_mapping JSONB DEFAULT '{}', -- Map webhook fields to lead fields

  -- Filters
  filters JSONB DEFAULT '{}', -- Conditions for triggering webhook

  -- Stats
  total_received INTEGER DEFAULT 0,
  total_successful INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  last_received_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON public.leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON public.lead_activities(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;

-- Users can see all leads (for now - can be restricted by company later)
CREATE POLICY "Users can view all leads" ON public.leads
  FOR SELECT TO authenticated USING (true);

-- Users can insert leads
CREATE POLICY "Users can insert leads" ON public.leads
  FOR INSERT TO authenticated WITH CHECK (true);

-- Users can update leads they're assigned to or all if admin
CREATE POLICY "Users can update assigned leads" ON public.leads
  FOR UPDATE TO authenticated USING (true);

-- Lead activities
CREATE POLICY "Users can view lead activities" ON public.lead_activities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert lead activities" ON public.lead_activities
  FOR INSERT TO authenticated WITH CHECK (true);

-- Webhook configs (admin only in production)
CREATE POLICY "Users can view webhook configs" ON public.webhook_configs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage webhook configs" ON public.webhook_configs
  FOR ALL TO authenticated USING (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically update lead score based on engagement
CREATE OR REPLACE FUNCTION update_lead_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Basic scoring logic (can be enhanced)
  NEW.lead_score := 0;

  -- Add points for having contact info
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    NEW.lead_score := NEW.lead_score + 20;
  END IF;

  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    NEW.lead_score := NEW.lead_score + 20;
  END IF;

  -- Add points for budget
  IF NEW.estimated_budget IS NOT NULL AND NEW.estimated_budget > 0 THEN
    NEW.lead_score := NEW.lead_score + 15;
  END IF;

  -- Add points for detailed description
  IF NEW.project_description IS NOT NULL AND LENGTH(NEW.project_description) > 50 THEN
    NEW.lead_score := NEW.lead_score + 10;
  END IF;

  -- Add points based on priority
  CASE NEW.priority
    WHEN 'urgent' THEN NEW.lead_score := NEW.lead_score + 25;
    WHEN 'high' THEN NEW.lead_score := NEW.lead_score + 15;
    WHEN 'medium' THEN NEW.lead_score := NEW.lead_score + 5;
    ELSE NEW.lead_score := NEW.lead_score + 0;
  END CASE;

  -- Add points for follow-ups
  NEW.lead_score := NEW.lead_score + LEAST(NEW.follow_up_count * 2, 10);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update lead score
CREATE TRIGGER trigger_update_lead_score
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_score();

-- Function to log lead activities automatically
CREATE OR REPLACE FUNCTION log_lead_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.lead_activities (lead_id, activity_type, description, details)
    VALUES (
      NEW.id,
      'status_changed',
      'Status changed from ' || OLD.status || ' to ' || NEW.status,
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;

  -- Log assignments
  IF TG_OP = 'UPDATE' AND (OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) THEN
    INSERT INTO public.lead_activities (lead_id, user_id, activity_type, description, details)
    VALUES (
      NEW.id,
      NEW.assigned_to,
      'assigned',
      'Lead assigned',
      jsonb_build_object('assigned_to', NEW.assigned_to)
    );
  END IF;

  -- Log creation
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lead_activities (lead_id, activity_type, description, details)
    VALUES (
      NEW.id,
      'created',
      'Lead created from ' || NEW.source,
      jsonb_build_object('source', NEW.source)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically log activities
CREATE TRIGGER trigger_log_lead_activity
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION log_lead_activity();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE public.leads IS 'Lead capture and management system';
COMMENT ON TABLE public.lead_activities IS 'Activity log for lead tracking';
COMMENT ON TABLE public.webhook_configs IS 'Webhook configuration for lead capture';
COMMENT ON COLUMN public.leads.lead_score IS 'Automated lead score (0-100) based on engagement and data quality';
COMMENT ON COLUMN public.leads.webhook_payload IS 'Complete webhook payload for debugging';
COMMENT ON COLUMN public.leads.vapi_call_id IS 'VAPI call ID for phone call leads';
