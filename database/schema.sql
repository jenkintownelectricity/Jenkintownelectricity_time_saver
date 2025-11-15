-- ============================================================================
-- AppIo.AI - Complete Database Schema
-- ============================================================================
-- Flexible, permission-based architecture for infinite customization
-- Run this ONCE in Supabase SQL Editor for initial setup
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER PROFILES (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,

  -- Basic Info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,

  -- Role in platform
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'owner')),

  -- Metadata
  onboarding_completed BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMPTZ,

  -- Infinite custom fields
  preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMPANIES (Multi-tenant support)
-- ============================================================================
CREATE TABLE public.companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Company Info
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- ABC-DEF format

  -- Ownership
  owner_id UUID REFERENCES public.user_profiles(id) ON DELETE RESTRICT NOT NULL,

  -- Company Settings (flexible)
  settings JSONB DEFAULT '{
    "bidMode": "first-come",
    "emergencyBonus": 100,
    "daytimeBonus": 25,
    "scheduledBonus": 50,
    "emergencyTimeout": 5,
    "daytimeTimeout": 15,
    "scheduledTimeout": 15
  }',

  -- Network
  linked_companies JSONB DEFAULT '[]', -- Array of company IDs/codes

  -- Status
  is_active BOOLEAN DEFAULT true,
  archived BOOLEAN DEFAULT false,

  -- Infinite custom fields
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMPANY MEMBERS (Many-to-Many relationship)
-- ============================================================================
CREATE TABLE public.company_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Relationships
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,

  -- Member Info
  member_number TEXT, -- M2501234 format
  job_title TEXT,

  -- Permissions within this company
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'manager', 'admin', 'owner')),
  permissions JSONB DEFAULT '{}',

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_on_call BOOLEAN DEFAULT false,

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one user can't join same company twice
  UNIQUE(company_id, user_id)
);

-- ============================================================================
-- CONTACTS (Universal - replaces clients/vendors/contractors/etc.)
-- ============================================================================
CREATE TABLE public.contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Ownership (multi-tenant)
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,

  -- ===================================================================
  -- PERMISSION FLAGS (Multiple roles simultaneously!)
  -- ===================================================================
  -- Turn these on/off to give contacts different roles
  -- Same person can be client AND vendor AND contractor!
  is_client BOOLEAN DEFAULT false,
  is_contractor_1099 BOOLEAN DEFAULT false,
  is_employee BOOLEAN DEFAULT false,
  is_vendor BOOLEAN DEFAULT false,
  is_subcontractor BOOLEAN DEFAULT false,
  is_supplier BOOLEAN DEFAULT false,
  is_lead BOOLEAN DEFAULT false,
  is_partner BOOLEAN DEFAULT false,

  -- Financial Info
  billing_address TEXT,
  tax_id TEXT,
  payment_terms TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  archived BOOLEAN DEFAULT false,

  -- Rating/Notes
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  notes TEXT,
  tags JSONB DEFAULT '[]',

  -- ===================================================================
  -- INFINITE CUSTOMIZATION
  -- ===================================================================
  -- Store ANY additional fields here without changing schema
  custom_fields JSONB DEFAULT '{}',

  -- Examples of what can go in custom_fields:
  -- {
  --   "license_number": "12345",
  --   "insurance_expiry": "2025-12-31",
  --   "specialty": "residential",
  --   "referral_source": "google",
  --   "birthday": "1990-01-01",
  --   ... anything you want!
  -- }

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FINANCIAL DOCUMENTS (Universal - replaces invoices/estimates/work_orders/etc.)
-- ============================================================================
CREATE TABLE public.financial_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Ownership (multi-tenant)
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,

  -- ===================================================================
  -- DOCUMENT TYPE (Flexible - add new types anytime!)
  -- ===================================================================
  document_type TEXT NOT NULL CHECK (document_type IN (
    'invoice',
    'estimate',
    'quote',
    'work_order',
    'proposal',
    'contract',
    'receipt',
    'credit_note',
    'purchase_order'
  )),

  -- Document Info
  document_number TEXT NOT NULL, -- INV-001, EST-001, WO-001, etc.
  title TEXT,
  description TEXT,

  -- Dates
  document_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  valid_until DATE, -- for estimates/quotes

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft',
    'sent',
    'viewed',
    'approved',
    'rejected',
    'in_progress',
    'completed',
    'paid',
    'partially_paid',
    'overdue',
    'cancelled',
    'void'
  )),

  -- ===================================================================
  -- LINE ITEMS (Flexible array)
  -- ===================================================================
  line_items JSONB DEFAULT '[]',
  -- Example structure:
  -- [
  --   {
  --     "description": "Electrical panel upgrade",
  --     "quantity": 1,
  --     "unit_price": 1200.00,
  --     "total": 1200.00,
  --     "tax_rate": 0.08
  --   },
  --   ...
  -- ]

  -- Financial Totals
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,

  -- Payment tracking
  amount_paid DECIMAL(12,2) DEFAULT 0,
  balance_due DECIMAL(12,2) GENERATED ALWAYS AS (total - amount_paid) STORED,

  -- ===================================================================
  -- FEATURES ENABLED (Turn features on/off per document type)
  -- ===================================================================
  features_enabled JSONB DEFAULT '{}',
  -- Examples:
  -- {
  --   "allow_partial_payment": true,
  --   "require_signature": false,
  --   "send_reminders": true,
  --   "track_materials": true,
  --   "show_labor_hours": false
  -- }

  -- Relationships
  related_documents JSONB DEFAULT '[]', -- Links to other document IDs

  -- Files/Attachments
  attachments JSONB DEFAULT '[]',

  -- Status tracking
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,

  archived BOOLEAN DEFAULT false,

  -- ===================================================================
  -- INFINITE CUSTOMIZATION
  -- ===================================================================
  custom_fields JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- Unique constraint for document numbers per company
  UNIQUE(company_id, document_type, document_number)
);

