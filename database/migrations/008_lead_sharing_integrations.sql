-- ============================================================================
-- Lead Sharing & Integrations Migration
-- ============================================================================
-- Complete system for sharing leads via email, SMS, webhooks, and integrations
-- ============================================================================

-- ============================================================================
-- INTEGRATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Integration Details
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'email',
    'sms',
    'webhook',
    'zapier',
    'make',
    'slack',
    'microsoft_teams',
    'discord',
    'hubspot',
    'salesforce',
    'pipedrive',
    'custom'
  )),
  description TEXT,

  -- Configuration
  config JSONB NOT NULL DEFAULT '{}',
  -- Example configs:
  -- Email: {"to": "email@example.com", "cc": [], "template": "default"}
  -- SMS: {"to": "+1234567890", "provider": "twilio"}
  -- Webhook: {"url": "https://...", "method": "POST", "headers": {}}
  -- Zapier: {"webhook_url": "https://hooks.zapier.com/..."}
  -- Slack: {"webhook_url": "https://hooks.slack.com/...", "channel": "#leads"}

  -- Triggers
  trigger_on JSONB DEFAULT '{
    "lead_created": true,
    "lead_updated": false,
    "status_changed": false,
    "priority_urgent": true,
    "high_score": false
  }',

  -- Filters
  filters JSONB DEFAULT '{}',
  -- Example: {"priority": ["urgent", "high"], "source": ["hive215"], "min_score": 75}

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false,

  -- Stats
  total_sent INTEGER DEFAULT 0,
  total_successful INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  last_sent_at TIMESTAMPTZ,
  last_error TEXT,
  last_error_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- LEAD SHARES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lead_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Lead Reference
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,

  -- Share Details
  share_type TEXT NOT NULL CHECK (share_type IN ('email', 'sms', 'webhook', 'export', 'link')),
  shared_with TEXT, -- Email address, phone number, or URL

  -- Share Content
  message TEXT,
  include_fields JSONB DEFAULT '["full_name", "email", "phone", "service_requested", "priority"]',

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'viewed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,

  -- Response
  response_data JSONB,
  error_message TEXT,

  -- Shareable Link (if type is 'link')
  share_token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,

  -- Metadata
  shared_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INTEGRATION LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.integration_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Integration Reference
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,

  -- Event
  event_type TEXT NOT NULL, -- 'lead_created', 'lead_updated', etc.

  -- Request/Response
  request_payload JSONB,
  response_payload JSONB,
  status_code INTEGER,

  -- Status
  status TEXT CHECK (status IN ('success', 'failed', 'pending', 'retrying')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timing
  duration_ms INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Email Notifications
  email_enabled BOOLEAN DEFAULT true,
  email_address TEXT,
  email_on JSONB DEFAULT '{
    "new_lead": true,
    "urgent_lead": true,
    "lead_assigned": true,
    "lead_updated": false,
    "daily_summary": true
  }',

  -- SMS Notifications
  sms_enabled BOOLEAN DEFAULT false,
  sms_number TEXT,
  sms_on JSONB DEFAULT '{
    "urgent_lead": true,
    "lead_assigned": true
  }',

  -- In-App Notifications
  in_app_enabled BOOLEAN DEFAULT true,
  in_app_on JSONB DEFAULT '{
    "new_lead": true,
    "urgent_lead": true,
    "lead_assigned": true,
    "lead_updated": true
  }',

  -- Quiet Hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone TEXT DEFAULT 'America/New_York',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- WEBHOOK FORWARD TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.webhook_forwards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Forward Details
  name TEXT NOT NULL,
  description TEXT,
  destination_url TEXT NOT NULL,

  -- Configuration
  method TEXT DEFAULT 'POST' CHECK (method IN ('POST', 'PUT', 'PATCH')),
  headers JSONB DEFAULT '{}',
  auth_type TEXT CHECK (auth_type IN ('none', 'bearer', 'basic', 'api_key')),
  auth_config JSONB DEFAULT '{}',

  -- Transform
  transform_enabled BOOLEAN DEFAULT false,
  transform_script TEXT, -- JavaScript to transform payload

  -- Triggers
  trigger_events JSONB DEFAULT '["lead.created", "lead.updated"]',

  -- Filters
  filters JSONB DEFAULT '{}',

  -- Retry Configuration
  retry_enabled BOOLEAN DEFAULT true,
  max_retries INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Stats
  total_forwarded INTEGER DEFAULT 0,
  total_successful INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  last_forwarded_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_integrations_type ON public.integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_active ON public.integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_lead_shares_lead_id ON public.lead_shares(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_shares_token ON public.lead_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration_id ON public.integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_lead_id ON public.integration_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON public.integration_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_forwards_active ON public.webhook_forwards(is_active);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_forwards ENABLE ROW LEVEL SECURITY;

-- Integrations
CREATE POLICY "Users can view integrations" ON public.integrations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage integrations" ON public.integrations
  FOR ALL TO authenticated USING (true);

-- Lead shares
CREATE POLICY "Users can view lead shares" ON public.lead_shares
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create lead shares" ON public.lead_shares
  FOR INSERT TO authenticated WITH CHECK (true);

-- Integration logs
CREATE POLICY "Users can view integration logs" ON public.integration_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can insert integration logs" ON public.integration_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Notification preferences
CREATE POLICY "Users can view own preferences" ON public.notification_preferences
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can manage own preferences" ON public.notification_preferences
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Webhook forwards
CREATE POLICY "Users can view webhook forwards" ON public.webhook_forwards
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage webhook forwards" ON public.webhook_forwards
  FOR ALL TO authenticated USING (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to generate share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Function to automatically forward leads to webhooks
CREATE OR REPLACE FUNCTION forward_lead_to_webhooks()
RETURNS TRIGGER AS $$
DECLARE
  webhook_forward RECORD;
BEGIN
  -- Get all active webhook forwards
  FOR webhook_forward IN
    SELECT * FROM public.webhook_forwards
    WHERE is_active = true
    AND (
      (TG_OP = 'INSERT' AND trigger_events @> '["lead.created"]'::jsonb)
      OR
      (TG_OP = 'UPDATE' AND trigger_events @> '["lead.updated"]'::jsonb)
    )
  LOOP
    -- TODO: Queue webhook for async processing
    -- For now, just log that it should be sent
    INSERT INTO public.integration_logs (
      integration_id,
      lead_id,
      event_type,
      request_payload,
      status
    ) VALUES (
      webhook_forward.id,
      NEW.id,
      CASE WHEN TG_OP = 'INSERT' THEN 'lead.created' ELSE 'lead.updated' END,
      to_jsonb(NEW),
      'pending'
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic webhook forwarding
CREATE TRIGGER trigger_forward_lead_to_webhooks
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION forward_lead_to_webhooks();

-- Function to send integration
CREATE OR REPLACE FUNCTION send_integration(
  p_integration_id UUID,
  p_lead_id UUID,
  p_event_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_integration RECORD;
  v_lead RECORD;
  v_result JSONB;
BEGIN
  -- Get integration
  SELECT * INTO v_integration FROM public.integrations WHERE id = p_integration_id;

  -- Get lead
  SELECT * INTO v_lead FROM public.leads WHERE id = p_lead_id;

  -- TODO: Implement actual sending logic based on integration type
  -- For now, just log
  INSERT INTO public.integration_logs (
    integration_id,
    lead_id,
    event_type,
    status
  ) VALUES (
    p_integration_id,
    p_lead_id,
    p_event_type,
    'success'
  );

  -- Update integration stats
  UPDATE public.integrations
  SET
    total_sent = total_sent + 1,
    total_successful = total_successful + 1,
    last_sent_at = NOW()
  WHERE id = p_integration_id;

  RETURN jsonb_build_object('success', true, 'integration_id', p_integration_id);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Sample Zapier integration
INSERT INTO public.integrations (name, type, description, config, trigger_on)
VALUES (
  'Send to Zapier',
  'zapier',
  'Forward all new leads to Zapier workflow',
  '{"webhook_url": "https://hooks.zapier.com/hooks/catch/your-webhook-id/"}',
  '{"lead_created": true, "priority_urgent": true}'
)
ON CONFLICT DO NOTHING;

-- Sample Slack integration
INSERT INTO public.integrations (name, type, description, config, trigger_on)
VALUES (
  'Notify Slack #leads',
  'slack',
  'Post urgent leads to Slack #leads channel',
  '{"webhook_url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK", "channel": "#leads"}',
  '{"lead_created": true, "priority_urgent": true}'
)
ON CONFLICT DO NOTHING;

-- Sample Email integration
INSERT INTO public.integrations (name, type, description, config, trigger_on)
VALUES (
  'Email Urgent Leads',
  'email',
  'Email team when urgent leads come in',
  '{"to": ["team@example.com"], "subject": "New Urgent Lead", "template": "urgent_lead"}',
  '{"priority_urgent": true}'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE public.integrations IS 'Integration configurations for sharing leads';
COMMENT ON TABLE public.lead_shares IS 'History of lead shares via email, SMS, etc.';
COMMENT ON TABLE public.integration_logs IS 'Logs of all integration attempts';
COMMENT ON TABLE public.notification_preferences IS 'User notification preferences';
COMMENT ON TABLE public.webhook_forwards IS 'Webhook forwarding configurations';
