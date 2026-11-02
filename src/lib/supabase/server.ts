import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AppError } from "@/lib/server/errors";
import type { Database } from "./types";
export const authConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
export async function serverSupabase() {
  if (!authConfigured())
    throw new AppError(
      "Accounts aren't configured yet. You can still explore the sample demo.",
      503,
    );
  const jar = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Server Components cannot write; proxy refreshes cookies. */
          }
        },
      },
    },
  );
}
export async function requireUser() {
  const db = await serverSupabase();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user)
    throw new AppError(
      "Sign in to save and manage your learning library.",
      401,
    );
  return { db, user };
}
