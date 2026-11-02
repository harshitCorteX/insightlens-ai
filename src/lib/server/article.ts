import "server-only";
import { lookup } from "node:dns/promises";
import ipaddr from "ipaddr.js";
import { Agent, fetch as safeFetch } from "undici";
import { parseHTML } from "linkedom";
import { Readability } from "@mozilla/readability";
import { AppError } from "./errors";
export const supportedDomains = [
  "en.wikipedia.org",
  "www.bbc.com",
  "www.bbc.co.uk",
  "www.theguardian.com",
  "www.nature.com",
  "www.scientificamerican.com",
];
export function isPublicAddress(address: string) {
  try {
    const parsed = ipaddr.process(address);
    return parsed.range() === "unicast";
  } catch {
    return false;
  }
}
export function validateArticleUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new AppError("Enter a valid article URL.");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443") ||
    !supportedDomains.includes(url.hostname)
  )
    throw new AppError(
      "This source isn't supported yet. Paste the article text or a transcript instead. Supported sources are listed below the input.",
    );
  return url;
}
export async function extractArticle(value: string) {
  let url = validateArticleUrl(value);
  const deadline = Date.now() + 12000;
  const signal = AbortSignal.timeout(12000);
  for (let redirects = 0; redirects <= 3; redirects++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0)
      throw new AppError(
        "The article took too long to respond. Paste the text instead.",
        504,
      );
    let dnsTimer: ReturnType<typeof setTimeout> | undefined;
    const addresses = await Promise.race([
      lookup(url.hostname, { all: true }),
      new Promise<never>((_, reject) => {
        dnsTimer = setTimeout(
          () =>
            reject(
              new AppError(
                "The article address took too long to resolve. Paste text instead.",
                504,
              ),
            ),
          remaining,
        );
      }),
    ]).finally(() => clearTimeout(dnsTimer));
    if (!addresses.length || addresses.some((a) => !isPublicAddress(a.address)))
      throw new AppError(
        "This URL doesn't point to a permitted public address.",
      );
    const selected = addresses[0];
    const dispatcher = new Agent({
      connect: {
        lookup: (_hostname, options, callback) => {
          if (options.all) callback(null, [selected]);
          else callback(null, selected.address, selected.family);
        },
      },
    });
    try {
      const res = await safeFetch(url, {
        dispatcher,
        redirect: "manual",
        signal,
        headers: {
          "User-Agent": "InsightLensAI/1.0 (user-requested article reader)",
          Accept: "text/html",
        },
      });
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get("location");
        await res.body?.cancel();
        if (!location)
          throw new AppError(
            "The article redirected without a destination. Paste the text instead.",
          );
        url = validateArticleUrl(new URL(location, url).href);
        continue;
      }
      if (!res.ok || !res.headers.get("content-type")?.includes("text/html")) {
        await res.body?.cancel();
        throw new AppError(
          "We couldn't read this article. It may be restricted or unavailable. Paste text you can access instead.",
        );
      }
      if (Number(res.headers.get("content-length")) > 1500000) {
        await res.body?.cancel();
        throw new AppError(
          "That page is too large. Paste the relevant text instead.",
        );
      }
      const reader = res.body?.getReader();
      const chunks: Uint8Array[] = [];
      let bytes = 0;
      if (!reader) throw new AppError("This page has no readable content.");
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        if (bytes > 1500000) {
          await reader.cancel();
          throw new AppError(
            "That page is too large. Paste the relevant text instead.",
          );
        }
        chunks.push(value);
      }
      const { document } = parseHTML(Buffer.concat(chunks).toString("utf8"));
      const article = new Readability(document as unknown as Document).parse();
      const text = article?.textContent?.trim();
      if (!text || text.length < 100)
        throw new AppError(
          "There isn't enough accessible article text. Paste the text or a transcript instead.",
        );
      if (text.length > 30000)
        throw new AppError(
          "This article exceeds the 30,000-character limit. Paste the section you want to study.",
        );
      return { text, title: article?.title ?? "Article", url: url.href };
    } finally {
      await dispatcher.close();
    }
  }
  throw new AppError(
    "This article redirected too many times. Paste the text instead.",
  );
}
