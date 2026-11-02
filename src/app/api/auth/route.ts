import { z } from "zod";
import { serverSupabase } from "@/lib/supabase/server";
import {
  AppError,
  assertSameOrigin,
  errorResponse,
  readJson,
} from "@/lib/server/errors";
const schema = z.object({
  action: z.enum(["login", "signup", "logout"]),
  email: z.email().optional(),
  password: z.string().min(8).max(128).optional(),
});
export async function GET() {
  try {
    const db = await serverSupabase();
    const {
      data: { user },
    } = await db.auth.getUser();
    return Response.json(
      { user: user ? { id: user.id, email: user.email } : null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return Response.json({ user: null, configured: false });
  }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const parsed = schema.safeParse(await readJson(request, 8000));
    if (!parsed.success)
      throw new AppError(
        "Enter a valid email and a password of at least 8 characters.",
      );
    const { action, email, password } = parsed.data;
    const db = await serverSupabase();
    if (action === "logout") {
      const { error } = await db.auth.signOut();
      if (error) throw new AppError("Sign out failed. Please retry.", 503);
      return Response.json({ ok: true });
    }
    if (!email || !password)
      throw new AppError("Email and password are required.");
    const result =
      action === "login"
        ? await db.auth.signInWithPassword({ email, password })
        : await db.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin}/auth/callback`,
            },
          });
    if (result.error)
      throw new AppError(
        action === "login"
          ? "We couldn't sign you in. Check your credentials and confirm your email, or try again later."
          : "We couldn't create your account. Check your details and try again later.",
        400,
      );
    return Response.json({ ok: true, confirmEmail: !result.data.session });
  } catch (error) {
    return errorResponse(error);
  }
}
