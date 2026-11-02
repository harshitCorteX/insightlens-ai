# Feature behavior

All required routes are present: `/`, `/analyze`, `/analysis/[id]`, `/dashboard`, `/library`, `/login`, `/signup`, `/settings`, `/about`, `/privacy`, `/terms`, error and not-found pages.

The primary journey works with the explicitly labeled original demo without credentials. Live content uses the actual analysis endpoint. Pasted text/transcripts need 100–30,000 characters. Public URLs are restricted to the listed sources and are fetched on the server with a readable-text fallback.

Six navigable analysis sections: summary/argument/caveats, 3–5 main ideas and concepts, 3–5 categorized claims, three reflection skills with answers/skip/back/feedback, a receipt using actual opened-card and answered-question counts, and one bounded next step. Summary/insight/receipt copy and Markdown export work in the browser.

Opening a claim marks it examined; classification is an AI interpretation, never independent verification. Claim usefulness feedback is attached to the analysis, not sent as a message to anyone. Reflection answers persist across sections/focus changes and session reloads. Sample feedback is prewritten and explicitly does not evaluate a user's answer.

Focus Mode hides navigation and the side companion, centers content, supports Escape, keeps an outline and a reading-settings dialog, and supports all themes. Font, size, width, line spacing, paper/low-glare surfaces are locally persistent. The default appearance follows the OS. No scrolling counter claims to measure learning.

Authenticated users explicitly save the whole current analysis. Returning from login uses an internal validated `next` path, preserving active guest session data. The library loads the most recent 200 records, with local search/topic/source filtering and date sorting. Dashboard data comes only from saved records; charts show analysis dates, not reading or learning time. Suggested actions are not marked complete or pending based on assumptions.

Account controls delete one analysis, all analyses, or the account and cascading records. Confirmation dialogs describe permanent deletion. Preference sync is explicit through Load/Save buttons; theme mode remains browser-local.

Not implemented: independent verification/search, persistent highlights, OAuth, Hindi, reminders, knowledge graph, semantic search, automatic captions/history, PDF report export or a paid plan. Product pages disclose current capabilities rather than pretending these exist.
