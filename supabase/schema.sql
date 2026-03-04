-- ============================================
-- AEO Pro — Initial Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Leads table (lead capture from audit modal)
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  business_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  business_type text not null,
  location text not null,
  marketing_spend text not null,
  plan text,
  status text default 'new' check (status in ('new', 'contacted', 'qualified', 'closed')),
  notes text,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security
alter table leads enable row level security;

-- 3. RLS policy: allow service_role full access (API routes use service role key)
create policy "Service role has full access"
  on leads
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- 4. Index on created_at for admin dashboard sorting
create index if not exists idx_leads_created_at on leads (created_at desc);

-- 5. Index on status for filtering
create index if not exists idx_leads_status on leads (status);

-- ============================================
-- Phase 1: Multi-Shot Prompting
-- ============================================
ALTER TABLE prompt_results ADD COLUMN IF NOT EXISTS run_batch_id uuid;
ALTER TABLE prompt_results ADD COLUMN IF NOT EXISTS run_number int DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_prompt_results_batch ON prompt_results (run_batch_id);

-- ============================================
-- Phase 5: Competitor Extraction & Share of Voice
-- ============================================
CREATE TABLE IF NOT EXISTS response_mentions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  result_id uuid REFERENCES prompt_results(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  business_name text NOT NULL,
  is_client boolean DEFAULT false,
  mention_position int,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_response_mentions_client ON response_mentions (client_id);
CREATE INDEX IF NOT EXISTS idx_response_mentions_result ON response_mentions (result_id);

-- ============================================
-- Phase 6: Citation/URL Extraction
-- ============================================
CREATE TABLE IF NOT EXISTS response_citations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  result_id uuid REFERENCES prompt_results(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  cited_url text NOT NULL,
  cited_domain text NOT NULL,
  is_client_url boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_response_citations_client ON response_citations (client_id);

-- ============================================
-- Phase 7: Sentiment Analysis
-- ============================================
ALTER TABLE prompt_results ADD COLUMN IF NOT EXISTS sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative'));
ALTER TABLE prompt_results ADD COLUMN IF NOT EXISTS sentiment_reason text;

-- ============================================
-- Client Portal: Users + Subscriptions
-- ============================================

-- Link Supabase Auth users to tracker clients
CREATE TABLE IF NOT EXISTS client_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id uuid NOT NULL UNIQUE,
  client_id uuid REFERENCES tracker_clients(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_client_users_auth ON client_users (auth_user_id);
CREATE INDEX IF NOT EXISTS idx_client_users_client ON client_users (client_id);

-- Add contact/billing fields to tracker_clients
ALTER TABLE tracker_clients ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE tracker_clients ADD COLUMN IF NOT EXISTS plan text DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'pro'));
ALTER TABLE tracker_clients ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE tracker_clients ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE tracker_clients ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid'));
ALTER TABLE tracker_clients ADD COLUMN IF NOT EXISTS alert_threshold int DEFAULT 20;

-- Alerts log
CREATE TABLE IF NOT EXISTS alert_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES tracker_clients(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('visibility_drop', 'competitor_overtake', 'new_mention', 'sentiment_shift')),
  message text NOT NULL,
  sent_to text NOT NULL,
  sent_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_alert_log_client ON alert_log (client_id);

-- Service delivery tasks
CREATE TABLE IF NOT EXISTS service_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES tracker_clients(id) ON DELETE CASCADE,
  task_type text NOT NULL CHECK (task_type IN ('article_placement', 'reddit_authority', 'wikipedia_citation', 'schema_optimization', 'llms_txt', 'citation_submission', 'review_platform', 'custom')),
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_service_tasks_client ON service_tasks (client_id);
CREATE INDEX IF NOT EXISTS idx_service_tasks_status ON service_tasks (status);
