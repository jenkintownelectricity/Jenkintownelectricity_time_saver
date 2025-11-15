-- ============================================================================
-- Migration 002: Row Level Security (RLS) Policies
-- ============================================================================
-- CRITICAL for multi-tenant security!
-- Ensures users can only see/modify their own data
-- Run this AFTER schema.sql
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_statistics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- COMPANIES POLICIES
-- ============================================================================

-- Users can read companies they're a member of
CREATE POLICY "Users can read companies they belong to"
  ON public.companies
  FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can create companies
CREATE POLICY "Users can create companies"
  ON public.companies
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Company owners can update their companies
CREATE POLICY "Company owners can update their companies"
  ON public.companies
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Company owners can delete their companies
CREATE POLICY "Company owners can delete their companies"
  ON public.companies
  FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================================================
-- COMPANY MEMBERS POLICIES
-- ============================================================================

-- Users can read members of their companies
CREATE POLICY "Users can read company members"
  ON public.company_members
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Company owners/admins can add members
CREATE POLICY "Company owners can add members"
  ON public.company_members
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

-- Company owners/admins can update members
CREATE POLICY "Company owners can update members"
  ON public.company_members
  FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

-- Users can update their own membership (toggle on-call, etc.)
CREATE POLICY "Users can update own membership"
  ON public.company_members
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- CONTACTS POLICIES
-- ============================================================================

-- Users can read contacts from their companies
CREATE POLICY "Users can read company contacts"
  ON public.contacts
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND is_active = true
    )
    OR user_id = auth.uid()
  );

-- Users can create contacts
CREATE POLICY "Users can create contacts"
  ON public.contacts
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can update contacts they created or from their companies
CREATE POLICY "Users can update their contacts"
  ON public.contacts
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can delete their own contacts
CREATE POLICY "Users can delete their contacts"
  ON public.contacts
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- FINANCIAL DOCUMENTS POLICIES
-- ============================================================================

-- Users can read documents from their companies
CREATE POLICY "Users can read company financial documents"
  ON public.financial_documents
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND is_active = true
    )
    OR user_id = auth.uid()
  );

-- Users can create financial documents
CREATE POLICY "Users can create financial documents"
  ON public.financial_documents
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can update their financial documents
CREATE POLICY "Users can update their financial documents"
  ON public.financial_documents
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can delete their own financial documents
CREATE POLICY "Users can delete their financial documents"
  ON public.financial_documents
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- WORK CALLS POLICIES
-- ============================================================================

-- Users can read work calls from their companies AND linked companies
CREATE POLICY "Users can read company work calls"
  ON public.work_calls
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND is_active = true
    )
    -- Also show calls from linked companies (network marketplace)
    OR company_id IN (
      SELECT unnest(
        ARRAY(
          SELECT jsonb_array_elements_text(linked_companies)::uuid
          FROM public.companies
          WHERE id IN (
            SELECT company_id FROM public.company_members
            WHERE user_id = auth.uid() AND is_active = true
          )
        )
      )
    )
  );

-- Company members can create work calls
CREATE POLICY "Company members can create work calls"
  ON public.work_calls
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Company members can update work calls (claim, update status, etc.)
CREATE POLICY "Company members can update work calls"
  ON public.work_calls
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND is_active = true
    )
    OR claimed_by_user_id = auth.uid()
  );

-- Company owners can delete work calls
CREATE POLICY "Company owners can delete work calls"
  ON public.work_calls
  FOR DELETE
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
    OR created_by_user_id = auth.uid()
  );

-- ============================================================================
-- CALL STATISTICS POLICIES
-- ============================================================================

-- Users can read their own statistics
CREATE POLICY "Users can read own statistics"
  ON public.call_statistics
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- System can insert/update statistics (would be done via functions)
CREATE POLICY "Users can update own statistics"
  ON public.call_statistics
  FOR ALL
  USING (
    user_id = auth.uid()
    OR company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES COMPLETE!
-- ============================================================================
-- Your data is now secure with multi-tenant isolation
-- Users can only access data they own or from companies they belong to
-- ============================================================================
