-- ============================================================================
-- HiVE215 Integration Migration
-- ============================================================================
-- Phone number management and HiVE215 integration
-- ============================================================================

-- ============================================================================
-- HIVE215 PHONE NUMBERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.hive215_phone_numbers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Phone Number Details
  phone_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL, -- e.g., "Main Line", "Emergency Line", "Sales"
  description TEXT,

  -- Organization
  department TEXT, -- e.g., "Sales", "Support", "Emergency"
  assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,

  -- HiVE215 Configuration
  hive215_number_id TEXT, -- ID in HiVE215 system
  hive215_config JSONB DEFAULT '{}', -- HiVE215-specific settings

  -- Call Routing
  forward_to TEXT, -- Phone number to forward to
  voicemail_enabled BOOLEAN DEFAULT true,
  greeting_message TEXT,

  -- Business Hours
  business_hours JSONB DEFAULT '{
    "monday": {"start": "09:00", "end": "17:00"},
    "tuesday": {"start": "09:00", "end": "17:00"},
    "wednesday": {"start": "09:00", "end": "17:00"},
    "thursday": {"start": "09:00", "end": "17:00"},
    "friday": {"start": "09:00", "end": "17:00"},
    "saturday": null,
    "sunday": null
  }',

  -- Auto-Assignment Rules
  auto_assign_leads BOOLEAN DEFAULT true,
  assignment_rules JSONB DEFAULT '{}', -- Custom rules for lead assignment

  -- Tracking
  total_calls INTEGER DEFAULT 0,
  total_leads_generated INTEGER DEFAULT 0,
  last_call_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_emergency_line BOOLEAN DEFAULT false,

  -- Metadata
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- HIVE215 CALL LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.hive215_call_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Call Identification
  hive215_call_id TEXT UNIQUE,
  phone_number_id UUID REFERENCES public.hive215_phone_numbers(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,

  -- Caller Information
  caller_number TEXT,
  caller_name TEXT,
  caller_email TEXT,

  -- Call Details
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  status TEXT CHECK (status IN ('completed', 'missed', 'voicemail', 'busy', 'failed')),
  duration INTEGER, -- seconds
  recording_url TEXT,
  transcript TEXT,
  summary TEXT,

  -- Lead Association
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  lead_created BOOLEAN DEFAULT false,

  -- Call Metadata
  call_started_at TIMESTAMPTZ,
  call_ended_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- HIVE215 INTEGRATION CONFIG
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.hive215_integration_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Integration Details
  api_key TEXT, -- HiVE215 API key (encrypted)
  webhook_secret TEXT, -- Secret for webhook validation
  hive215_account_id TEXT,

  -- Configuration
  auto_create_leads BOOLEAN DEFAULT true,
  auto_assign_by_phone BOOLEAN DEFAULT true,
  sync_call_logs BOOLEAN DEFAULT true,

  -- Webhook URLs
  webhook_url TEXT, -- Our webhook URL for HiVE215
  status_callback_url TEXT,

  -- Features
  features JSONB DEFAULT '{
    "call_recording": true,
    "transcription": true,
    "ai_summary": true,
    "lead_scoring": true
  }',

  -- Stats
  total_calls_received INTEGER DEFAULT 0,
  total_leads_created INTEGER DEFAULT 0,
  last_sync_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_error TEXT,
  last_error_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_hive215_phone_numbers_active ON public.hive215_phone_numbers(is_active);
CREATE INDEX IF NOT EXISTS idx_hive215_phone_numbers_phone ON public.hive215_phone_numbers(phone_number);
CREATE INDEX IF NOT EXISTS idx_hive215_call_logs_phone_number ON public.hive215_call_logs(phone_number);
CREATE INDEX IF NOT EXISTS idx_hive215_call_logs_caller ON public.hive215_call_logs(caller_number);
CREATE INDEX IF NOT EXISTS idx_hive215_call_logs_lead_id ON public.hive215_call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_hive215_call_logs_created_at ON public.hive215_call_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.hive215_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hive215_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hive215_integration_config ENABLE ROW LEVEL SECURITY;

-- Phone numbers
CREATE POLICY "Users can view phone numbers" ON public.hive215_phone_numbers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage phone numbers" ON public.hive215_phone_numbers
  FOR ALL TO authenticated USING (true);

-- Call logs
CREATE POLICY "Users can view call logs" ON public.hive215_call_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert call logs" ON public.hive215_call_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Integration config
CREATE POLICY "Users can view integration config" ON public.hive215_integration_config
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage integration config" ON public.hive215_integration_config
  FOR ALL TO authenticated USING (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update phone number stats when call is logged
CREATE OR REPLACE FUNCTION update_hive215_phone_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.phone_number_id IS NOT NULL THEN
    UPDATE public.hive215_phone_numbers
    SET
      total_calls = total_calls + 1,
      total_leads_generated = total_leads_generated + CASE WHEN NEW.lead_created THEN 1 ELSE 0 END,
      last_call_at = NEW.call_started_at
    WHERE id = NEW.phone_number_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats
CREATE TRIGGER trigger_update_hive215_phone_stats
  AFTER INSERT ON public.hive215_call_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_hive215_phone_stats();

-- Function to log call in hive215_call_logs when lead is created from HiVE215
CREATE OR REPLACE FUNCTION log_hive215_call_on_lead_create()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if lead source is from HiVE215
  IF NEW.webhook_source = 'hive215' AND NEW.vapi_call_id IS NOT NULL THEN
    INSERT INTO public.hive215_call_logs (
      hive215_call_id,
      phone_number,
      caller_number,
      caller_name,
      caller_email,
      direction,
      status,
      duration,
      transcript,
      summary,
      lead_id,
      lead_created,
      call_started_at,
      metadata
    )
    VALUES (
      NEW.vapi_call_id,
      COALESCE((NEW.source_details->>'phone_number_called')::TEXT, 'unknown'),
      NEW.phone,
      NEW.full_name,
      NEW.email,
      'inbound',
      'completed',
      NEW.vapi_call_duration,
      NEW.vapi_transcript,
      NEW.vapi_summary,
      NEW.id,
      true,
      NEW.created_at,
      NEW.vapi_metadata
    )
    ON CONFLICT (hive215_call_id) DO UPDATE SET
      lead_id = NEW.id,
      lead_created = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log calls
CREATE TRIGGER trigger_log_hive215_call_on_lead_create
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION log_hive215_call_on_lead_create();

-- ============================================================================
-- SEED DATA - Example phone numbers
-- ============================================================================
INSERT INTO public.hive215_phone_numbers (phone_number, name, description, department, is_emergency_line, tags)
VALUES
  ('+1-555-0001', 'Main Line', 'Primary business line', 'General', false, '["main", "business"]'::jsonb),
  ('+1-555-0002', 'Emergency Line', '24/7 emergency service', 'Emergency', true, '["emergency", "24/7"]'::jsonb),
  ('+1-555-0003', 'Sales Line', 'New customer inquiries', 'Sales', false, '["sales", "new-customers"]'::jsonb)
ON CONFLICT (phone_number) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE public.hive215_phone_numbers IS 'HiVE215 phone number management - supports up to 10 numbers';
COMMENT ON TABLE public.hive215_call_logs IS 'Call logs from HiVE215 system';
COMMENT ON TABLE public.hive215_integration_config IS 'HiVE215 integration configuration';
COMMENT ON COLUMN public.hive215_phone_numbers.business_hours IS 'Business hours in JSON format for automated routing';
COMMENT ON COLUMN public.hive215_phone_numbers.assignment_rules IS 'Custom rules for automatic lead assignment';
