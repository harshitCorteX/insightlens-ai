import { describe, it, expect } from "vitest";
import {
  inputSchema,
  outputSchema,
  analysisSchema,
  savedSchema,
  emptyProgress,
  claimTypes,
} from "@/lib/schema";
import { createDemo, sampleText } from "@/lib/demo";
import {
  normalizeContent,
  ownsRecord,
  safeNext,
  verificationLabel,
} from "@/lib/utils";
import { receiptMarkdown } from "@/lib/receipt";
describe("input and output contracts", () => {
  it("rejects too little context and excessive content", () => {
    expect(inputSchema.safeParse({ mode: "text", content: "hi" }).success).toBe(
      false,
    );
    expect(
      inputSchema.safeParse({ mode: "text", content: "a".repeat(30001) })
        .success,
    ).toBe(false);
    expect(
      inputSchema.parse({ mode: "transcript", content: sampleText }).depth,
    ).toBe("Balanced");
  });
  it("requires an HTTPS URL", () => {
    for (const content of [
      "not a url",
      "http://example.com",
      "file:///etc/passwd",
      "javascript:alert(1)",
    ])
      expect(inputSchema.safeParse({ mode: "url", content }).success).toBe(
        false,
      );
  });
  it("requires complete, distinct reflection skills", () => {
    const a = createDemo();
    expect(outputSchema.safeParse(a.result).success).toBe(true);
    a.result.questions[1].kind = "Understanding";
    expect(outputSchema.safeParse(a.result).success).toBe(false);
  });
  it("rejects fabricated classification categories and incomplete output", () => {
    const a = createDemo();
    expect(
      outputSchema.safeParse({
        ...a.result,
        claims: [{ ...a.result.claims[0], category: "Verified fact" }],
      }).success,
    ).toBe(false);
    expect(outputSchema.safeParse({ title: "Only a title" }).success).toBe(
      false,
    );
    expect(claimTypes).toHaveLength(5);
    expect(verificationLabel).toBe("Not independently verified");
  });
  it("normalizes controls without erasing paragraphs", () => {
    expect(normalizeContent(" \u0000hello\r\nworld ")).toBe("hello\nworld");
  });
  it("never establishes ownership from an absent or different user", () => {
    expect(ownsRecord(undefined, "b")).toBe(false);
    expect(ownsRecord("a", "b")).toBe(false);
    expect(ownsRecord("a", "a")).toBe(true);
  });
  it("rejects external redirect destinations", () => {
    expect(safeNext("https://evil.test")).toBe("/library");
    expect(safeNext("//evil.test")).toBe("/library");
    expect(safeNext("/\\evil.test")).toBe("/library");
    expect(safeNext("/analysis/123")).toBe("/analysis/123");
  });
  it("exports actual interactions and no invented independent checks", () => {
    const a = createDemo(),
      p = emptyProgress();
    p.examined = [1];
    p.answers[0] = "My own thinking";
    p.takeaway = "Keep this idea";
    const md = receiptMarkdown(a, p);
    expect(md).toContain("Claims examined: 1/3");
    expect(md).toContain("Claims independently verified: 0");
    expect(md).toContain("My own thinking");
    expect(md).toContain("Keep this idea");
    expect(md).toContain("Sample demo");
    expect(savedSchema.safeParse({ analysis: a, progress: p }).success).toBe(
      true,
    );
    expect(
      analysisSchema.safeParse({ ...a, sourceText: "short" }).success,
    ).toBe(false);
  });
});
