import { it, expect, vi, afterEach } from "vitest";
import { recordUsage } from "@/lib/server/usage";
afterEach(() => vi.unstubAllEnvs());
it("logs only usage metadata and estimates costs only with configured rates", () => {
  const log = vi.spyOn(console, "info").mockImplementation(() => {});
  vi.stubEnv("GEMINI_MODEL", "configured-model");
  vi.stubEnv("AI_INPUT_USD_PER_MILLION", "0.5");
  vi.stubEnv("AI_OUTPUT_USD_PER_MILLION", "2");
  recordUsage("analysis", {
    inputTokens: 1000,
    outputTokens: 500,
    totalTokens: 1500,
  });
  expect(JSON.parse(log.mock.calls[0][0])).toEqual({
    event: "ai_usage",
    kind: "analysis",
    provider: "gemini",
    model: "configured-model",
    inputTokens: 1000,
    outputTokens: 500,
    totalTokens: 1500,
    estimatedUsd: 0.0015,
  });
  vi.stubEnv("AI_INPUT_USD_PER_MILLION", "");
  recordUsage("reflection", { totalTokens: 10 });
  expect(JSON.parse(log.mock.calls[1][0])).not.toHaveProperty("estimatedUsd");
});
