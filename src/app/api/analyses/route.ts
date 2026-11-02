import { savedSchema } from "@/lib/schema";
import { requireUser } from "@/lib/supabase/server";
import {
  AppError,
  assertSameOrigin,
  errorResponse,
  readJson,
} from "@/lib/server/errors";
export async function GET() {
  try {
    const { db, user } = await requireUser();
    const { data, error } = await db
      .from("analyses")
      .select("payload")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error)
      throw new AppError(
        "Your library couldn't be loaded. Check the database setup or try again.",
        503,
      );
    return Response.json(
      data.map((r) => r.payload),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const { db, user } = await requireUser();
    const parsed = savedSchema.safeParse(await readJson(request, 400000));
    if (!parsed.success)
      throw new AppError(
        "This analysis isn't valid. Please create a new analysis.",
      );
    const { analysis } = parsed.data;
    const { error } = await db.from("analyses").upsert(
      {
        id: analysis.id,
        user_id: user.id,
        title: analysis.result.title,
        topic: analysis.result.topic,
        source_type: analysis.input.mode,
        payload: parsed.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error)
      throw new AppError(
        "We couldn't save your analysis. Please check your account and retry.",
        503,
      );
    return Response.json({ saved: true });
  } catch (error) {
    return errorResponse(error);
  }
}
