-- ============================================================================
-- Migration 005: Additional Tables & Performance Enhancements
-- ============================================================================
-- Date: 2025-11-16
-- Description: Add notifications, email queue, webhooks, full-text search,
--              materialized views, and storage integration
-- ============================================================================

-- ============================================================================
-- NOTIFICATIONS SYSTEM
-- ============================================================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Recipient
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,

  -- Notification Details
  type TEXT NOT NULL CHECK (type IN (
    'work_call_new',
    'work_call_claimed',
    'invoice_paid',
    'invoice_overdue',
    'appointment_reminder',
    'appointment_confirmed',
    'team_member_joined',
    'payment_received',
    'document_viewed',
    'subscription_expiring',
    'usage_limit_warning',
    'system_announcement'
  )),
  title TEXT NOT NULL,
  message TEXT,

  -- Action
  link TEXT, -- Where to go when clicked
  action_type TEXT, -- 'view_document', 'claim_call', 'view_invoice'
  action_data JSONB, -- Additional data for the action

  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  archived BOOLEAN DEFAULT false,

  -- Priority
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- Auto-delete old notifications
);

-- ============================================================================
-- EMAIL QUEUE (Async email sending)
-- ============================================================================
CREATE TABLE public.email_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Sender Info
  from_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  from_company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,

  -- Recipient
  to_email TEXT NOT NULL,
  to_name TEXT,
  cc_emails TEXT[], -- Array of CC emails
  bcc_emails TEXT[], -- Array of BCC emails

  -- Email Content
  subject TEXT NOT NULL,
  html_body TEXT,
  text_body TEXT,

  -- Template-based emails
  template_name TEXT, -- 'invoice_sent', 'appointment_reminder', 'welcome'
  template_data JSONB, -- Variables to inject into template

  -- Attachments
  attachments JSONB DEFAULT '[]', -- Array of {filename, url, contentType}

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing',
    'sent',
    'failed',
    'bounced',
    'cancelled'
  )),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  provider TEXT, -- 'resend', 'sendgrid', 'smtp'

  -- Scheduling
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,

  -- Tracking
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- WEBHOOK EVENTS (For integrations like QuickBooks, Stripe, Zapier)
-- ============================================================================
CREATE TABLE public.webhook_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Source
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,

  -- Event Details
  event_type TEXT NOT NULL, -- 'invoice.created', 'payment.received', 'appointment.scheduled'
  event_source TEXT NOT NULL, -- 'internal', 'stripe', 'quickbooks'
  payload JSONB NOT NULL,

  -- Target Webhook
  webhook_url TEXT,
  webhook_secret TEXT, -- For HMAC signature verification

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing',
    'success',
    'failed',
    'retrying'
  )),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,

  -- Response
  response_code INTEGER,
  response_body TEXT,
  response_headers JSONB,
  last_error TEXT,

  -- Retry Logic
  next_retry_at TIMESTAMPTZ,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- ============================================================================
-- API RATE LIMITING
-- ============================================================================
CREATE TABLE public.api_rate_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- User/Company
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  ip_address INET,

  -- Endpoint
  endpoint TEXT NOT NULL, -- '/api/photo/analyze', '/api/nec/lookup'
  http_method TEXT, -- 'GET', 'POST', etc.

  -- Rate Limit Window
  window_start TIMESTAMPTZ NOT NULL,
  window_duration_seconds INTEGER NOT NULL DEFAULT 3600, -- 1 hour default
  requests_count INTEGER DEFAULT 1,
  requests_limit INTEGER NOT NULL, -- Max requests allowed in window

  -- Exceeded
  limit_exceeded BOOLEAN DEFAULT false,
  exceeded_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ACTIVITY LOG (Track all user actions for analytics)
-- ============================================================================
CREATE TABLE public.activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Actor
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,

  -- Action
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'viewed', 'sent', 'downloaded'
  entity_type TEXT NOT NULL, -- 'invoice', 'contact', 'receipt', 'work_call'
  entity_id UUID,

  -- Details
  description TEXT,
  changes JSONB, -- Before/after values for updates

  -- Context
  ip_address INET,
  user_agent TEXT,
  referer TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STORAGE: Add columns for file URLs
-- ============================================================================

-- Add avatar/logo storage URLs
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_storage_path TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS logo_storage_path TEXT;

-- Add file attachments to contacts
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]';
-- Example: [{"name": "license.pdf", "url": "...", "size": 12345, "type": "application/pdf"}]

-- Add PDF storage to financial documents
ALTER TABLE public.financial_documents ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT;
ALTER TABLE public.financial_documents ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMPTZ;

-- ============================================================================
-- FULL-TEXT SEARCH
-- ============================================================================

-- Add search vectors to contacts
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create search index
CREATE INDEX IF NOT EXISTS idx_contacts_search ON public.contacts USING gin(search_vector);

-- Auto-update search vector on insert/update
CREATE OR REPLACE FUNCTION contacts_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.phone, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.mobile, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.address, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.notes, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contacts_search_update
  BEFORE INSERT OR UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION contacts_search_trigger();