-- ============================================================================
-- WORK CALLS (Uber-style job bidding system)
-- ============================================================================
CREATE TABLE public.work_calls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Ownership
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  created_by_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,

  -- Call Type
  call_type TEXT NOT NULL CHECK (call_type IN ('emergency', 'daytime', 'scheduled')),

  -- Call Info
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,

  -- Customer (can link to contact or store directly)
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,

  -- Bidding
  bonus DECIMAL(10,2) DEFAULT 0,
  bid_mode TEXT DEFAULT 'first-come' CHECK (bid_mode IN ('first-come', 'bidding')),
  bids JSONB DEFAULT '[]', -- Array of bid objects

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'in_progress', 'completed', 'expired', 'cancelled')),

  -- Claiming
  claimed_by_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,

  -- Timing
  expires_at TIMESTAMPTZ NOT NULL,
  scheduled_for TIMESTAMPTZ, -- For scheduled calls

  -- Completion
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,

  -- Link to financial document
  related_document_id UUID REFERENCES public.financial_documents(id) ON DELETE SET NULL,

  -- Custom fields
  custom_fields JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CALL STATISTICS (Track performance per user/company)
-- ============================================================================
CREATE TABLE public.call_statistics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Ownership
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,

  -- Stats
  total_calls INTEGER DEFAULT 0,
  claimed_calls INTEGER DEFAULT 0,
  completed_calls INTEGER DEFAULT 0,
  expired_calls INTEGER DEFAULT 0,
  cancelled_calls INTEGER DEFAULT 0,

  -- Performance
  total_bonus_earned DECIMAL(12,2) DEFAULT 0,
  average_response_time_seconds INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,

  -- Breakdown by type
  emergency_calls INTEGER DEFAULT 0,
  daytime_calls INTEGER DEFAULT 0,
  scheduled_calls INTEGER DEFAULT 0,

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one record per user/company per period
  UNIQUE(user_id, company_id, period_start, period_end)
);

-- ============================================================================
-- INDEXES (Performance optimization)
-- ============================================================================

-- User profiles
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);

-- Companies
CREATE INDEX idx_companies_owner_id ON public.companies(owner_id);
CREATE INDEX idx_companies_code ON public.companies(code);
CREATE INDEX idx_companies_active ON public.companies(is_active) WHERE is_active = true;

-- Company members
CREATE INDEX idx_company_members_company_id ON public.company_members(company_id);
CREATE INDEX idx_company_members_user_id ON public.company_members(user_id);
CREATE INDEX idx_company_members_active ON public.company_members(is_active) WHERE is_active = true;

-- Contacts
CREATE INDEX idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_phone ON public.contacts(phone);
CREATE INDEX idx_contacts_is_client ON public.contacts(is_client) WHERE is_client = true;
CREATE INDEX idx_contacts_is_vendor ON public.contacts(is_vendor) WHERE is_vendor = true;
CREATE INDEX idx_contacts_active ON public.contacts(is_active) WHERE is_active = true;

-- Financial documents
CREATE INDEX idx_financial_docs_user_id ON public.financial_documents(user_id);
CREATE INDEX idx_financial_docs_company_id ON public.financial_documents(company_id);
CREATE INDEX idx_financial_docs_contact_id ON public.financial_documents(contact_id);
CREATE INDEX idx_financial_docs_type ON public.financial_documents(document_type);
CREATE INDEX idx_financial_docs_status ON public.financial_documents(status);
CREATE INDEX idx_financial_docs_date ON public.financial_documents(document_date);
CREATE INDEX idx_financial_docs_number ON public.financial_documents(document_number);

-- Work calls
CREATE INDEX idx_work_calls_company_id ON public.work_calls(company_id);
CREATE INDEX idx_work_calls_created_by ON public.work_calls(created_by_user_id);
CREATE INDEX idx_work_calls_claimed_by ON public.work_calls(claimed_by_user_id);
CREATE INDEX idx_work_calls_contact_id ON public.work_calls(contact_id);
CREATE INDEX idx_work_calls_status ON public.work_calls(status);
CREATE INDEX idx_work_calls_type ON public.work_calls(call_type);
CREATE INDEX idx_work_calls_expires_at ON public.work_calls(expires_at);
CREATE INDEX idx_work_calls_active ON public.work_calls(status) WHERE status = 'active';

-- ============================================================================
-- UPDATED_AT TRIGGERS (Auto-update timestamps)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_members_updated_at BEFORE UPDATE ON public.company_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_documents_updated_at BEFORE UPDATE ON public.financial_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_calls_updated_at BEFORE UPDATE ON public.work_calls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SCHEMA COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Run this file in Supabase SQL Editor
-- 2. Run migrations/002_row_level_security.sql for security policies
-- 3. Run migrations/003_seed_data.sql for demo data (optional)
-- ============================================================================
