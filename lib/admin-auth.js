import { cookies } from "next/headers";

/**
 * Check if a request is authenticated as admin.
 * Accepts any of:
 *   1. Vercel CRON_SECRET via Authorization: Bearer header (for cron jobs)
 *   2. ?key= query parameter (for external calls)
 *   3. admin_token cookie (for browser sessions)
 */
export function isAdminAuthed(request) {
  // Check Vercel cron secret header
  const authHeader = request.headers.get("authorization");
  if (
    authHeader &&
    process.env.CRON_SECRET &&
    authHeader === `Bearer ${process.env.CRON_SECRET}`
  )
    return true;

  // Check query param (for external calls)
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (key && key === process.env.ADMIN_KEY) return true;

  // Check cookie (for browser sessions)
  const adminToken = request.cookies.get("admin_token")?.value;
  if (adminToken && adminToken === process.env.ADMIN_KEY) return true;

  return false;
}
