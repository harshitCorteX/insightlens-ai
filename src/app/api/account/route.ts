import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/supabase/server";
import { AppError, assertSameOrigin, errorResponse } from "@/lib/server/errors";
export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const { db, user } = await requireUser();
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
      throw new AppError(
        "Account deletion requires the site owner's server configuration. You can delete all saved analyses below.",
        503,
      );
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error)
      throw new AppError(
        "Your account couldn't be deleted. Please retry.",
        503,
      );
    await db.auth.signOut();
    return Response.json({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
