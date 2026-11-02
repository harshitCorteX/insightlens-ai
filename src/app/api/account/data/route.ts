import { requireUser } from "@/lib/supabase/server";
import { AppError, assertSameOrigin, errorResponse } from "@/lib/server/errors";
export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const { db, user } = await requireUser();
    const { error } = await db.from("analyses").delete().eq("user_id", user.id);
    if (error)
      throw new AppError(
        "Your saved analyses couldn't be deleted. Try again.",
        503,
      );
    return Response.json({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
