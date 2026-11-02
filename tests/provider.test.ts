import { it, expect, vi, afterEach } from "vitest";
import { createDemo } from "@/lib/demo";
const mocks = vi.hoisted(() => ({ generate: vi.fn() }));
vi.mock("ai", () => ({
  generateText: mocks.generate,
  Output: { object: vi.fn() },
}));
import { geminiProvider } from "@/lib/server/ai";
afterEach(() => vi.unstubAllEnvs());
function configure() {
  vi.stubEnv("AI_PROVIDER", "gemini");
  vi.stubEnv("GEMINI_API_KEY", "test-key-not-real");
  vi.stubEnv("GEMINI_MODEL", "test-model");
}
it("removes invented excerpts even from otherwise valid structured output", async () => {
  configure();
  const a = createDemo();
  a.result.claims[0].excerpt = "A quotation the article never said";
  mocks.generate.mockResolvedValue({ output: a.result });
  const result = await geminiProvider.analyze(a.input, a.sourceText);
  expect(result.claims[0].excerpt).toBe("");
  expect(result.claims[1].excerpt).toBeTruthy();
});
it("rejects malformed provider output without leaking raw response", async () => {
  configure();
  mocks.generate.mockResolvedValue({ output: { secret: "private response" } });
  const a = createDemo();
  await expect(geminiProvider.analyze(a.input, a.sourceText)).rejects.toThrow(
    "couldn't produce a complete analysis",
  );
});
it("requires provider configuration and never silently returns a demo", async () => {
  vi.stubEnv("AI_PROVIDER", "");
  const a = createDemo();
  await expect(geminiProvider.analyze(a.input, a.sourceText)).rejects.toThrow(
    "isn't configured",
  );
});
