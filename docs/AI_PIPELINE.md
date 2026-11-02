# AI pipeline and limitations

`AI_PROVIDER=gemini` selects a server-only adapter using the installed AI SDK's `generateText` with `Output.object({schema})`. The Google adapter accepts the private `GEMINI_API_KEY` and configurable `GEMINI_MODEL`; no model ID is hard-coded in the adapter. `.env.example` lists `gemini-3.5-flash-lite`, which the official Google catalog listed as economical/stable when checked on 2 November 2026. Recheck model availability and pricing for the launch account.

1. Same-origin check and bounded JSON body.
2. Zod input validation and server quota reservation (failed provider attempts still consume budget).
3. Normalize source text; allowlisted URLs go through pinned public DNS and bounded HTML extraction.
4. One structured analysis request, at most one retry, 55-second abort and 6,500 output-token cap.
5. Validate result shape and question types. Remove any excerpt that is not a verbatim source substring. The model cannot add evidence status/links to the result contract.
6. Return transient data to the tab; explicit saving is a separate authenticated operation.
7. Reflection feedback uses a separate structured schema with recognition, gap and suggestion, 30-second abort and 1,300 output-token cap. User answers are untrusted data.

Prompts separate system rules from JSON-encoded untrusted content and forbid following embedded instructions. This reduces injection risk but does not prove model compliance or factual grounding. No tools, secrets, database access, or code execution are available to the model. Output is rendered as escaped text, never HTML.

No independent evidence/search service is implemented. Every claim stays **Not independently verified**, external evidence count stays zero, and no fabricated source links are generated. Source excerpts are provenance, not independent support. Future retrieval must fetch and validate sources and attach evidence in a separate trusted server stage before changing any verdict.

Basic cost bounds: source length, output limits, one retry, local hourly limits in development, and distributed production limits (5 analysis / 15 reflection per subject per hour; 100 total global requests/hour). These are request budgets, not a currency limit. Configure provider-side spend restrictions; retries may incur additional tokens. Server logs emit `ai_usage` events with kind, model and provider-reported token counts, without content or user identifiers. Optional `AI_INPUT_USD_PER_MILLION` and `AI_OUTPUT_USD_PER_MILLION` values enable cost estimates using operator-verified rates. Estimates omit unreported failed attempts, caching/other pricing adjustments and are not billing records. Provider dashboards remain authoritative.

Credential-free tests mock AI output and failure. Live provider quality, hallucination benchmarks, grounded-fact review, and adverse prompt evaluations remain external release checks.

Official API references consulted: [AI SDK structured data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data), [Google provider](https://ai-sdk.dev/providers/ai-sdk-providers/google), [Gemini models](https://ai.google.dev/gemini-api/docs/models). Installed package source/types are the API authority.
