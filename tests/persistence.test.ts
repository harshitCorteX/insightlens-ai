import { beforeEach, it, expect, vi } from "vitest";
import { createDemo } from "@/lib/demo";
import { emptyProgress } from "@/lib/schema";
import { AppError } from "@/lib/server/errors";
const state = vi.hoisted(() => ({
  user: "owner-a",
  rows: new Map<string, { user_id: string; payload: unknown }>(),
  prefs: null as unknown,
}));
vi.mock("@/lib/supabase/server", () => ({
  requireUser: async () => {
    if (!state.user) throw new AppError("Sign in", 401);
    return {
      user: { id: state.user },
      db: {
        from: (table: string) => {
          const filters: Record<string, string> = {};
          let action = "select";
          const chain = {
            select: () => chain,
            eq: (key: string, value: string) => {
              filters[key] = value;
              return chain;
            },
            order: () => chain,
            limit: async () => ({
              data: [...state.rows.values()]
                .filter((r) => r.user_id === filters.user_id)
                .map((r) => ({ payload: r.payload })),
              error: null,
            }),
            maybeSingle: async () => ({
              data:
                table === "user_preferences"
                  ? { preferences: state.prefs }
                  : (() => {
                      const r = state.rows.get(filters.id);
                      return r && r.user_id === filters.user_id
                        ? { payload: r.payload }
                        : null;
                    })(),
              error: null,
            }),
            upsert: async (row: {
              id: string;
              user_id: string;
              payload: unknown;
            }) => {
              const prior = state.rows.get(row.id);
              if (prior && prior.user_id !== row.user_id)
                return { error: new Error("denied") };
              state.rows.set(row.id, row);
              return { error: null };
            },
            delete: () => {
              action = "delete";
              return chain;
            },
            then: (resolve: (v: unknown) => void) => {
              if (action === "delete")
                for (const [id, row] of state.rows)
                  if (
                    row.user_id === filters.user_id &&
                    (!filters.id || filters.id === id)
                  )
                    state.rows.delete(id);
              return Promise.resolve({ error: null }).then(resolve);
            },
          };
          return chain;
        },
      },
    };
  },
}));
import { POST, GET } from "@/app/api/analyses/route";
import { GET as getOne, DELETE } from "@/app/api/analyses/[id]/route";
import { DELETE as deleteAll } from "@/app/api/account/data/route";
function req(body?: unknown) {
  return new Request("http://127.0.0.1:3000/api/analyses", {
    method: body ? "POST" : "DELETE",
    headers: {
      origin: "http://127.0.0.1:3000",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
beforeEach(() => {
  state.user = "owner-a";
  state.rows.clear();
});
it("saves and retrieves analysis, reflection and claim feedback together", async () => {
  const a = createDemo(),
    p = emptyProgress();
  p.answers[0] = "An answer worth keeping";
  p.claimFeedback[0] = "Needs more context";
  expect((await POST(req({ analysis: a, progress: p }))).status).toBe(200);
  const response = await getOne(req(), {
    params: Promise.resolve({ id: a.id }),
  });
  expect((await response.json()).progress.answers[0]).toBe(p.answers[0]);
  expect(await (await GET()).json()).toHaveLength(1);
});
it("scopes reads and deletes to the authenticated user", async () => {
  const a = createDemo();
  state.rows.set(a.id, {
    user_id: "owner-b",
    payload: { analysis: a, progress: emptyProgress() },
  });
  expect(
    (await getOne(req(), { params: Promise.resolve({ id: a.id }) })).status,
  ).toBe(404);
  expect(await (await GET()).json()).toEqual([]);
  await DELETE(req(), { params: Promise.resolve({ id: a.id }) });
  expect(state.rows.has(a.id)).toBe(true);
  await deleteAll(req());
  expect(state.rows.has(a.id)).toBe(true);
});
it("does not accept a client ownership override", async () => {
  const a = createDemo();
  await POST(
    req({ analysis: a, progress: emptyProgress(), user_id: "owner-b" }),
  );
  expect(state.rows.get(a.id)?.user_id).toBe("owner-a");
});
it("removes own saved data while preserving another owner's records", async () => {
  const a = createDemo(),
    b = createDemo();
  state.rows.set(a.id, { user_id: "owner-a", payload: {} });
  state.rows.set(b.id, { user_id: "owner-b", payload: {} });
  expect((await deleteAll(req())).status).toBe(200);
  expect(state.rows.has(a.id)).toBe(false);
  expect(state.rows.has(b.id)).toBe(true);
});
it("rejects anonymous saves", async () => {
  state.user = "";
  expect(
    (await POST(req({ analysis: createDemo(), progress: emptyProgress() })))
      .status,
  ).toBe(401);
});
