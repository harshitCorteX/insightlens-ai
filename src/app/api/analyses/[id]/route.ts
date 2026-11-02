import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { AppError, assertSameOrigin, errorResponse } from "@/lib/server/errors";
type Context = { params: Promise<{ id: string }> };
async function idFrom(context: Context) {
  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success)
    throw new AppError("Analysis not found.", 404);
  return id;
}
export async function GET(_request: Request, context: Context) {
  try {
    const id = await idFrom(context);
    const { db, user } = await requireUser();
    const { data, error } = await db
      .from("analyses")
      .select("payload")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw new AppError("We couldn't load this analysis.", 503);
    if (!data)
      throw new AppError("This analysis wasn't found in your library.", 404);
    return Response.json(data.payload, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const id = await idFrom(context);
    const { db, user } = await requireUser();
    const { error } = await db
      .from("analyses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error)
      throw new AppError("We couldn't delete this analysis. Try again.", 503);
    return Response.json({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
