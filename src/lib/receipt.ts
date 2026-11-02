import type { Analysis, Progress } from "./schema";
export function receiptMarkdown(a: Analysis, p: Progress) {
  return [
    `# ${a.result.title}`,
    a.demo
      ? "Sample demo · not a live analysis"
      : "AI-assisted analysis · review for errors",
    `Topic: ${a.result.topic}`,
    `Goal: ${a.input.goal}`,
    `Source: ${a.sourceUrl ?? "User-supplied " + a.input.mode}`,
    "",
    "## Summary",
    a.result.summary,
    "",
    "## Main ideas",
    ...a.result.mainIdeas.map((i) => `- **${i.title}**: ${i.explanation}`),
    "",
    "## Claim Compass",
    ...a.result.claims.map(
      (c, i) =>
        `${i + 1}. ${c.statement}\n   ${c.category} · Not independently verified\n   ${c.explanation}`,
    ),
    "",
    `Claims examined: ${p.examined.length}/${a.result.claims.length}`,
    "Claims independently verified: 0 (no independent evidence retrieval)",
    "",
    "## Reflection",
    ...a.result.questions.map(
      (q, i) =>
        `### ${q.kind}\n${q.question}\n\n${p.answers[i] || "Skipped / unanswered"}${p.feedback[i] ? `\n\nFeedback: ${p.feedback[i]?.recognition} ${p.feedback[i]?.gap} ${p.feedback[i]?.suggestion}` : ""}`,
    ),
    "",
    "## My takeaway",
    p.takeaway || "Not recorded",
    "",
    "## Unresolved questions",
    ...a.result.unresolvedQuestions.map((q) => `- ${q}`),
    "",
    "## One better next step",
    a.result.nextStep.action,
    a.result.nextStep.reason,
    "",
    "Generated with InsightLens AI. Scrolling and reflection completion do not measure comprehension.",
  ].join("\n\n");
}
