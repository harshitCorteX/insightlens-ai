"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Compass,
  Download,
  Focus,
  HelpCircle,
  List,
  LoaderCircle,
  MessageCircle,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Type,
  X,
} from "lucide-react";
import {
  analysisSchema,
  emptyProgress,
  savedSchema,
  type Analysis,
  type Progress,
  type ReflectionFeedback,
} from "@/lib/schema";
import { api, downloadMarkdown, verificationLabel } from "@/lib/utils";
import { loadSession, storeSession, discardSession } from "@/lib/session";
import { receiptMarkdown } from "@/lib/receipt";
import { useApp } from "./providers";
import { Button } from "./ui/button";
import { Modal } from "./ui/dialog";
import { ThemeControl } from "./theme-control";
import { ReadingSettings } from "./reading-settings";
const sections = [
  "Overview",
  "Main Ideas",
  "Claim Compass",
  "Reflection Loop",
  "Attention Receipt",
  "Next Step",
] as const;
type Section = (typeof sections)[number];
export function AnalysisReader({ id }: { id: string }) {
  const router = useRouter();
  const { user, preferences: p } = useApp();
  const [a, setAnalysis] = useState<Analysis | null>(null);
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [saveBusy, setSaveBusy] = useState(false);
  const [section, setSection] = useState<Section>("Overview");
  const [focus, setFocus] = useState(false);
  const [settings, setSettings] = useState(false);
  const [outline, setOutline] = useState(false);
  const [discard, setDiscard] = useState(false);
  const enterFocusRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let cancelled = false;
    const local = loadSession(id);
    if (local) {
      setAnalysis(local.analysis);
      setProgress(local.progress);
      setLoading(false);
      return;
    }
    void api<unknown>(`/api/analyses/${id}`)
      .then((data) => {
        const parsed = savedSchema.parse(data);
        if (!cancelled) {
          setAnalysis(parsed.analysis);
          setProgress(parsed.progress);
        }
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);
  useEffect(() => {
    if (a) storeSession(a, progress);
  }, [a, progress]);
  useEffect(() => {
    document.body.dataset.focus = focus ? "true" : "false";
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !settings && !discard) {
        setFocus(false);
        setOutline(false);
        enterFocusRef.current?.focus();
      }
    };
    window.addEventListener("keydown", escape);
    return () => {
      delete document.body.dataset.focus;
      window.removeEventListener("keydown", escape);
    };
  }, [focus, settings, discard]);
  function changeProgress(value: Partial<Progress>) {
    setProgress((previous) => ({ ...previous, ...value }));
  }
  async function save() {
    if (!a) return;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/analysis/${id}`)}`);
      return;
    }
    setSaveBusy(true);
    setMessage("");
    try {
      await api("/api/analyses", {
        method: "POST",
        body: JSON.stringify({ analysis: a, progress }),
      });
      setMessage("Saved to your private knowledge library.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setSaveBusy(false);
    }
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Copied to clipboard.");
    } catch {
      setMessage(
        "Clipboard access isn't available. Use Export Markdown to keep a copy.",
      );
    }
  }
  if (loading)
    return (
      <div className="page-loading" role="status">
        <LoaderCircle className="spin" />
        Opening your analysis…
      </div>
    );
  if (!a)
    return (
      <div className="empty-state page-container">
        <BookOpen size={36} />
        <h1>This page needs a fresh start.</h1>
        <p>
          {loadError ||
            "This guest analysis isn't available in this tab. Guest content is only kept for the current browser session."}
        </p>
        <Button asChild>
          <Link href="/analyze">
            Create an analysis
            <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
    );
  const result = a.result;
  return (
    <div
      className={`reader-page ${focus ? "in-focus" : ""} reading-${p.fontSize} font-${p.font} width-${p.width} spacing-${p.spacing} surface-${p.surface}`}
    >
      {focus && (
        <div className="focus-toolbar">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFocus(false);
              enterFocusRef.current?.focus();
            }}
          >
            <X size={16} />
            <span>Exit focus</span>
            <kbd>esc</kbd>
          </Button>
          <span className="focus-toolbar-title">A little room to think.</span>
          <div>
            <ThemeControl />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Reading settings"
              onClick={() => setSettings(true)}
            >
              <Type size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle content outline"
              aria-expanded={outline}
              onClick={() => setOutline(!outline)}
            >
              <List size={18} />
            </Button>
          </div>
        </div>
      )}
      {focus && outline && (
        <nav className="focus-outline" aria-label="Content outline">
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSection(s);
                setOutline(false);
              }}
              aria-current={s === section ? "page" : undefined}
            >
              {s}
              <ArrowRight size={14} />
            </button>
          ))}
        </nav>
      )}
      <div className="reader-container">
        <div className="reader-topline">
          <Link href="/analyze" className="text-button">
            <ArrowLeft size={15} />
            Back to workspace
          </Link>
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copy(result.summary)}
            >
              <Clipboard size={15} />
              Copy summary
            </Button>
            <Button
              variant="outline"
              size="sm"
              ref={enterFocusRef}
              onClick={() => setFocus(true)}
            >
              <Focus size={16} />
              Enter Focus Mode
            </Button>
          </div>
        </div>
        <header className="analysis-heading">
          <div className="analysis-meta">
            <span className="tag violet-tag">
              {a.demo ? "SAMPLE DEMO" : "AI-ASSISTED ANALYSIS"}
            </span>
            <span>{result.topic}</span>
            <span className="meta-separator">/</span>
            <span>
              {a.input.mode === "transcript"
                ? "Transcript"
                : a.input.mode === "url"
                  ? "Public article"
                  : "Pasted text"}
            </span>
          </div>
          <h1>{result.title}</h1>
          <p className="analysis-subtitle">
            A closer look at the ideas, the claims, and what they mean to you.
          </p>
          <div className="analysis-byline">
            <span>
              <BookOpen size={14} />
              {a.sourceCharacters.toLocaleString()} characters analyzed
            </span>
            <span>
              <ShieldCheck size={14} />
              No independent evidence retrieved
            </span>
          </div>
        </header>
        {a.demo && (
          <div className="demo-notice">
            <Sparkles size={16} />
            <p>
              <strong>You’re exploring a sample.</strong> This original essay
              and its analysis are prewritten. No live AI request or fact-check
              was performed.
            </p>
          </div>
        )}
        <div
          className="analysis-tabs"
          role="group"
          aria-label="Analysis sections"
        >
          {sections.map((s, i) => (
            <button
              key={s}
              type="button"
              aria-pressed={section === s}
              onClick={() => setSection(s)}
              className={section === s ? "active" : ""}
            >
              <span className="tab-index">0{i + 1}</span>
              {s}
              {s === "Reflection Loop" && progress.finished && (
                <Check size={13} />
              )}
            </button>
          ))}
        </div>
        <div className="reader-layout">
          <article className="analysis-body" key={section}>
            {section === "Overview" && (
              <>
                <SectionHeading
                  number="01"
                  title="The bigger picture"
                  subtitle="The central thread, with room for nuance."
                />
                <p className="summary-text">{result.summary}</p>
                <div className="argument-card">
                  <span className="eyebrow">
                    <Sparkles size={14} />
                    THE MAIN ARGUMENT
                  </span>
                  <p>{result.mainArgument}</p>
                </div>
                <h3 className="subheading">A few things to keep in mind</h3>
                <ul className="context-list">
                  {result.limitations.map((l) => (
                    <li key={l}>
                      <HelpCircle size={17} />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
                <details className="source-details">
                  <summary>
                    <BookOpen size={16} />
                    Read the original content
                    <ChevronDown size={16} />
                  </summary>
                  {a.sourceUrl && (
                    <a
                      href={a.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-button"
                    >
                      Open source
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                  <p className="source-text">{a.sourceText}</p>
                </details>
                <NextSection
                  label="Explore the main ideas"
                  onClick={() => setSection("Main Ideas")}
                />
              </>
            )}
            {section === "Main Ideas" && (
              <>
                <SectionHeading
                  number="02"
                  title="Ideas worth keeping"
                  subtitle="The important threads, in a little more detail."
                />
                <div className="ideas-list">
                  {result.mainIdeas.map((idea, i) => (
                    <section key={idea.title}>
                      <span>0{i + 1}</span>
                      <div>
                        <h3>{idea.title}</h3>
                        <p>{idea.explanation}</p>
                        <button
                          className="text-button"
                          onClick={() =>
                            copy(`${idea.title}\n${idea.explanation}`)
                          }
                        >
                          <Clipboard size={13} />
                          Copy insight
                        </button>
                      </div>
                    </section>
                  ))}
                </div>
                <div className="concepts-box">
                  <p className="eyebrow">A LITTLE CONTEXT</p>
                  {result.concepts.map((c) => (
                    <p key={c.term}>
                      <strong>{c.term}</strong>
                      {c.definition}
                    </p>
                  ))}
                </div>
                <NextSection
                  label="Examine the claims"
                  onClick={() => setSection("Claim Compass")}
                />
              </>
            )}
            {section === "Claim Compass" && (
              <>
                <SectionHeading
                  number="03"
                  title="A compass, not a verdict."
                  subtitle="Look at the reasoning. Notice what is missing. Find your own direction."
                />
                <div className="evidence-notice">
                  <ShieldCheck size={19} />
                  <p>
                    These claims were extracted from the submitted content.{" "}
                    <strong>None has been independently verified.</strong> The
                    source text alone cannot establish that its own claims are
                    true.
                  </p>
                </div>
                <div className="claim-list">
                  {result.claims.map((c, i) => (
                    <details
                      key={i}
                      className="claim-card"
                      onToggle={(event) => {
                        if (event.currentTarget.open)
                          setProgress((old) => ({
                            ...old,
                            examined: [...new Set([...old.examined, i])],
                          }));
                      }}
                    >
                      <summary>
                        <div className="claim-card-top">
                          <span className="claim-type">
                            <span
                              className={`category-dot category-${c.category.split(" ")[0].toLowerCase()}`}
                            />
                            {c.category}
                          </span>
                          <span className="tag amber-tag">
                            {verificationLabel}
                          </span>
                        </div>
                        <div className="claim-title">
                          <span>0{i + 1}</span>
                          <h3>{c.statement}</h3>
                          <ChevronDown size={18} />
                        </div>
                        <p>{c.explanation}</p>
                      </summary>
                      <div className="claim-expanded">
                        {c.excerpt && (
                          <blockquote>
                            <span className="eyebrow">FROM THE SOURCE</span>“
                            {c.excerpt}”
                          </blockquote>
                        )}
                        <div className="claim-context-grid">
                          <div>
                            <h4>Available context</h4>
                            <p>{c.context}</p>
                          </div>
                          <div>
                            <h4>What’s missing</h4>
                            <p>{c.missingInformation}</p>
                          </div>
                        </div>
                        <h4>Why it matters</h4>
                        <p>{c.whyItMatters}</p>
                        <div className="claim-feedback">
                          <span>Was this useful?</span>
                          {(
                            [
                              "Helpful",
                              "Incorrect",
                              "Needs more context",
                            ] as const
                          ).map((value) => (
                            <button
                              key={value}
                              aria-pressed={progress.claimFeedback[i] === value}
                              onClick={() =>
                                changeProgress({
                                  claimFeedback: {
                                    ...progress.claimFeedback,
                                    [i]: value,
                                  },
                                })
                              }
                            >
                              {progress.claimFeedback[i] === value && (
                                <Check size={12} />
                              )}{" "}
                              {value}
                            </button>
                          ))}
                        </div>
                        <p className="microcopy">
                          Feedback stays with this analysis. Save to keep it in
                          your account.
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
                <NextSection
                  label="Think it through"
                  onClick={() => setSection("Reflection Loop")}
                />
              </>
            )}
            {section === "Reflection Loop" && (
              <Reflection
                analysis={a}
                progress={progress}
                setProgress={changeProgress}
                onDone={() => setSection("Attention Receipt")}
              />
            )}
            {section === "Attention Receipt" && (
              <>
                <SectionHeading
                  number="05"
                  title="A moment, well considered."
                  subtitle="An honest record of what you explored and what you want to carry forward."
                />
                <div className="attention-receipt">
                  <div className="receipt-header">
                    <ScanLine size={26} />
                    <span className="eyebrow">
                      INSIGHTLENS / ATTENTION RECEIPT
                    </span>
                    <span className="receipt-date">
                      {new Date(a.createdAt).toLocaleDateString("en", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3>{result.title}</h3>
                  <p className="muted">{a.input.goal}</p>
                  <div className="receipt-data">
                    <div>
                      <span>Main ideas explored</span>
                      <strong>{result.mainIdeas.length}</strong>
                    </div>
                    <div>
                      <span>Claim cards opened</span>
                      <strong>
                        {progress.examined.length} / {result.claims.length}
                      </strong>
                    </div>
                    <div>
                      <span>Claims independently verified</span>
                      <strong>0</strong>
                    </div>
                    <div>
                      <span>Reflection answers written</span>
                      <strong>
                        {progress.answers.filter((s) => s.trim()).length} / 3
                      </strong>
                    </div>
                    <div>
                      <span>Reflection session</span>
                      <strong>
                        {progress.finished ? "Finished" : "In progress"}
                      </strong>
                    </div>
                  </div>
                  <div className="receipt-caveat">
                    <ShieldCheck size={15} />
                    <p>
                      No independent sources were retrieved. These counts
                      reflect interactions, not comprehension or time spent
                      learning.
                    </p>
                  </div>
                  <p className="eyebrow">IDEAS TO CARRY FORWARD</p>
                  <ul>
                    {result.mainIdeas.map((i) => (
                      <li key={i.title}>{i.title}</li>
                    ))}
                  </ul>
                  <label className="takeaway-label">
                    Your own takeaway
                    <textarea
                      value={progress.takeaway}
                      onChange={(e) =>
                        changeProgress({ takeaway: e.target.value })
                      }
                      maxLength={4000}
                      rows={3}
                      placeholder="One idea I want to remember…"
                    />
                  </label>
                  <p className="eyebrow">QUESTIONS STILL OPEN</p>
                  <ul>
                    {result.unresolvedQuestions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                  <div className="receipt-perforation" />
                  <p className="receipt-end">
                    A little less consumption. A little more understanding.
                  </p>
                </div>
                <div className="receipt-actions">
                  <Button
                    variant="outline"
                    onClick={() => copy(receiptMarkdown(a, progress))}
                  >
                    <Clipboard size={15} />
                    Copy receipt
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      downloadMarkdown(receiptMarkdown(a, progress))
                    }
                  >
                    <Download size={15} />
                    Export Markdown
                  </Button>
                </div>
                <NextSection
                  label="One better next step"
                  onClick={() => setSection("Next Step")}
                />
              </>
            )}
            {section === "Next Step" && (
              <>
                <SectionHeading
                  number="06"
                  title="One good next step."
                  subtitle="You don’t need another feed. Just somewhere meaningful to go from here."
                />
                <div className="next-step-card">
                  <span className="next-step-icon">
                    <ArrowUpRight size={28} />
                  </span>
                  <p className="eyebrow">YOUR NEXT MOMENT OF CURIOSITY</p>
                  <h3>{result.nextStep.action}</h3>
                  <p>{result.nextStep.reason}</p>
                </div>
                <div className="end-note">
                  <h3>Let the idea settle.</h3>
                  <p>
                    You can save this analysis, return to a question, or simply
                    take a break. Curiosity can wait for you.
                  </p>
                  <div>
                    <Button onClick={save} disabled={saveBusy}>
                      <Bookmark size={15} />
                      {user ? "Save to your library" : "Sign in to save"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setSection("Reflection Loop")}
                    >
                      Return to reflection
                      <ArrowRight size={15} />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </article>
          <aside className="analysis-aside">
            <div className="session-card">
              <span className="eyebrow">YOUR READING COMPANION</span>
              <Compass size={28} />
              <h3>
                Understanding is
                <br />a practice.
              </h3>
              <p>Take your time. The best question might be your own.</p>
              <div>
                <span>Explanation depth</span>
                <strong>{a.input.depth}</strong>
              </div>
              <div>
                <span>Claim cards opened</span>
                <strong>
                  {progress.examined.length} / {result.claims.length}
                </strong>
              </div>
              <div>
                <span>Reflection answers</span>
                <strong>
                  {progress.answers.filter((v) => v.trim()).length} / 3
                </strong>
              </div>
              <Button variant="outline" onClick={save} disabled={saveBusy}>
                {saveBusy ? (
                  <LoaderCircle className="spin" size={15} />
                ) : (
                  <Bookmark size={15} />
                )}
                Save to library
              </Button>
              <p className="microcopy">
                {user
                  ? "Save explicitly to keep this analysis and your current answers."
                  : "Guest progress stays in this browser tab until it closes."}
              </p>
            </div>
            <button
              className="text-button discard-button"
              onClick={() => setDiscard(true)}
            >
              Close this session
              <X size={14} />
            </button>
          </aside>
        </div>
        <div role="status" className={message ? "reader-message" : "sr-only"}>
          {message}
        </div>
        <div className="reader-footer">
          <span>
            <ShieldCheck size={14} />
            AI assists. You decide.
          </span>
          <span>
            {a.demo
              ? "Sample content · Prewritten analysis"
              : "Submitted content · AI interpretation"}
          </span>
        </div>
      </div>
      <Modal
        open={settings}
        onOpenChange={setSettings}
        title="Make room for your reading."
        description="A few small adjustments for a more comfortable experience."
      >
        <ReadingSettings />
      </Modal>
      <Modal
        open={discard}
        onOpenChange={setDiscard}
        title="Close this session?"
        description="Unsaved answers and content will be removed from this tab. Any version you explicitly saved remains in your library."
      >
        <div className="dialog-actions">
          <Button variant="outline" onClick={() => setDiscard(false)}>
            Keep reading
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              discardSession(id);
              router.push("/analyze");
            }}
          >
            Close session
          </Button>
        </div>
      </Modal>
    </div>
  );
}
function SectionHeading({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="analysis-section-heading">
      <span className="eyebrow">{number} / LOOK A LITTLE CLOSER</span>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}
function NextSection({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="next-section">
      <Button variant="secondary" onClick={onClick}>
        {label}
        <ArrowRight size={16} />
      </Button>
    </div>
  );
}
function Reflection({
  analysis: a,
  progress: p,
  setProgress,
  onDone,
}: {
  analysis: Analysis;
  progress: Progress;
  setProgress: (p: Partial<Progress>) => void;
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const question = a.result.questions[index];
  const feedback = p.feedback[index];
  async function submit() {
    setError("");
    if (p.answers[index].trim().length < 10) {
      setError("Write at least 10 characters, or skip this question.");
      return;
    }
    setBusy(true);
    try {
      let result: ReflectionFeedback;
      if (a.demo) {
        result = {
          recognition:
            "You’ve put a response into your own words. In a live analysis, feedback would engage with your specific reasoning.",
          gap: "This is prewritten sample feedback, so it has not evaluated your answer.",
          suggestion:
            "Compare your answer with the source. Name one assumption and one observation that could help test it.",
        };
      } else {
        result = await api<ReflectionFeedback>("/api/reflection", {
          method: "POST",
          body: JSON.stringify({
            question: question.question,
            answer: p.answers[index],
            summary: a.result.summary,
            style: a.input.reflectionStyle,
          }),
        });
      }
      const all = [...p.feedback];
      all[index] = result;
      setProgress({ feedback: all });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function next() {
    setError("");
    if (index < 2) setIndex(index + 1);
    else {
      setProgress({ finished: true });
      onDone();
    }
  }
  return (
    <>
      <SectionHeading
        number="04"
        title="Make the idea your own."
        subtitle="There’s no perfect answer. Start with what you think, then look a little deeper."
      />
      <div className="reflection-progress">
        <div>
          {a.result.questions.map((q, i) => (
            <button
              key={q.kind}
              onClick={() => {
                setIndex(i);
                setError("");
              }}
              aria-label={`Question ${i + 1}: ${q.kind}`}
              aria-current={index === i ? "step" : undefined}
              className={
                index === i ? "active" : p.answers[i].trim() ? "answered" : ""
              }
            >
              <span>{p.answers[i].trim() ? <Check size={13} /> : i + 1}</span>
              {q.kind}
            </button>
          ))}
        </div>
        <span>{index + 1} of 3</span>
      </div>
      <div className="reflection-card">
        <span className="eyebrow">
          <MessageCircle size={15} />
          {question.kind.toUpperCase()} /{" "}
          {a.input.reflectionStyle.toUpperCase()}
        </span>
        <h3>{question.question}</h3>
        <label className="sr-only" htmlFor="reflection-answer">
          Your reflection answer
        </label>
        <textarea
          id="reflection-answer"
          maxLength={4000}
          value={p.answers[index]}
          onChange={(e) => {
            const answers = [...p.answers];
            answers[index] = e.target.value;
            const nextFeedback = [...p.feedback];
            nextFeedback[index] = null;
            setProgress({ answers, feedback: nextFeedback });
          }}
          placeholder="In my own words…"
          rows={6}
          disabled={busy}
        />
        <div className="reflection-input-footer">
          <span>{p.answers[index].length} / 4,000</span>
          <span>Your thinking. Your pace.</span>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {feedback && (
          <div className="feedback-card" role="status">
            <p className="eyebrow">
              <Sparkles size={14} />
              {a.demo
                ? "SAMPLE FEEDBACK — NOT AN EVALUATION"
                : "A PERSPECTIVE ON YOUR RESPONSE"}
            </p>
            <p>{feedback.recognition}</p>
            <p>{feedback.gap}</p>
            <p>
              <strong>Try this:</strong> {feedback.suggestion}
            </p>
          </div>
        )}
        <div className="reflection-actions">
          <Button
            variant="ghost"
            onClick={() => {
              if (index > 0) setIndex(index - 1);
            }}
            disabled={index === 0 || busy}
          >
            <ChevronLeft size={15} />
            Back
          </Button>
          <div>
            <Button variant="ghost" onClick={next} disabled={busy}>
              Skip{index === 2 ? " & finish" : ""}
            </Button>
            {feedback ? (
              <Button onClick={next}>
                Continue
                <ArrowRight size={15} />
              </Button>
            ) : (
              <Button onClick={submit} disabled={busy}>
                {busy ? (
                  <LoaderCircle size={15} className="spin" />
                ) : (
                  <Sparkles size={15} />
                )}
                Get feedback
              </Button>
            )}
          </div>
        </div>
      </div>
      {p.finished && (
        <div className="reflection-overview">
          <h3>Your reflection, so far</h3>
          {a.result.questions.map((q, i) => (
            <div key={q.kind}>
              <strong>{q.kind}</strong>
              <p>
                {p.answers[i] ||
                  "You skipped this question. You can return whenever you like."}
              </p>
            </div>
          ))}
          <Button variant="outline" onClick={onDone}>
            Open your Attention Receipt
            <ArrowRight size={15} />
          </Button>
        </div>
      )}
    </>
  );
}
