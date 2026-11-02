"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion, useReducedMotion } from "motion/react";
import {
  AlignLeft,
  ArrowRight,
  Check,
  ChevronDown,
  FileText,
  Link2,
  LoaderCircle,
  LockKeyhole,
  Play,
  Sparkles,
  X,
} from "lucide-react";
import {
  inputSchema,
  analysisSchema,
  goals,
  depths,
  emptyProgress,
  type Analysis,
  type AnalysisInput,
} from "@/lib/schema";
import { api } from "@/lib/utils";
import { createDemo } from "@/lib/demo";
import { storeSession } from "@/lib/session";
import { Button } from "./ui/button";
import { useApp } from "./providers";
export function ContentInput({ compact = false }: { compact?: boolean }) {
  const { preferences } = useApp();
  const router = useRouter();
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<AnalysisInput["mode"]>("text");
  const [depth, setDepth] = useState<AnalysisInput["depth"] | null>(null);
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: { content: "", title: "", goal: goals[0] as string },
  });
  const content = watch("content");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [storageError, setStorageError] = useState(false);
  function open(analysis: Analysis) {
    if (!storeSession(analysis, emptyProgress())) {
      setStorageError(true);
      setError(
        "Your browser session storage is unavailable. Enable it for this site to open and preserve your analysis.",
      );
      return;
    }
    router.push(`/analysis/${analysis.id}`);
  }
  async function submit(values: {
    content: string;
    title: string;
    goal: string;
  }) {
    setError("");
    const parsed = inputSchema.safeParse({
      ...values,
      mode,
      depth: depth ?? preferences.depth,
      reflectionStyle: preferences.reflectionStyle,
      interests: preferences.interests,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      open(
        analysisSchema.parse(
          await api<Analysis>("/api/analyze", {
            method: "POST",
            body: JSON.stringify(parsed.data),
          }),
        ),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={`content-input ${compact ? "compact-input" : ""}`}>
      <div className="input-top">
        <div className="input-tabs" role="group" aria-label="Content type">
          {(
            [
              { id: "text", label: "Paste text", icon: AlignLeft },
              { id: "url", label: "Article URL", icon: Link2 },
              { id: "transcript", label: "Video transcript", icon: Play },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => {
                setMode(id);
                setError("");
              }}
              className={mode === id ? "active" : ""}
              disabled={busy}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <span className="input-utility">
          <LockKeyhole size={13} />
          Private by default
        </span>
      </div>
      <form onSubmit={handleSubmit(submit)}>
        <motion.div
          key={mode}
          initial={reduced ? false : { y: 4 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.18 }}
          className="input-writing"
        >
          <label
            htmlFor={compact ? "landing-content" : "analysis-content"}
            className="sr-only"
          >
            {mode === "url"
              ? "Article URL"
              : mode === "transcript"
                ? "Transcript to analyze"
                : "Content to analyze"}
          </label>
          {mode === "url" ? (
            <input
              id={compact ? "landing-content" : "analysis-content"}
              {...register("content")}
              type="url"
              maxLength={30000}
              placeholder="https://www.theguardian.com/…"
              disabled={busy}
              aria-describedby="input-hint"
            />
          ) : (
            <textarea
              id={compact ? "landing-content" : "analysis-content"}
              {...register("content")}
              maxLength={30000}
              placeholder={
                mode === "transcript"
                  ? "Paste a video or podcast transcript. Let's unpack the ideas behind it…"
                  : "An interesting article. A big idea. Something that made you pause.\nPaste it here. Let's make sense of it."
              }
              rows={compact ? 4 : 7}
              disabled={busy}
              aria-describedby="input-hint"
            />
          )}
          <div className="input-meta">
            <span id="input-hint">
              {mode === "url"
                ? "Public articles from supported sources"
                : "100–30,000 characters"}
            </span>
            <div>
              <span>{content.length.toLocaleString()} / 30,000</span>
              {content && (
                <button
                  type="button"
                  aria-label="Clear input"
                  onClick={() => setValue("content", "")}
                  disabled={busy}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
        {!compact && (
          <div className="input-extra">
            <label>
              Title <span className="muted">(optional)</span>
              <input
                {...register("title")}
                maxLength={180}
                placeholder="Give your reading a name"
                disabled={busy}
              />
            </label>
            <label>
              Explanation depth
              <select
                value={depth ?? preferences.depth}
                onChange={(e) =>
                  setDepth(e.target.value as AnalysisInput["depth"])
                }
                disabled={busy}
              >
                {depths.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
          </div>
        )}
        <div className="input-bottom">
          <label className="goal-select">
            <span>My goal</span>
            <span className="select-wrap">
              <select
                {...register("goal")}
                disabled={busy}
                aria-label="Learning goal"
              >
                {goals.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
              <ChevronDown size={14} />
            </span>
          </label>
          <Button type="submit" disabled={busy}>
            {busy ? (
              <>
                <LoaderCircle size={16} className="spin" />
                Analyzing content…
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Find the insight
                <ArrowRight size={17} />
              </>
            )}
          </Button>
        </div>
        {busy && (
          <div className="processing-state" role="status">
            <div className="skeleton-line" />
            <p>
              Reading your content and preparing a structured analysis. This may
              take up to a minute.
            </p>
          </div>
        )}
        {error && (
          <div className="form-error" role="alert">
            {error}
            {!storageError && (
              <button
                type="button"
                className="text-button"
                onClick={() => open(createDemo())}
              >
                Explore the sample instead <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}
      </form>
      <div className="input-footnote">
        <span>
          <Check size={14} />
          No account needed to explore
        </span>
        <button
          type="button"
          onClick={() => open(createDemo())}
          disabled={busy}
        >
          <FileText size={14} />
          Try a sample
          <ArrowUpIcon />
        </button>
      </div>
      {mode === "url" && (
        <p className="source-hint">
          Supported: English Wikipedia, BBC, The Guardian, Nature, Scientific
          American. Access depends on the page. For YouTube, select Video
          transcript and paste captions you have permission to use.
        </p>
      )}
    </div>
  );
}
function ArrowUpIcon() {
  return <ArrowRight size={13} />;
}
