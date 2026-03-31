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

-- ============================================
-- Production Upgrade: Pre-computed Aggregations
-- ============================================

-- Daily snapshots (eliminates raw query scanning for dashboards)
CREATE TABLE IF NOT EXISTS daily_snapshots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES tracker_clients(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  ai_model text NOT NULL,
  total_checks int NOT NULL DEFAULT 0,
  total_mentions int NOT NULL DEFAULT 0,
  mention_rate numeric(5,2),
  avg_mention_rank numeric(4,2),
  position_quality_score numeric(5,2),
  sentiment_positive int DEFAULT 0,
  sentiment_neutral int DEFAULT 0,
  sentiment_negative int DEFAULT 0,
  sov_percentage numeric(5,2),
  competitor_data jsonb DEFAULT '{}',
  citation_count int DEFAULT 0,
  client_citation_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, snapshot_date, ai_model)
);
CREATE INDEX IF NOT EXISTS idx_daily_snapshots_lookup ON daily_snapshots (client_id, snapshot_date DESC);

-- Monthly rollups for fast reporting
CREATE TABLE IF NOT EXISTS monthly_snapshots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES tracker_clients(id) ON DELETE CASCADE,
  month_start date NOT NULL,
  total_checks int NOT NULL DEFAULT 0,
  total_mentions int NOT NULL DEFAULT 0,
  mention_rate numeric(5,2),
  mention_rate_ci_lower numeric(5,2),
  mention_rate_ci_upper numeric(5,2),
  position_quality_score numeric(5,2),
  sov_percentage numeric(5,2),
  aeo_composite_score numeric(5,2),
  sentiment_positive int DEFAULT 0,
  sentiment_neutral int DEFAULT 0,
  sentiment_negative int DEFAULT 0,
  model_breakdown jsonb DEFAULT '{}',
  top_competitors jsonb DEFAULT '[]',
  top_cited_domains jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, month_start)
);
CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_lookup ON monthly_snapshots (client_id, month_start DESC);

-- Report generation history
CREATE TABLE IF NOT EXISTS generated_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES tracker_clients(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('monthly', 'weekly', 'ad_hoc')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  pdf_storage_path text,
  pdf_url text,
  sent_to text[],
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_generated_reports_client ON generated_reports (client_id, created_at DESC);

-- API cost tracking (know your margins)
CREATE TABLE IF NOT EXISTS api_cost_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES tracker_clients(id) ON DELETE CASCADE,
  ai_model text NOT NULL,
  call_type text NOT NULL CHECK (call_type IN ('tracker', 'sentiment', 'prompt_gen', 'audit')),
  input_tokens int,
  output_tokens int,
  estimated_cost numeric(10,6),
  run_batch_id uuid,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_api_cost_month ON api_cost_log (client_id, created_at);

-- ============================================
-- Production Upgrade: Plan-based Config
-- ============================================
ALTER TABLE tracker_clients ADD COLUMN IF NOT EXISTS models_config jsonb;
ALTER TABLE tracker_clients ADD COLUMN IF NOT EXISTS shots_per_prompt int DEFAULT 3;
ALTER TABLE tracker_clients ADD COLUMN IF NOT EXISTS monthly_api_budget numeric(10,2);

-- Shot timing and cost tracking on prompt_results
ALTER TABLE prompt_results ADD COLUMN IF NOT EXISTS shot_window text;
ALTER TABLE prompt_results ADD COLUMN IF NOT EXISTS api_cost_estimate numeric(10,6);

-- ============================================
-- Prompt Quality: Buyer Profile & JTBD Fields
-- ============================================
ALTER TABLE tracker_clients ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE tracker_clients ADD COLUMN IF NOT EXISTS buyer_persona text;
ALTER TABLE tracker_clients ADD COLUMN IF NOT EXISTS buyer_jtbd text;
ALTER TABLE tracker_clients ADD COLUMN IF NOT EXISTS differentiators text;
ALTER TABLE tracker_clients ADD COLUMN IF NOT EXISTS competitors text;

-- ============================================
-- Tiered Archival: Track archival level
-- ============================================
ALTER TABLE prompt_results ADD COLUMN IF NOT EXISTS archival_tier text DEFAULT 'full' CHECK (archival_tier IN ('full', 'summary', 'aggregate'));

-- ============================================
-- Grounding Type: Track whether model used live web data or training data
-- ============================================
ALTER TABLE prompt_results ADD COLUMN IF NOT EXISTS grounding_type text DEFAULT 'unknown';

-- ============================================
-- Response Validation: Track whether AI response was usable for scoring
-- ============================================
ALTER TABLE prompt_results ADD COLUMN IF NOT EXISTS response_status text DEFAULT 'valid';

-- ============================================
-- Name Aliases: Alternative names for fuzzy mention matching
-- ============================================
ALTER TABLE tracker_clients ADD COLUMN IF NOT EXISTS name_aliases text[] DEFAULT '{}';

-- ============================================
-- Cron Health Monitoring
-- ============================================
CREATE TABLE IF NOT EXISTS cron_run_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name text NOT NULL,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  status text DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed')),
  clients_processed int DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cron_run_log_job ON cron_run_log (job_name, started_at DESC);
