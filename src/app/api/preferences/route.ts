import { preferencesSchema } from "@/lib/schema";
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
      .from("user_preferences")
      .select("preferences")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw new AppError("Saved preferences couldn't be loaded.", 503);
    return Response.json(data?.preferences ?? null, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    const { db, user } = await requireUser();
    const parsed = preferencesSchema.safeParse(await readJson(request, 16000));
    if (!parsed.success) throw new AppError("Some preferences are invalid.");
    const { error } = await db.from("user_preferences").upsert({
      user_id: user.id,
      preferences: parsed.data,
      updated_at: new Date().toISOString(),
    });
    if (error)
      throw new AppError(
        "Your preferences couldn't be saved to your account.",
        503,
      );
    return Response.json({ saved: true });
  } catch (error) {
    return errorResponse(error);
  }
}
