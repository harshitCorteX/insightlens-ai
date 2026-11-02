"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Compass,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { ContentInput } from "./content-input";
import { createDemo } from "@/lib/demo";
import { storeSession } from "@/lib/session";
import { emptyProgress } from "@/lib/schema";
export function AnalyzeWorkspace() {
  const params = useSearchParams();
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (params.get("demo") === "1" && !started.current) {
      started.current = true;
      const a = createDemo();
      if (storeSession(a, emptyProgress())) router.replace(`/analysis/${a.id}`);
      else setError("Enable session storage to explore the sample analysis.");
    }
  }, [params, router]);
  return (
    <div className="analyze-page page-container">
      <div className="page-breadcrumb">
        Your workspace <span>/</span> A fresh perspective
      </div>
      <div className="page-heading">
        <p className="eyebrow">
          <span className="status-dot" />
          START WITH CURIOSITY
        </p>
        <h1>What’s on your mind?</h1>
        <p>
          Bring an article, a big idea, or something you want to understand.
          <br />
          We’ll help you look a little closer.
        </p>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <ContentInput />
      <div className="analyze-guidance">
        <p className="eyebrow">FROM INFORMATION TO YOUR OWN UNDERSTANDING</p>
        <div>
          {[
            {
              icon: BookOpen,
              title: "Find the thread",
              text: "The main argument, without losing the nuance.",
            },
            {
              icon: Compass,
              title: "Question the claims",
              text: "See the reasoning and what still needs evidence.",
            },
            {
              icon: MessageCircle,
              title: "Make it yours",
              text: "Reflect, apply, and take something meaningful away.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon size={20} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="sample-banner">
        <span className="sample-icon">
          <Sparkles size={22} />
        </span>
        <div>
          <h3>Curious what a little clarity looks like?</h3>
          <p>Take a guided look with an original sample essay.</p>
        </div>
        <button
          className="text-button"
          onClick={() => {
            const a = createDemo();
            if (storeSession(a, emptyProgress()))
              router.push(`/analysis/${a.id}`);
            else setError("Enable session storage to use the sample.");
          }}
        >
          Explore the demo
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
