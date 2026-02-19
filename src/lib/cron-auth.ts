import { type NextRequest } from "next/server";

/**
 * Vercel Cron (Authorization: Bearer) 또는 수동 호출 (?secret=) 모두 지원
 */
export function isCronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const querySecret = request.nextUrl.searchParams.get("secret");
  if (querySecret === secret) return true;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  return false;
}
