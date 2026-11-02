import { z } from "zod";
import { reflectionFeedback } from "@/lib/server/ai";
import { enforceQuota } from "@/lib/server/rate-limit";
import {
  AppError,
  assertSameOrigin,
  errorResponse,
  readJson,
} from "@/lib/server/errors";
import { styles } from "@/lib/schema";
export const maxDuration = 45;
const schema = z.object({
  question: z.string().min(1).max(1200),
  answer: z.string().trim().min(10).max(4000),
  summary: z.string().min(30).max(3000),
  style: z.enum(styles),
});
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const parsed = schema.safeParse(await readJson(request, 40000));
    if (!parsed.success) throw new AppError(parsed.error.issues[0].message);
    await enforceQuota(request, "reflection");
    const { question, answer, summary, style } = parsed.data;
    return Response.json(
      await reflectionFeedback(question, answer, summary, style),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
