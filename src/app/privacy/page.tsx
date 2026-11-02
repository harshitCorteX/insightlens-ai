export const metadata = { title: "Privacy" };
export default function Privacy() {
  return (
    <article className="legal-page">
      <p className="eyebrow">YOUR IDEAS STAY YOURS</p>
      <h1>Privacy, in plain language.</h1>
      <p className="legal-date">Release disclosure · 2 November 2026</p>
      <p>
        InsightLens AI analyzes content you choose to submit. This page
        describes the implemented data flow. The site operator must add their
        identity, contact details, applicable legal terms, and chosen provider
        retention settings before a public launch.
      </p>
      <h2>What leaves your browser</h2>
      <p>
        Live analysis sends submitted text, your learning goal, explanation
        depth, reflection style, and selected interests to the application
        server, then to the configured Gemini API. Reflection feedback sends the
        question, your answer, and the analysis summary. Do not submit
        passwords, confidential records, or content you do not have permission
        to share. Google’s processing and retention terms depend on the
        operator’s configured service and account; this application cannot
        promise zero provider retention or that every provider tier excludes
        training use.
      </p>
      <h2>Guest sessions</h2>
      <p>
        Guest content and answers are held in session storage in the current
        browser tab. They are not automatically saved to the application
        database. Session storage survives refreshes and can be restored by some
        browser session-restore features. Use “Close this session” in an
        analysis to remove that tab’s stored copy. Appearance and reading
        preferences use persistent local storage. Clear this site’s browser
        storage to remove them.
      </p>
      <h2>Accounts and saved content</h2>
      <p>
        When configured, Supabase handles email authentication. Your password is
        sent to Supabase Auth through the application server; it is not stored
        in application tables. Saving an analysis explicitly stores the
        submitted content, AI result, reflections, claim interactions, and your
        takeaway in your private account. Account-synced preferences are stored
        only when you choose to save them. Row Level Security restricts each
        user’s records to their account.
      </p>
      <h2>Deletion and exports</h2>
      <p>
        You can export each analysis as Markdown, delete individual analyses in
        the library, delete all saved analyses in Preferences, and delete the
        account when the server-side admin integration is configured. Deleting a
        database record removes its active application copy. Managed backups and
        third-party provider records follow those providers’ retention
        schedules. Copies you exported remain under your control.
      </p>
      <h2>Usage controls and infrastructure</h2>
      <p>
        The application does not intentionally log raw submitted text or
        answers. Hosting and AI providers may maintain operational logs.
        Production rate limiting stores an HMAC of your IP address, a request
        category, and short-lived hourly counters, including global request
        counters. Raw IP addresses are not written to the quota table. Expired
        counters are removed by the next quota request after expiry. The hosting
        platform still receives your IP for network delivery.
      </p>
      <h2>Sources, cookies, and analytics</h2>
      <p>
        Public article requests contact the selected source from the server. The
        reader does not execute page scripts or bypass access restrictions.
        Supabase session cookies support authentication; next-themes and reading
        controls store local preferences. This release contains no advertising
        trackers or third-party analytics SDK. The sample demo does not make an
        AI call.
      </p>
      <h2>Questions and operator contact</h2>
      <p>
        No operator contact has been configured in this starter deployment. The
        operator must publish a working contact and review these disclosures
        against their actual provider accounts before accepting public user
        data.
      </p>
    </article>
  );
}
