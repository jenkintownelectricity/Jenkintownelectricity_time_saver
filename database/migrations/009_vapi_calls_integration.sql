-- ============================================================================
-- VAPI Calls Integration Migration
-- ============================================================================
-- Call logging and management for VAPI phone system
-- ============================================================================

-- ============================================================================
-- VAPI CALLS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vapi_calls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Call Identification
  vapi_call_id TEXT UNIQUE NOT NULL,
  assistant_id TEXT, -- VAPI assistant ID used
  agent_type TEXT, -- Which AI agent handled the call (electrical, restoration, office, sales)

  -- Caller Information
  caller_phone TEXT,
  caller_name TEXT,
  caller_email TEXT,

  -- Call Details
  direction TEXT DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'in_progress' CHECK (status IN (
    'in_progress',
    'completed',
    'missed',
    'failed',
    'converted',
    'followup_needed'
  )),

  duration INTEGER DEFAULT 0, -- Duration in seconds

  -- Content
  transcript TEXT,
  recording_url TEXT,
  summary TEXT,

  -- Extracted Data
  extracted_data JSONB DEFAULT '{}', -- Customer info, service requested, urgency, etc.
  urgency TEXT CHECK (urgency IN ('emergency', 'routine', 'scheduled', 'unknown')),

  -- Lead Association
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  lead_created BOOLEAN DEFAULT false,
  appointment_created BOOLEAN DEFAULT false,
  appointment_id UUID, -- Reference to appointment if created

  -- Customer Association
  customer_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,

  -- Call Timing
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  -- Cost Tracking
  cost DECIMAL(10, 4), -- Cost of the call
  cost_breakdown JSONB DEFAULT '{}', -- Detailed cost breakdown

  -- Tags and Classification
  tags JSONB DEFAULT '[]',

  -- Metadata
  metadata JSONB DEFAULT '{}',
  vapi_metadata JSONB DEFAULT '{}', -- Raw VAPI metadata

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- VAPI CALL ANALYTICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vapi_call_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Time Period
  date DATE NOT NULL,
  hour INTEGER CHECK (hour >= 0 AND hour <= 23),

  -- Agent Performance
  agent_type TEXT, -- electrical, restoration, office, sales

  -- Call Statistics
  total_calls INTEGER DEFAULT 0,
  completed_calls INTEGER DEFAULT 0,
  missed_calls INTEGER DEFAULT 0,
  failed_calls INTEGER DEFAULT 0,

  -- Duration Statistics
  total_duration_seconds INTEGER DEFAULT 0,
  average_duration_seconds INTEGER DEFAULT 0,

  -- Conversion Statistics
  leads_created INTEGER DEFAULT 0,
  appointments_created INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0, -- Percentage

  -- Cost Statistics
  total_cost DECIMAL(10, 2) DEFAULT 0,
  average_cost_per_call DECIMAL(10, 4) DEFAULT 0,

  -- Urgency Breakdown
  emergency_calls INTEGER DEFAULT 0,
  routine_calls INTEGER DEFAULT 0,
  scheduled_calls INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint to prevent duplicates
  UNIQUE(date, hour, agent_type)
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_vapi_calls_vapi_call_id ON public.vapi_calls(vapi_call_id);
CREATE INDEX IF NOT EXISTS idx_vapi_calls_caller_phone ON public.vapi_calls(caller_phone);
CREATE INDEX IF NOT EXISTS idx_vapi_calls_status ON public.vapi_calls(status);
CREATE INDEX IF NOT EXISTS idx_vapi_calls_agent_type ON public.vapi_calls(agent_type);
CREATE INDEX IF NOT EXISTS idx_vapi_calls_lead_id ON public.vapi_calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_vapi_calls_customer_id ON public.vapi_calls(customer_id);
CREATE INDEX IF NOT EXISTS idx_vapi_calls_started_at ON public.vapi_calls(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_vapi_calls_created_at ON public.vapi_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vapi_call_analytics_date ON public.vapi_call_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_vapi_call_analytics_agent ON public.vapi_call_analytics(agent_type);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.vapi_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vapi_call_analytics ENABLE ROW LEVEL SECURITY;

-- Users can view all VAPI calls
CREATE POLICY "Users can view VAPI calls" ON public.vapi_calls
  FOR SELECT TO authenticated USING (true);

-- Users can insert VAPI calls
CREATE POLICY "Users can insert VAPI calls" ON public.vapi_calls
  FOR INSERT TO authenticated WITH CHECK (true);

-- Users can update VAPI calls
CREATE POLICY "Users can update VAPI calls" ON public.vapi_calls
  FOR UPDATE TO authenticated USING (true);

-- Analytics policies
CREATE POLICY "Users can view VAPI analytics" ON public.vapi_call_analytics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can manage VAPI analytics" ON public.vapi_call_analytics
  FOR ALL TO authenticated USING (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_vapi_calls_updated_at BEFORE UPDATE ON public.vapi_calls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vapi_call_analytics_updated_at BEFORE UPDATE ON public.vapi_call_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update analytics when call is completed
CREATE OR REPLACE FUNCTION update_vapi_call_analytics()
RETURNS TRIGGER AS $$
DECLARE
  call_date DATE;
  call_hour INTEGER;
BEGIN
  -- Only process completed calls
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    call_date := DATE(NEW.ended_at);
    call_hour := EXTRACT(HOUR FROM NEW.ended_at)::INTEGER;

    -- Insert or update analytics record
    INSERT INTO public.vapi_call_analytics (
      date,
      hour,
      agent_type,
      total_calls,
      completed_calls,
      total_duration_seconds,
      average_duration_seconds,
      leads_created,
      appointments_created,
      total_cost,
      average_cost_per_call,
      emergency_calls,
      routine_calls,
      scheduled_calls
    )
    VALUES (
      call_date,
      call_hour,
      NEW.agent_type,
      1,
      1,
      NEW.duration,
      NEW.duration,
      CASE WHEN NEW.lead_created THEN 1 ELSE 0 END,
      CASE WHEN NEW.appointment_created THEN 1 ELSE 0 END,
      COALESCE(NEW.cost, 0),
      COALESCE(NEW.cost, 0),
      CASE WHEN NEW.urgency = 'emergency' THEN 1 ELSE 0 END,
      CASE WHEN NEW.urgency = 'routine' THEN 1 ELSE 0 END,
      CASE WHEN NEW.urgency = 'scheduled' THEN 1 ELSE 0 END
    )
    ON CONFLICT (date, hour, agent_type) DO UPDATE SET
      total_calls = public.vapi_call_analytics.total_calls + 1,
      completed_calls = public.vapi_call_analytics.completed_calls + 1,
      total_duration_seconds = public.vapi_call_analytics.total_duration_seconds + NEW.duration,
      average_duration_seconds = (public.vapi_call_analytics.total_duration_seconds + NEW.duration) / (public.vapi_call_analytics.completed_calls + 1),
      leads_created = public.vapi_call_analytics.leads_created + CASE WHEN NEW.lead_created THEN 1 ELSE 0 END,
      appointments_created = public.vapi_call_analytics.appointments_created + CASE WHEN NEW.appointment_created THEN 1 ELSE 0 END,
      total_cost = public.vapi_call_analytics.total_cost + COALESCE(NEW.cost, 0),
      average_cost_per_call = (public.vapi_call_analytics.total_cost + COALESCE(NEW.cost, 0)) / (public.vapi_call_analytics.total_calls + 1),
      emergency_calls = public.vapi_call_analytics.emergency_calls + CASE WHEN NEW.urgency = 'emergency' THEN 1 ELSE 0 END,
      routine_calls = public.vapi_call_analytics.routine_calls + CASE WHEN NEW.urgency = 'routine' THEN 1 ELSE 0 END,
      scheduled_calls = public.vapi_call_analytics.scheduled_calls + CASE WHEN NEW.urgency = 'scheduled' THEN 1 ELSE 0 END,
      conversion_rate = CASE
        WHEN (public.vapi_call_analytics.completed_calls + 1) > 0
        THEN ((public.vapi_call_analytics.leads_created + CASE WHEN NEW.lead_created THEN 1 ELSE 0 END)::DECIMAL / (public.vapi_call_analytics.completed_calls + 1)::DECIMAL) * 100
        ELSE 0
      END,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics
CREATE TRIGGER trigger_update_vapi_call_analytics
  AFTER INSERT OR UPDATE ON public.vapi_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_vapi_call_analytics();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE public.vapi_calls IS 'VAPI phone call logs and data';
COMMENT ON TABLE public.vapi_call_analytics IS 'Analytics and statistics for VAPI calls';
COMMENT ON COLUMN public.vapi_calls.agent_type IS 'Which AI agent handled the call: electrical, restoration, office, or sales';
COMMENT ON COLUMN public.vapi_calls.extracted_data IS 'Structured data extracted from call transcript';
COMMENT ON COLUMN public.vapi_calls.vapi_metadata IS 'Raw metadata from VAPI webhook';
