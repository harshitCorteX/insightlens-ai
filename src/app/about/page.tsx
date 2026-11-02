import Link from "next/link";
import { ArrowUpRight, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LensMark } from "@/components/brand";
export const metadata = { title: "Our approach" };
export default function About() {
  return (
    <div className="about-page">
      <header>
        <span className="about-mark">
          <LensMark />
        </span>
        <p className="eyebrow">
          A MORE INTENTIONAL RELATIONSHIP WITH INFORMATION
        </p>
        <h1>
          The scroll can wait.
          <br />
          <em>Your curiosity can’t.</em>
        </h1>
        <p>
          The internet makes information effortless to find.
          <br />
          Understanding it is something we get to practice.
        </p>
      </header>
      <section className="about-story">
        <p>
          InsightLens AI is a personal space for looking closer. Bring an
          article, an essay, or a transcript. Find the argument. Examine the
          claims. Give yourself a moment to think in your own words.
        </p>
        <p>
          We believe a useful thinking companion makes your own judgment
          stronger. It should leave room for uncertainty, alternative
          perspectives, and the possibility that the best answer is another
          question.
        </p>
        <div className="about-principles">
          {[
            {
              icon: Compass,
              title: "Your perspective matters.",
              text: "Explore the reasoning. Challenge an assumption. You make the final judgment.",
            },
            {
              icon: ShieldCheck,
              title: "Evidence comes first.",
              text: "An AI interpretation is not independent verification. We keep that distinction visible.",
            },
            {
              icon: Sparkles,
              title: "Make a little room.",
              text: "No endless feed, cognitive scores, or pressure to keep going. Just one meaningful next step.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon size={22} />
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <h2>A work in thoughtful progress.</h2>
        <p>
          This release supports English-language text, user-supplied
          transcripts, and selected public articles. Live analysis needs a
          configured Gemini provider; accounts and private saving need Supabase.
          The sample demo is prewritten and explicitly labeled. Independent
          evidence retrieval is not included in this release, so all claims
          remain unverified.
        </p>
        <p>
          InsightLens does not measure intelligence, diagnose health conditions,
          or promise improvements in memory or attention. Analysis and feedback
          can contain mistakes. Use them as prompts for your own investigation.
        </p>
        <Button asChild>
          <Link href="/analyze">
            Start with a good question
            <ArrowUpRight size={16} />
          </Link>
        </Button>
      </section>
    </div>
  );
}
