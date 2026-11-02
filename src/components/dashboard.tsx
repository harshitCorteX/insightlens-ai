"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  Layers3,
  LoaderCircle,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useLibrary } from "./use-library";
import { Button } from "./ui/button";
const ActivityChart = dynamic(() => import("./activity-chart"), {
  ssr: false,
  loading: () => <div className="chart-placeholder" />,
});
export function Dashboard() {
  const { items, loading, error, reload, user } = useLibrary();
  const topics = [...new Set(items.map((i) => i.analysis.result.topic))];
  const examined = items.reduce((n, x) => n + x.progress.examined.length, 0);
  const completed = items.filter((i) => i.progress.finished).length;
  const takeaways = items.filter((i) => i.progress.takeaway);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return {
      day: d.toLocaleDateString("en", { weekday: "short" }),
      count: items.filter(
        (x) =>
          new Date(x.analysis.createdAt).toDateString() === d.toDateString(),
      ).length,
    };
  });
  return (
    <div className="page-container dashboard-page">
      <div className="page-breadcrumb">
        Your workspace <span>/</span> Overview
      </div>
      <div className="collection-heading">
        <div className="page-heading">
          <p className="eyebrow">ONE IDEA AT A TIME</p>
          <h1>Your thinking, in progress.</h1>
          <p>A little perspective on the ideas you’ve chosen to keep.</p>
        </div>
        <Button asChild>
          <Link href="/analyze">
            Explore an idea
            <ArrowUpRight size={15} />
          </Link>
        </Button>
      </div>
      {loading ? (
        <div className="page-loading" role="status">
          <LoaderCircle className="spin" />
          Gathering your discoveries…
        </div>
      ) : error ? (
        <div className="form-error" role="alert">
          {error}
          <Button variant="outline" onClick={reload}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {[
              { icon: BookOpen, label: "Saved analyses", value: items.length },
              { icon: Compass, label: "Claim cards opened", value: examined },
              {
                icon: MessageCircle,
                label: "Reflections finished",
                value: completed,
              },
              { icon: Layers3, label: "Topics explored", value: topics.length },
            ].map(({ icon: Icon, label, value }) => (
              <article key={label}>
                <div>
                  <Icon size={18} />
                  <span>{label}</span>
                </div>
                <strong>{value.toString().padStart(2, "0")}</strong>
              </article>
            ))}
          </div>
          {items.length === 0 ? (
            <div className="dashboard-welcome">
              <span className="feature-icon">
                <Sparkles size={25} />
              </span>
              <div>
                <p className="eyebrow">A CLEAN PAGE. A CURIOUS MIND.</p>
                <h2>Every perspective starts somewhere.</h2>
                <p>
                  {user
                    ? "Save your first analysis and your thinking space will start taking shape."
                    : "Try an analysis without signing in. Create an account when you’re ready to build your private library."}
                </p>
                <div>
                  <Button asChild>
                    <Link href="/analyze">
                      Find your first insight
                      <ArrowRight size={15} />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/analyze?demo=1">Explore the demo</Link>
                  </Button>
                </div>
              </div>
              <div className="welcome-aperture" aria-hidden="true">
                <Compass size={130} strokeWidth={0.5} />
              </div>
            </div>
          ) : (
            <>
              <div className="dashboard-grid">
                <section className="dashboard-panel">
                  <div className="panel-heading">
                    <h2>Small moments, over time.</h2>
                    <span>LAST 7 DAYS</span>
                  </div>
                  <ActivityChart data={days} />
                  <p className="microcopy">
                    Saved analyses by original analysis date. Activity is not a
                    measure of understanding.
                  </p>
                </section>
                <section className="dashboard-panel">
                  <div className="panel-heading">
                    <h2>Where curiosity took you.</h2>
                    <span>TOPICS</span>
                  </div>
                  <div className="topic-bars">
                    {topics.map((topic) => {
                      const count = items.filter(
                        (i) => i.analysis.result.topic === topic,
                      ).length;
                      return (
                        <div key={topic}>
                          <div>
                            <span>{topic}</span>
                            <strong>{count}</strong>
                          </div>
                          <div className="topic-bar">
                            <i
                              style={{
                                width: `${(count / items.length) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
              <section className="recent-section">
                <div className="panel-heading">
                  <h2>Return to a good question.</h2>
                  <Link href="/library" className="text-button">
                    View library
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
                {items.slice(0, 4).map(({ analysis: a, progress: p }) => (
                  <Link
                    href={`/analysis/${a.id}`}
                    key={a.id}
                    className="recent-row"
                  >
                    <span className="recent-icon">
                      <BookOpen size={18} />
                    </span>
                    <div>
                      <h3>{a.result.title}</h3>
                      <p>
                        {a.result.topic} ·{" "}
                        {p.finished
                          ? "Reflection finished"
                          : "Reflection in progress"}
                      </p>
                    </div>
                    <time>
                      {new Date(a.createdAt).toLocaleDateString("en", {
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
              </section>
              <div className="dashboard-grid lower-grid">
                <section className="dashboard-panel">
                  <div className="panel-heading">
                    <h2>In your own words.</h2>
                    <MessageCircle size={17} />
                  </div>
                  {takeaways.length ? (
                    takeaways
                      .slice(0, 3)
                      .map(({ analysis: a, progress: p }) => (
                        <blockquote className="takeaway-quote" key={a.id}>
                          <p>“{p.takeaway}”</p>
                          <Link href={`/analysis/${a.id}`}>
                            {a.result.title}
                            <ArrowUpRight size={12} />
                          </Link>
                        </blockquote>
                      ))
                  ) : (
                    <p className="muted text-sm">
                      Add a personal takeaway to an Attention Receipt, then save
                      it to see it here.
                    </p>
                  )}
                </section>
                <section className="dashboard-panel next-actions">
                  <div className="panel-heading">
                    <h2>A direction to explore.</h2>
                    <Compass size={17} />
                  </div>
                  <p>{items[0].analysis.result.nextStep.action}</p>
                  <span className="microcopy">
                    Suggested next action from your most recent saved analysis.
                    Completion isn’t tracked.
                  </span>
                  <Link
                    href={`/analysis/${items[0].analysis.id}`}
                    className="text-button"
                  >
                    Return to the idea
                    <ArrowRight size={14} />
                  </Link>
                </section>
              </div>
            </>
          )}
          {!user && (
            <p className="dashboard-signin">
              <Link href="/signup">Create an account</Link> to save discoveries
              and see your learning activity here.
            </p>
          )}
        </>
      )}
    </div>
  );
}
