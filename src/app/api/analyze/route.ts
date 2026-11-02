import { inputSchema } from "@/lib/schema";
import { normalizeContent } from "@/lib/utils";
import { geminiProvider } from "@/lib/server/ai";
import { extractArticle } from "@/lib/server/article";
import { enforceQuota } from "@/lib/server/rate-limit";
import {
  AppError,
  assertSameOrigin,
  errorResponse,
  readJson,
} from "@/lib/server/errors";
export const runtime = "nodejs";
export const maxDuration = 90;
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const parsed = inputSchema.safeParse(await readJson(request, 140000));
    if (!parsed.success) throw new AppError(parsed.error.issues[0].message);
    await enforceQuota(request, "analysis");
    const input = parsed.data;
    let sourceText = normalizeContent(input.content);
    let sourceUrl: string | null = null;
    if (input.mode === "url") {
      try {
        const article = await extractArticle(input.content);
        sourceText = normalizeContent(article.text);
        sourceUrl = article.url;
        if (!input.title) input.title = article.title.slice(0, 180);
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
          "We couldn't access that page. Paste its text or a transcript instead.",
          422,
        );
      }
    }
    const result = await geminiProvider.analyze(input, sourceText);
    return Response.json(
      {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        demo: false,
        input,
        result,
        sourceText,
        sourceUrl,
        sourceCharacters: sourceText.length,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
