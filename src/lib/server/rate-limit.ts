import "server-only";
import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { AppError } from "./errors";
const local = new Map<string, { count: number; until: number }>();
export function consumeLocal(key: string, limit: number, now = Date.now()) {
  for (const [k, v] of local) if (v.until <= now) local.delete(k);
  const item = local.get(key) ?? { count: 0, until: now + 3600000 };
  if (item.count >= limit) return false;
  item.count++;
  local.set(key, item);
  return true;
}
export async function enforceQuota(
  request: Request,
  kind: "analysis" | "reflection",
) {
  if (process.env.NODE_ENV !== "production") {
    if (!consumeLocal(kind + ":local", kind === "analysis" ? 10 : 30))
      throw new AppError(
        "This local session has reached its hourly limit. Please try again later.",
        429,
      );
    return;
  }
  const {
    SUPABASE_SERVICE_ROLE_KEY: key,
    NEXT_PUBLIC_SUPABASE_URL: url,
    RATE_LIMIT_SECRET: secret,
  } = process.env;
  // Fail closed: public paid provider requests need distributed, atomic quotas.
  if (!key || !url || !secret || process.env.VERCEL !== "1")
    throw new AppError(
      "Live analysis is paused until secure production usage controls are configured.",
      503,
    );
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!ip)
    throw new AppError(
      "We couldn't validate this request. Please try again.",
      403,
    );
  const subject = createHmac("sha256", secret).update(ip).digest("hex");
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await db.rpc("consume_ai_quota", {
    p_subject: subject,
    p_kind: kind,
    p_limit: kind === "analysis" ? 5 : 15,
    p_global_limit: 100,
  });
  if (error)
    throw new AppError(
      "Usage controls are temporarily unavailable. Please try again later.",
      503,
    );
  if (!data)
    throw new AppError(
      "The hourly analysis allowance has been reached. Please come back later.",
      429,
    );
}
