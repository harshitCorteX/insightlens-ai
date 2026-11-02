import { it, expect, vi, beforeEach } from "vitest";
const mock = vi.hoisted(() => ({
  lookup: vi.fn(),
  fetch: vi.fn(),
  agentOptions: null as unknown,
  close: vi.fn(),
}));
vi.mock("node:dns/promises", () => ({ lookup: mock.lookup }));
vi.mock("undici", () => ({
  Agent: class {
    constructor(options: unknown) {
      mock.agentOptions = options;
    }
    close = mock.close;
  },
  fetch: mock.fetch,
}));
import { extractArticle } from "@/lib/server/article";
beforeEach(() => {
  mock.lookup.mockResolvedValue([{ address: "8.8.8.8", family: 4 }]);
  mock.close.mockResolvedValue(undefined);
});
it("rejects a supported hostname resolving to a private address before opening a socket", async () => {
  mock.lookup.mockResolvedValue([{ address: "127.0.0.1", family: 4 }]);
  await expect(extractArticle("https://www.bbc.com/article")).rejects.toThrow(
    "public address",
  );
  expect(mock.fetch).not.toHaveBeenCalled();
});
it("revalidates redirects instead of following them to internal services", async () => {
  mock.fetch.mockResolvedValue(
    new Response(null, {
      status: 302,
      headers: { location: "https://169.254.169.254/" },
    }),
  );
  await expect(extractArticle("https://www.bbc.com/article")).rejects.toThrow(
    "isn't supported",
  );
  expect(mock.fetch).toHaveBeenCalledTimes(1);
  expect(mock.close).toHaveBeenCalled();
});
it("caps downloads even when a server advertises a large response", async () => {
  mock.fetch.mockResolvedValue(
    new Response("large", {
      headers: { "Content-Type": "text/html", "Content-Length": "2000000" },
    }),
  );
  await expect(extractArticle("https://www.bbc.com/article")).rejects.toThrow(
    "too large",
  );
});
it("pins connection lookup to the validated IP and extracts only readable text", async () => {
  const paragraph =
    "An original example paragraph discusses a meaningful idea in enough detail to demonstrate article extraction without executing embedded scripts. ";
  mock.fetch.mockResolvedValue(
    new Response(
      `<html><head><title>Test article</title></head><body><article><h1>Test article</h1><p>${paragraph.repeat(10)}</p><script>alert('never executed')</script></article></body></html>`,
      { headers: { "Content-Type": "text/html" } },
    ),
  );
  const result = await extractArticle("https://www.bbc.com/article");
  expect(result.text).toContain("original example");
  expect(result.text).not.toContain("alert(");
  const options = mock.agentOptions as {
    connect: {
      lookup: (
        h: string,
        o: { all: boolean },
        callback: (error: unknown, addresses: unknown) => void,
      ) => void;
    };
  };
  const callback = vi.fn();
  options.connect.lookup("www.bbc.com", { all: true }, callback);
  expect(callback).toHaveBeenCalledWith(null, [
    { address: "8.8.8.8", family: 4 },
  ]);
});
