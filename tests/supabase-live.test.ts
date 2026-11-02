import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { createDemo } from "@/lib/demo";
import { emptyProgress } from "@/lib/schema";
const env = process.env;
const configured = Boolean(
  env.SUPABASE_TEST_URL &&
  env.SUPABASE_TEST_PUBLISHABLE_KEY &&
  env.SUPABASE_TEST_USER_A_EMAIL &&
  env.SUPABASE_TEST_USER_A_PASSWORD &&
  env.SUPABASE_TEST_USER_B_EMAIL &&
  env.SUPABASE_TEST_USER_B_PASSWORD,
);
describe.skipIf(!configured)(
  "real two-user RLS integration (isolated test project only)",
  () => {
    it("isolates insert, select, update and deletion under real user tokens", async () => {
      const a = createClient(
          env.SUPABASE_TEST_URL!,
          env.SUPABASE_TEST_PUBLISHABLE_KEY!,
          { auth: { persistSession: false } },
        ),
        b = createClient(
          env.SUPABASE_TEST_URL!,
          env.SUPABASE_TEST_PUBLISHABLE_KEY!,
          { auth: { persistSession: false } },
        );
      const loginA = await a.auth.signInWithPassword({
        email: env.SUPABASE_TEST_USER_A_EMAIL!,
        password: env.SUPABASE_TEST_USER_A_PASSWORD!,
      });
      const loginB = await b.auth.signInWithPassword({
        email: env.SUPABASE_TEST_USER_B_EMAIL!,
        password: env.SUPABASE_TEST_USER_B_PASSWORD!,
      });
      expect(loginA.error).toBeNull();
      expect(loginB.error).toBeNull();
      const userA = loginA.data.user!.id,
        userB = loginB.data.user!.id;
      expect(userA).not.toBe(userB);
      const analysis = createDemo();
      const payload = { analysis, progress: emptyProgress() };
      try {
        expect(
          (
            await a.from("analyses").insert({
              id: analysis.id,
              user_id: userA,
              title: analysis.result.title,
              topic: analysis.result.topic,
              source_type: "text",
              payload,
            })
          ).error,
        ).toBeNull();
        expect(
          (await b.from("analyses").select("id").eq("id", analysis.id)).data,
        ).toEqual([]);
        expect(
          (
            await b
              .from("analyses")
              .update({ title: "Tampered" })
              .eq("id", analysis.id)
              .select()
          ).data,
        ).toEqual([]);
        expect(
          (await b.from("analyses").delete().eq("id", analysis.id).select())
            .data,
        ).toEqual([]);
        expect(
          (
            await a
              .from("analyses")
              .select("payload")
              .eq("id", analysis.id)
              .single()
          ).data?.payload.progress.answers,
        ).toHaveLength(3);
        const forged = createDemo();
        expect(
          (
            await b.from("analyses").insert({
              id: forged.id,
              user_id: userA,
              title: forged.result.title,
              topic: forged.result.topic,
              source_type: "text",
              payload: { analysis: forged, progress: emptyProgress() },
            })
          ).error,
        ).not.toBeNull();
      } finally {
        await a.from("analyses").delete().eq("id", analysis.id);
        await a.auth.signOut();
        await b.auth.signOut();
      }
    }, 30000);
  },
);