-- Backfill existing records
UPDATE public.contacts SET search_vector =
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(email, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(phone, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(mobile, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(address, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(city, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(notes, '')), 'D')
WHERE search_vector IS NULL;

-- Add search to financial documents
ALTER TABLE public.financial_documents ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_financial_documents_search ON public.financial_documents USING gin(search_vector);

CREATE OR REPLACE FUNCTION financial_documents_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.document_number, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER financial_documents_search_update
  BEFORE INSERT OR UPDATE ON public.financial_documents
  FOR EACH ROW EXECUTE FUNCTION financial_documents_search_trigger();

-- ============================================================================
-- MATERIALIZED VIEWS (For fast dashboard queries)
-- ============================================================================

-- Dashboard statistics per user/company
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT
  fd.user_id,
  fd.company_id,
  COUNT(*) FILTER (WHERE fd.document_type = 'invoice') as total_invoices,
  COUNT(*) FILTER (WHERE fd.document_type = 'estimate') as total_estimates,
  COUNT(*) FILTER (WHERE fd.document_type = 'work_order') as total_work_orders,
  SUM(fd.total) FILTER (WHERE fd.document_type = 'invoice' AND fd.status = 'paid') as total_revenue,
  SUM(fd.total) FILTER (WHERE fd.document_type = 'invoice' AND fd.status IN ('sent', 'viewed', 'approved')) as outstanding_revenue,
  COUNT(DISTINCT fd.contact_id) as total_customers,
  AVG(fd.total) FILTER (WHERE fd.document_type = 'invoice') as avg_invoice_value,
  MAX(fd.created_at) FILTER (WHERE fd.document_type = 'invoice') as last_invoice_date
FROM public.financial_documents fd
GROUP BY fd.user_id, fd.company_id;

CREATE UNIQUE INDEX idx_dashboard_stats_user_company ON dashboard_stats(user_id, company_id);

-- Monthly revenue stats
CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_revenue_stats AS
SELECT
  user_id,
  company_id,
  DATE_TRUNC('month', document_date) as month,
  SUM(total) FILTER (WHERE status = 'paid') as revenue,
  COUNT(*) as invoice_count,
  AVG(total) as avg_invoice_value
FROM public.financial_documents
WHERE document_type = 'invoice'
GROUP BY user_id, company_id, DATE_TRUNC('month', document_date);

CREATE INDEX idx_monthly_revenue_user ON monthly_revenue_stats(user_id, month);

-- ============================================================================
-- INDEXES (Performance optimization)
-- ============================================================================

-- Notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_company_id ON public.notifications(company_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Email Queue
CREATE INDEX idx_email_queue_status ON public.email_queue(status);
CREATE INDEX idx_email_queue_scheduled ON public.email_queue(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_email_queue_to_email ON public.email_queue(to_email);
CREATE INDEX idx_email_queue_template ON public.email_queue(template_name);

-- Webhook Events
CREATE INDEX idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX idx_webhook_events_type ON public.webhook_events(event_type);
CREATE INDEX idx_webhook_events_retry ON public.webhook_events(next_retry_at) WHERE status = 'retrying';
CREATE INDEX idx_webhook_events_user ON public.webhook_events(user_id);

-- API Rate Limits
CREATE INDEX idx_rate_limits_user_endpoint ON public.api_rate_limits(user_id, endpoint, window_start);
CREATE INDEX idx_rate_limits_ip ON public.api_rate_limits(ip_address, window_start);
CREATE INDEX idx_rate_limits_exceeded ON public.api_rate_limits(limit_exceeded) WHERE limit_exceeded = true;

-- Activity Log
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created ON public.activity_log(created_at DESC);
CREATE INDEX idx_activity_log_action ON public.activity_log(action);

-- Partial indexes for active work calls (faster queries)
CREATE INDEX IF NOT EXISTS idx_work_calls_active_with_expiry
ON public.work_calls(status, expires_at, company_id)
WHERE status = 'active';

-- Partial indexes for unpaid invoices
CREATE INDEX IF NOT EXISTS idx_invoices_unpaid
ON public.financial_documents(status, due_date, contact_id)
WHERE document_type = 'invoice' AND status IN ('sent', 'viewed', 'approved', 'overdue');

-- ============================================================================
-- TRIGGERS (Auto-update timestamps)
-- ============================================================================

CREATE TRIGGER update_email_queue_updated_at BEFORE UPDATE ON public.email_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhook_events_updated_at BEFORE UPDATE ON public.webhook_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_rate_limits_updated_at BEFORE UPDATE ON public.api_rate_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_revenue_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE (read = true AND created_at < NOW() - INTERVAL '30 days')
     OR (expires_at IS NOT NULL AND expires_at < NOW());
END;
$$ LANGUAGE plpgsql;

-- Function to retry failed webhook events
CREATE OR REPLACE FUNCTION retry_failed_webhooks()
RETURNS void AS $$
BEGIN
  UPDATE public.webhook_events
  SET
    status = 'retrying',
    next_retry_at = NOW() + (INTERVAL '1 minute' * POWER(2, retry_count)),
    retry_count = retry_count + 1,
    updated_at = NOW()
  WHERE status = 'failed'
    AND retry_count < max_attempts
    AND (next_retry_at IS NULL OR next_retry_at <= NOW());
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Notifications: Users can only see their own notifications
CREATE POLICY notifications_select ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY notifications_update ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Email Queue: Users can only see their own emails
CREATE POLICY email_queue_select ON public.email_queue
  FOR SELECT USING (auth.uid() = from_user_id);

-- Webhook Events: Users can only see their own webhook events
CREATE POLICY webhook_events_select ON public.webhook_events
  FOR SELECT USING (auth.uid() = user_id);

-- Activity Log: Users can only see their own activity
CREATE POLICY activity_log_select ON public.activity_log
  FOR SELECT USING (auth.uid() = user_id);

-- API Rate Limits: Users can see their own rate limit status
CREATE POLICY api_rate_limits_select ON public.api_rate_limits
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
