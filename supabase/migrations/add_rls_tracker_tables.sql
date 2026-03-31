-- ============================================================
-- Migration: Enable Row Level Security on all tracker tables
-- ============================================================
--
-- WHY RLS IS NEEDED
-- -----------------
-- Without RLS, any request that reaches Supabase with the anon
-- key can read or write every row in every table. The client
-- portal authenticates users via Supabase Auth and creates a
-- Supabase client with the anon key + the user's JWT. If RLS
-- is not enabled, that client can bypass the application-level
-- scoping and query any client's data directly.
--
-- WHY SERVICE_ROLE BYPASSES RLS
-- -----------------------------
-- All server-side API routes (Next.js /api/*) use the
-- SUPABASE_SERVICE_ROLE_KEY, which needs unrestricted access
-- to run cron jobs, cross-client reports, and admin operations.
-- The service_role key is never exposed to the browser — it
-- only exists in server-side environment variables.
--
-- IMPORTANT
-- ---------
-- The NEXT_PUBLIC_SUPABASE_ANON_KEY should NEVER be used for
-- tracker data reads outside of an authenticated context.
-- The anon key is safe to expose to the browser ONLY because
-- RLS restricts what it can access to the authenticated user's
-- own client data.
--
-- ============================================================


-- ============================================================
-- 1. tracker_clients
--    Central client record. Authenticated users can only read
--    the client record they are linked to via client_users.
-- ============================================================
ALTER TABLE tracker_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracker_clients_service_role_all"
  ON tracker_clients FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "tracker_clients_client_read"
  ON tracker_clients FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT client_id FROM client_users
      WHERE auth_user_id = auth.uid()
    )
  );


-- ============================================================
-- 2. tracked_prompts
--    Prompts being tracked for each client. Has direct
--    client_id column.
-- ============================================================
ALTER TABLE tracked_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracked_prompts_service_role_all"
  ON tracked_prompts FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "tracked_prompts_client_read"
  ON tracked_prompts FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT client_id FROM client_users
      WHERE auth_user_id = auth.uid()
    )
  );


-- ============================================================
-- 3. prompt_results
--    AI model responses and mention detection results. Has
--    direct client_id column.
-- ============================================================
ALTER TABLE prompt_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prompt_results_service_role_all"
  ON prompt_results FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "prompt_results_client_read"
  ON prompt_results FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT client_id FROM client_users
      WHERE auth_user_id = auth.uid()
    )
  );


-- ============================================================
-- 4. response_mentions
--    Competitor/business names extracted from AI responses.
--    Has direct client_id column.
-- ============================================================
ALTER TABLE response_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "response_mentions_service_role_all"
  ON response_mentions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "response_mentions_client_read"
  ON response_mentions FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT client_id FROM client_users
      WHERE auth_user_id = auth.uid()
    )
  );


-- ============================================================
-- 5. response_citations
--    URLs/domains extracted from AI responses.
--    Has direct client_id column.
-- ============================================================
ALTER TABLE response_citations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "response_citations_service_role_all"
  ON response_citations FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "response_citations_client_read"
  ON response_citations FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT client_id FROM client_users
      WHERE auth_user_id = auth.uid()
    )
  );


-- ============================================================
-- 6. daily_snapshots
--    Pre-computed daily aggregations per client per model.
--    Has direct client_id column.
-- ============================================================
ALTER TABLE daily_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_snapshots_service_role_all"
  ON daily_snapshots FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "daily_snapshots_client_read"
  ON daily_snapshots FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT client_id FROM client_users
      WHERE auth_user_id = auth.uid()
    )
  );


-- ============================================================
-- 7. monthly_snapshots
--    Pre-computed monthly rollups per client.
--    Has direct client_id column.
-- ============================================================
ALTER TABLE monthly_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "monthly_snapshots_service_role_all"
  ON monthly_snapshots FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "monthly_snapshots_client_read"
  ON monthly_snapshots FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT client_id FROM client_users
      WHERE auth_user_id = auth.uid()
    )
  );


-- ============================================================
-- 8. client_users
--    Links Supabase Auth users to tracker_clients.
--    Authenticated users can only read their own row.
-- ============================================================
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_users_service_role_all"
  ON client_users FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "client_users_self_read"
  ON client_users FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());


-- ============================================================
-- 9. service_tasks
--    Delivery tasks (schema markup, citations, etc.) per client.
--    Has direct client_id column.
-- ============================================================
ALTER TABLE service_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_tasks_service_role_all"
  ON service_tasks FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_tasks_client_read"
  ON service_tasks FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT client_id FROM client_users
      WHERE auth_user_id = auth.uid()
    )
  );


-- ============================================================
-- 10. alert_log
--     Visibility drop / competitor overtake alert history.
--     Has direct client_id column.
-- ============================================================
ALTER TABLE alert_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alert_log_service_role_all"
  ON alert_log FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "alert_log_client_read"
  ON alert_log FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT client_id FROM client_users
      WHERE auth_user_id = auth.uid()
    )
  );


-- ============================================================
-- 11. api_cost_log
--     Per-call cost tracking for margin analysis.
--     Has direct client_id column.
--     Clients should NOT see cost data — no authenticated read
--     policy. Only service_role (admin/cron) can access.
-- ============================================================
ALTER TABLE api_cost_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_cost_log_service_role_all"
  ON api_cost_log FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- No authenticated read policy: cost data is internal-only.


-- ============================================================
-- 12. generated_reports
--     Report generation history with PDF links.
--     Has direct client_id column.
-- ============================================================
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "generated_reports_service_role_all"
  ON generated_reports FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "generated_reports_client_read"
  ON generated_reports FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT client_id FROM client_users
      WHERE auth_user_id = auth.uid()
    )
  );


-- ============================================================
-- HOW TO RUN THIS MIGRATION
-- ============================================================
-- Option 1: supabase db push (if using Supabase CLI with local migrations)
-- Option 2: Paste this entire file into the Supabase SQL Editor and run
--
-- This migration is idempotent for ENABLE ROW LEVEL SECURITY
-- (Postgres silently no-ops if RLS is already enabled), but
-- CREATE POLICY will fail if a policy with the same name already
-- exists. To re-run safely, drop existing policies first:
--
--   DROP POLICY IF EXISTS "tracker_clients_service_role_all" ON tracker_clients;
--   DROP POLICY IF EXISTS "tracker_clients_client_read" ON tracker_clients;
--   ... (repeat for each table)
--
-- Or wrap the entire file in a DO block with exception handling.
-- ============================================================
