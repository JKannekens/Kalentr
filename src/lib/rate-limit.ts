import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export interface RateLimitResult {
  success: boolean;
  /** Seconds until the window resets (0 when not limited). */
  retryAfterSeconds: number;
}

/**
 * DB-backed fixed-window rate limiter. A single atomic upsert increments the
 * counter for `key`, resetting it when the window has lapsed — so it stays
 * correct across concurrent requests and across serverless instances.
 *
 * Fails open: a limiter error must never lock out legitimate users.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const expiresAt = new Date(Date.now() + windowSeconds * 1000);

  try {
    const rows = await prisma.$queryRaw<{ count: number; expiresAt: Date }[]>`
      INSERT INTO rate_limits (key, count, expires_at)
      VALUES (${key}, 1, ${expiresAt})
      ON CONFLICT (key) DO UPDATE SET
        count = CASE WHEN rate_limits.expires_at < NOW() THEN 1 ELSE rate_limits.count + 1 END,
        expires_at = CASE WHEN rate_limits.expires_at < NOW() THEN ${expiresAt} ELSE rate_limits.expires_at END
      RETURNING count, expires_at AS "expiresAt"
    `;

    const row = rows[0];
    const count = Number(row.count);
    if (count <= limit) {
      return { success: true, retryAfterSeconds: 0 };
    }
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((new Date(row.expiresAt).getTime() - Date.now()) / 1000)
    );
    return { success: false, retryAfterSeconds };
  } catch (err) {
    console.error("rateLimit error:", err);
    return { success: true, retryAfterSeconds: 0 };
  }
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return h.get("x-real-ip") || "unknown";
  } catch {
    return "unknown";
  }
}
