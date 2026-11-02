import { describe, it, expect, vi, afterEach } from "vitest";
import { isPublicAddress, validateArticleUrl } from "@/lib/server/article";
import { assertSameOrigin, readJson } from "@/lib/server/errors";
import { enforceQuota, consumeLocal } from "@/lib/server/rate-limit";
afterEach(() => vi.unstubAllEnvs());
describe("SSRF destination policy", () => {
  it.each([
    "127.0.0.1",
    "0.0.0.0",
    "10.0.0.1",
    "172.16.4.1",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "::1",
    "fe80::1",
    "fc00::1",
    "::ffff:127.0.0.1",
    "224.0.0.1",
  ])("blocks non-public address %s", (address) =>
    expect(isPublicAddress(address)).toBe(false),
  );
  it("permits public addresses", () => {
    expect(isPublicAddress("8.8.8.8")).toBe(true);
    expect(isPublicAddress("2606:4700:4700::1111")).toBe(true);
  });
  it.each([
    "https://localhost/admin",
    "https://127.0.0.1/",
    "https://www.bbc.com.evil.test/",
    "https://user:pass@www.bbc.com/",
    "https://www.bbc.com:8443/",
    "http://www.bbc.com/",
    "https://youtube.com/watch?v=123",
  ])("rejects unsupported or unsafe URL %s", (url) =>
    expect(() => validateArticleUrl(url)).toThrow(),
  );
  it("supports only explicit known hosts", () =>
    expect(
      validateArticleUrl("https://www.theguardian.com/science/article")
        .hostname,
    ).toBe("www.theguardian.com"));
});
describe("request boundaries and budgets", () => {
  it("requires a matching Origin for mutations", () => {
    expect(() =>
      assertSameOrigin(
        new Request("http://127.0.0.1:3000/api/analyze", {
          headers: { origin: "https://evil.test" },
        }),
      ),
    ).toThrow();
    expect(() =>
      assertSameOrigin(new Request("http://127.0.0.1:3000/api/analyze")),
    ).toThrow();
    expect(() =>
      assertSameOrigin(
        new Request("http://127.0.0.1:3000/api/analyze", {
          headers: { origin: "http://127.0.0.1:3000" },
        }),
      ),
    ).not.toThrow();
  });
  it("bounds a streaming body even without Content-Length", async () => {
    const request = new Request("https://app.test/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: "x".repeat(100) }),
    });
    await expect(readJson(request, 20)).rejects.toThrow("too large");
  });
  it("rejects malformed JSON without exposing internals", async () => {
    await expect(
      readJson(
        new Request("https://app.test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "oops",
        }),
      ),
    ).rejects.toThrow("isn't valid JSON");
  });
  it("resets local quotas at expiry", () => {
    const key = crypto.randomUUID();
    expect(consumeLocal(key, 1, 100)).toBe(true);
    expect(consumeLocal(key, 1, 101)).toBe(false);
    expect(consumeLocal(key, 1, 3600101)).toBe(true);
  });
  it("fails closed in production without a shared quota backend", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    await expect(
      enforceQuota(new Request("https://app.test"), "analysis"),
    ).rejects.toThrow("paused");
  });
});
