import { it, expect, vi, beforeEach, afterEach } from "vitest";
const mocked = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ rpc: mocked.rpc }),
}));
import { enforceQuota } from "@/lib/server/rate-limit";
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic-test-key");
  vi.stubEnv("RATE_LIMIT_SECRET", "synthetic-test-secret");
  mocked.rpc.mockResolvedValue({ data: true, error: null });
});
afterEach(() => vi.unstubAllEnvs());
const request = () =>
  new Request("https://app.test/api/analyze", {
    headers: { "x-forwarded-for": "203.0.113.10" },
  });
it("sends a hash and bounded budgets to the atomic quota function", async () => {
  await enforceQuota(request(), "analysis");
  expect(mocked.rpc).toHaveBeenCalledWith("consume_ai_quota", {
    p_subject: expect.stringMatching(/^[a-f0-9]{64}$/),
    p_kind: "analysis",
    p_limit: 5,
    p_global_limit: 100,
  });
  expect(JSON.stringify(mocked.rpc.mock.calls)).not.toContain("203.0.113.10");
});
it("rejects budget exhaustion", async () => {
  mocked.rpc.mockResolvedValue({ data: false, error: null });
  await expect(enforceQuota(request(), "reflection")).rejects.toThrow(
    "allowance",
  );
});
it("fails closed when the shared backend is unavailable", async () => {
  mocked.rpc.mockResolvedValue({
    data: null,
    error: { message: "database unavailable" },
  });
  await expect(enforceQuota(request(), "analysis")).rejects.toThrow(
    "temporarily unavailable",
  );
});
it("requires the platform trust boundary and forwarded address", async () => {
  await expect(
    enforceQuota(new Request("https://app.test"), "analysis"),
  ).rejects.toThrow("validate");
  vi.stubEnv("VERCEL", "");
  await expect(enforceQuota(request(), "analysis")).rejects.toThrow("paused");
  expect(mocked.rpc).not.toHaveBeenCalled();
});
