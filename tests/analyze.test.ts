import { describe, it, expect, vi, beforeEach } from "vitest";
import { createDemo, sampleText } from "@/lib/demo";
import { AppError } from "@/lib/server/errors";
const mocks = vi.hoisted(() => ({
  analyze: vi.fn(),
  quota: vi.fn(),
  extract: vi.fn(),
  feedback: vi.fn(),
}));
vi.mock("@/lib/server/ai", () => ({
  geminiProvider: { analyze: mocks.analyze },
  reflectionFeedback: mocks.feedback,
}));
vi.mock("@/lib/server/rate-limit", () => ({ enforceQuota: mocks.quota }));
vi.mock("@/lib/server/article", () => ({ extractArticle: mocks.extract }));
import { POST } from "@/app/api/analyze/route";
import { POST as reflect } from "@/app/api/reflection/route";
function request(body: unknown, path = "analyze") {
  return new Request(`http://127.0.0.1:3000/api/${path}`, {
    method: "POST",
    headers: {
      origin: "http://127.0.0.1:3000",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  mocks.analyze.mockResolvedValue(createDemo().result);
  mocks.quota.mockResolvedValue(undefined);
});
describe("analysis route", () => {
  it("validates before consuming paid work", async () => {
    const response = await POST(
      request({ mode: "text", content: "too short" }),
    );
    expect(response.status).toBe(400);
    expect(mocks.analyze).not.toHaveBeenCalled();
    expect(mocks.quota).not.toHaveBeenCalled();
  });
  it("returns the complete structured result with a live provenance flag", async () => {
    const response = await POST(request({ mode: "text", content: sampleText }));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.demo).toBe(false);
    expect(data.sourceCharacters).toBe(sampleText.length);
    expect(data.result.questions).toHaveLength(3);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("surfaces provider outages without sample substitution or secrets", async () => {
    mocks.analyze.mockRejectedValue(new AppError("AI unavailable", 502));
    const response = await POST(request({ mode: "text", content: sampleText }));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "AI unavailable" });
  });
  it("does not call AI after quota denial", async () => {
    mocks.quota.mockRejectedValue(new AppError("Limit reached", 429));
    expect(
      (await POST(request({ mode: "text", content: sampleText }))).status,
    ).toBe(429);
    expect(mocks.analyze).not.toHaveBeenCalled();
  });
  it("uses fetched text and canonical URL rather than the URL as content", async () => {
    mocks.extract.mockResolvedValue({
      text: sampleText,
      title: "Fetched title",
      url: "https://www.bbc.com/article",
    });
    const response = await POST(
      request({ mode: "url", content: "https://www.bbc.com/article" }),
    );
    expect(response.status).toBe(200);
    expect(mocks.analyze.mock.calls[0][1]).toBe(sampleText);
    expect((await response.json()).sourceUrl).toBe(
      "https://www.bbc.com/article",
    );
  });
  it("returns a useful extraction fallback", async () => {
    mocks.extract.mockRejectedValue(new Error("internal network detail"));
    const response = await POST(
      request({ mode: "url", content: "https://www.bbc.com/article" }),
    );
    expect(response.status).toBe(422);
    expect(JSON.stringify(await response.json())).not.toContain(
      "internal network detail",
    );
    expect(mocks.analyze).not.toHaveBeenCalled();
  });
});
describe("reflection feedback route", () => {
  it("validates answers and handles provider failure", async () => {
    const body = {
      question: "Explain the idea",
      answer: "short",
      summary: sampleText,
      style: "Supportive",
    };
    expect((await reflect(request(body, "reflection"))).status).toBe(400);
    mocks.feedback.mockRejectedValue(new AppError("Feedback unavailable", 502));
    expect(
      (
        await reflect(
          request({ ...body, answer: "My thoughtful answer" }, "reflection"),
        )
      ).status,
    ).toBe(502);
  });
  it("returns structured feedback", async () => {
    mocks.feedback.mockResolvedValue({
      recognition: "Good reasoning",
      gap: "Consider a comparison",
      suggestion: "Try a different context",
    });
    const response = await reflect(
      request(
        {
          question: "Explain",
          answer: "Here is my answer",
          summary: sampleText,
          style: "Analytical",
        },
        "reflection",
      ),
    );
    expect(response.status).toBe(200);
    expect((await response.json()).suggestion).toBe("Try a different context");
  });
});
