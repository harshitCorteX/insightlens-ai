"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clipboard,
  Download,
  FileText,
  Link2,
  LoaderCircle,
  Search,
  Trash2,
  Video,
} from "lucide-react";
import { useLibrary } from "./use-library";
import { Button } from "./ui/button";
import { Modal } from "./ui/dialog";
import type { SavedItem } from "@/lib/schema";
import { api, downloadMarkdown } from "@/lib/utils";
import { receiptMarkdown } from "@/lib/receipt";
import { discardSession } from "@/lib/session";
export function Library() {
  const { items, loading, error, reload, setItems, user } = useLibrary();
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [source, setSource] = useState("");
  const [sort, setSort] = useState("newest");
  const [deleting, setDeleting] = useState<SavedItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const topics = [...new Set(items.map((i) => i.analysis.result.topic))];
  const filtered = items
    .filter(
      ({ analysis: a }) =>
        (!search ||
          `${a.result.title} ${a.result.topic} ${a.result.summary}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (!topic || a.result.topic === topic) &&
        (!source || a.input.mode === source),
    )
    .sort((a, b) =>
      sort === "oldest"
        ? a.analysis.createdAt.localeCompare(b.analysis.createdAt)
        : b.analysis.createdAt.localeCompare(a.analysis.createdAt),
    );
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api(`/api/analyses/${deleting.analysis.id}`, { method: "DELETE" });
      discardSession(deleting.analysis.id);
      setItems((old) =>
        old.filter((v) => v.analysis.id !== deleting.analysis.id),
      );
      setDeleting(null);
      setMessage("Analysis deleted from your library.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page-container library-page">
      <div className="page-breadcrumb">
        Your workspace <span>/</span> Knowledge library
      </div>
      <div className="collection-heading">
        <div className="page-heading">
          <p className="eyebrow">A HOME FOR YOUR DISCOVERIES</p>
          <h1>Keep what stays with you.</h1>
          <p>
            Your ideas, questions, and small moments of clarity. All in one
            place.
          </p>
        </div>
        <Button asChild>
          <Link href="/analyze">
            New analysis
            <ArrowUpRight size={15} />
          </Link>
        </Button>
      </div>
      {loading ? (
        <div className="page-loading" role="status">
          <LoaderCircle className="spin" />
          Opening your library…
        </div>
      ) : error ? (
        <div className="empty-state">
          <BookOpen size={32} />
          <h2>Your library needs a moment.</h2>
          <p role="alert">{error}</p>
          <Button onClick={reload} variant="outline">
            Try again
          </Button>
        </div>
      ) : !user ? (
        <div className="library-guest">
          <div className="empty-library-art" aria-hidden="true">
            <div />
            <div />
            <div />
            <BookOpen size={28} />
          </div>
          <h2>Your next chapter starts here.</h2>
          <p>
            Explore an analysis without an account. When an idea feels worth
            keeping, sign in to save it to your private library.
          </p>
          <div>
            <Button asChild>
              <Link href="/signup">
                Create your account
                <ArrowRight size={15} />
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/analyze?demo=1">Explore a sample</Link>
            </Button>
          </div>
          <span>
            <BookOpen size={13} />
            Saved intentionally. Always yours.
          </span>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={36} />
          <h2>Room for your first discovery.</h2>
          <p>
            Your library is a clean page. Analyze something that caught your
            attention, then save the ideas you want to return to.
          </p>
          <Button asChild>
            <Link href="/analyze">
              Find your first insight
              <ArrowRight size={15} />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="library-toolbar">
            <label className="search-input">
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your discoveries"
                aria-label="Search analyses"
              />
            </label>
            <select
              aria-label="Filter by topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option value="">All topics</option>
              {topics.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select
              aria-label="Filter by source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="">All sources</option>
              <option value="text">Pasted text</option>
              <option value="url">Article URL</option>
              <option value="transcript">Transcript</option>
            </select>
            <select
              aria-label="Sort analyses"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
          <p className="library-count">
            {filtered.length}{" "}
            {filtered.length === 1 ? "discovery" : "discoveries"}
            {items.length === 200 && " · Most recent 200 saved analyses"}
          </p>
          {!filtered.length ? (
            <div className="empty-state">
              <Search size={28} />
              <h2>No matching discoveries.</h2>
              <p>Try a different phrase or clear your filters.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setSource("");
                  setTopic("");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="library-grid">
              {filtered.map((item) => {
                const a = item.analysis;
                const Icon =
                  a.input.mode === "url"
                    ? Link2
                    : a.input.mode === "transcript"
                      ? Video
                      : FileText;
                return (
                  <article key={a.id} className="library-card">
                    <div className="library-card-top">
                      <span>
                        <Icon size={15} />
                        {a.result.topic}
                      </span>
                      {a.demo && <span className="tag violet-tag">Sample</span>}
                    </div>
                    <h2>
                      <Link href={`/analysis/${a.id}`}>{a.result.title}</Link>
                    </h2>
                    <p>{a.result.summary}</p>
                    {item.progress.takeaway && (
                      <blockquote>“{item.progress.takeaway}”</blockquote>
                    )}
                    <div className="library-card-meta">
                      <span>
                        {new Date(a.createdAt).toLocaleDateString("en", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span>
                        {a.result.claims.length} claims ·{" "}
                        {item.progress.answers.filter((x) => x.trim()).length}{" "}
                        reflections
                      </span>
                    </div>
                    <div className="library-card-actions">
                      <Link className="text-button" href={`/analysis/${a.id}`}>
                        Revisit insight
                        <ArrowUpRight size={14} />
                      </Link>
                      <div>
                        <button
                          aria-label={`Copy summary: ${a.result.title}`}
                          title="Copy summary"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                a.result.summary,
                              );
                              setMessage("Summary copied.");
                            } catch {
                              setMessage(
                                "Clipboard unavailable. Export Markdown instead.",
                              );
                            }
                          }}
                        >
                          <Clipboard size={15} />
                        </button>
                        <button
                          aria-label={`Export: ${a.result.title}`}
                          title="Export Markdown"
                          onClick={() =>
                            downloadMarkdown(receiptMarkdown(a, item.progress))
                          }
                        >
                          <Download size={15} />
                        </button>
                        <button
                          aria-label={`Delete: ${a.result.title}`}
                          title="Delete analysis"
                          onClick={() => setDeleting(item)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
      {message && (
        <p className="inline-message" role="status">
          {message}
        </p>
      )}
      <Modal
        open={!!deleting}
        onOpenChange={(open) => {
          if (!busy && !open) setDeleting(null);
        }}
        title="Let this discovery go?"
        description="This permanently removes the saved analysis and its reflection answers from your library. Export a copy first if you want to keep it."
      >
        <div className="dialog-actions">
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => setDeleting(null)}
          >
            Keep it
          </Button>
          <Button variant="danger" disabled={busy} onClick={remove}>
            {busy ? "Deleting…" : "Delete analysis"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
