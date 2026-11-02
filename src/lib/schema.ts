import { z } from "zod";

export const goals = [
  "Understand the topic",
  "Evaluate credibility",
  "Study and remember",
  "Explore alternative perspectives",
  "General curiosity",
] as const;
export const depths = ["Simple", "Balanced", "Deep Dive"] as const;
export const styles = ["Supportive", "Analytical", "Challenging"] as const;
export const claimTypes = [
  "Factual assertion",
  "Opinion",
  "Interpretation",
  "Prediction",
  "Mixed or ambiguous",
] as const;
const short = z.string().trim().min(1).max(1200);
export const inputSchema = z
  .object({
    mode: z.enum(["text", "url", "transcript"]),
    content: z.string().trim().min(1).max(30000),
    title: z.string().trim().max(180).default(""),
    goal: z.enum(goals).default(goals[0]),
    depth: z.enum(depths).default("Balanced"),
    reflectionStyle: z.enum(styles).default("Supportive"),
    interests: z.array(z.string().max(50)).max(10).default([]),
  })
  .superRefine((v, ctx) => {
    if (v.mode !== "url" && v.content.length < 100)
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message:
          "Add at least 100 characters so there is enough context to analyze.",
      });
    if (v.mode === "url") {
      try {
        const u = new URL(v.content);
        if (u.protocol !== "https:") throw new Error();
      } catch {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "Enter a complete HTTPS article URL.",
        });
      }
    }
  });
export const claimSchema = z.object({
  statement: short,
  category: z.enum(claimTypes),
  explanation: short,
  excerpt: z.string().max(800),
  context: short,
  missingInformation: short,
  whyItMatters: short,
});
export const outputSchema = z
  .object({
    title: z.string().min(1).max(180),
    topic: z.string().min(1).max(80),
    summary: z.string().min(30).max(3000),
    mainArgument: short,
    mainIdeas: z
      .array(
        z.object({ title: z.string().min(1).max(120), explanation: short }),
      )
      .min(3)
      .max(5),
    concepts: z
      .array(z.object({ term: z.string().max(100), definition: short }))
      .min(1)
      .max(5),
    limitations: z.array(short).min(1).max(5),
    unresolvedQuestions: z.array(short).min(1).max(5),
    claims: z.array(claimSchema).min(3).max(5),
    questions: z
      .array(
        z.object({
          kind: z.enum(["Understanding", "Critical thinking", "Application"]),
          question: short,
        }),
      )
      .length(3),
    nextStep: z.object({ action: short, reason: short }),
  })
  .superRefine((v, ctx) => {
    if (new Set(v.questions.map((q) => q.kind)).size !== 3)
      ctx.addIssue({
        code: "custom",
        path: ["questions"],
        message: "Each reflection skill must appear exactly once.",
      });
  });
export const feedbackSchema = z.object({
  recognition: short,
  gap: short,
  suggestion: short,
});
export type AnalysisOutput = z.infer<typeof outputSchema>;
export type AnalysisInput = z.infer<typeof inputSchema>;
export type ReflectionFeedback = z.infer<typeof feedbackSchema>;
export const analysisSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  demo: z.boolean(),
  input: inputSchema,
  result: outputSchema,
  sourceText: z.string().min(100).max(30000),
  sourceUrl: z.string().url().nullable(),
  sourceCharacters: z.number().int().nonnegative(),
});
export type Analysis = z.infer<typeof analysisSchema>;
export const progressSchema = z.object({
  answers: z.array(z.string().max(4000)).length(3),
  feedback: z.array(feedbackSchema.nullable()).length(3),
  examined: z.array(z.number().int().min(0).max(4)).max(5),
  takeaway: z.string().max(4000),
  finished: z.boolean(),
  claimFeedback: z.record(
    z.string(),
    z.enum(["Helpful", "Incorrect", "Needs more context"]),
  ),
});
export type Progress = z.infer<typeof progressSchema>;
export const emptyProgress = (): Progress => ({
  answers: ["", "", ""],
  feedback: [null, null, null],
  examined: [],
  takeaway: "",
  finished: false,
  claimFeedback: {},
});
export const savedSchema = z.object({
  analysis: analysisSchema,
  progress: progressSchema,
});
export type SavedItem = z.infer<typeof savedSchema>;
export const preferencesSchema = z.object({
  accent: z.enum(["violet", "forest", "ocean", "amber"]).default("violet"),
  depth: z.enum(depths).default("Balanced"),
  reflectionStyle: z.enum(styles).default("Supportive"),
  interests: z.array(z.string().max(50)).max(10).default([]),
  fontSize: z.enum(["small", "standard", "large", "extra"]).default("standard"),
  font: z.enum(["sans", "serif"]).default("sans"),
  width: z.enum(["narrow", "comfortable", "wide"]).default("comfortable"),
  spacing: z.enum(["compact", "comfortable", "relaxed"]).default("comfortable"),
  surface: z.enum(["standard", "paper", "low-glare"]).default("standard"),
});
export type Preferences = z.infer<typeof preferencesSchema>;
