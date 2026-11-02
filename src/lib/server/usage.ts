import "server-only";
type Usage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};
// Operational metadata only: never pass source text, prompts, answers, user IDs or keys.
export function recordUsage(
  kind: "analysis" | "reflection",
  usage: Usage | undefined,
) {
  if (!usage) return;
  const inputRate = Number(process.env.AI_INPUT_USD_PER_MILLION);
  const outputRate = Number(process.env.AI_OUTPUT_USD_PER_MILLION);
  const hasRates =
    Boolean(
      process.env.AI_INPUT_USD_PER_MILLION &&
      process.env.AI_OUTPUT_USD_PER_MILLION,
    ) &&
    Number.isFinite(inputRate) &&
    Number.isFinite(outputRate) &&
    inputRate >= 0 &&
    outputRate >= 0;
  const estimatedUsd =
    hasRates &&
    usage.inputTokens !== undefined &&
    usage.outputTokens !== undefined
      ? (usage.inputTokens * inputRate + usage.outputTokens * outputRate) /
        1000000
      : undefined;
  console.info(
    JSON.stringify({
      event: "ai_usage",
      kind,
      provider: "gemini",
      model: process.env.GEMINI_MODEL,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
      estimatedUsd,
    }),
  );
}
