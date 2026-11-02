"use client";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Compass,
  Focus,
  Lightbulb,
  MessageCircle,
  MoveUpRight,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ContentInput } from "./content-input";
import { Button } from "./ui/button";
import { LensMark } from "./brand";
export function Landing() {
  return (
    <>
      <section className="hero" id="product">
        <div className="hero-kicker">
          <span className="tiny-lens">
            <LensMark />
          </span>
          A little less scrolling. A little more understanding.
          <span className="kicker-dot" />
        </div>
        <h1>
          The internet gives you answers.
          <br />
          Learn to ask <em>better questions.</em>
        </h1>
        <p className="hero-description">
          Turn articles, ideas, and complex information into clarity. Explore
          important claims,
          <br className="desktop-break" /> challenge your understanding, and
          learn something worth remembering.
        </p>
        <div className="hero-actions">
          <Button asChild>
            <Link href="/analyze">
              Start analyzing
              <ArrowUpRight size={17} />
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/analyze?demo=1">
              <span className="play-dot" aria-hidden="true">
                ▷
              </span>
              Explore demo
            </Link>
          </Button>
        </div>
        <p className="hero-note">
          A thinking companion. For your own point of view.
        </p>
        <div className="hero-workspace">
          <div className="workspace-caption">
            <span>
              <span className="status-dot" />
              YOUR NEXT MOMENT OF CLARITY
            </span>
            <span>01 / START WITH CURIOSITY</span>
          </div>
          <ContentInput compact />
          <div className="hero-bottom">
            <span>
              <ShieldCheck size={14} />
              Your ideas stay yours.
            </span>
            <span>Understand. Question. Make it yours.</span>
          </div>
        </div>
        <div className="hero-orbit orbit-one" aria-hidden="true" />
        <div className="hero-orbit orbit-two" aria-hidden="true" />
        <span className="hero-spark spark-one" aria-hidden="true">
          ✧
        </span>
        <span className="hero-spark spark-two" aria-hidden="true">
          +
        </span>
      </section>
      <section className="principles-strip">
        <p>
          More than a summary.
          <br />
          <strong>A new way to engage with ideas.</strong>
        </p>
        <div>
          <Compass />
          Question the claims
        </div>
        <div>
          <MessageCircle />
          Think it through
        </div>
        <div>
          <BookOpen />
          Keep what matters
        </div>
      </section>
      <section id="features" className="features-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">BUILT FOR THE CURIOUS</p>
            <h2>
              Go from “I read that”
              <br />
              to <em>“I understand it.”</em>
            </h2>
          </div>
          <p>
            Small, thoughtful tools that help you look closer.
            <br />
            Because the best insight is the one you make your own.
          </p>
        </div>
        <div className="feature-grid">
          <article className="feature-card compass-feature">
            <div className="feature-heading">
              <span className="feature-icon">
                <Compass size={21} />
              </span>
              <span className="eyebrow">01 / EXAMINE</span>
            </div>
            <h3>A compass for every claim.</h3>
            <p>
              Separate facts from interpretations. See what the content says,
              what supports it, and what still needs a closer look.
            </p>
            <div className="mini-claim">
              <div>
                <span className="mini-label">SAMPLE CLAIM</span>
                <span className="tag amber-tag">
                  Not independently verified
                </span>
              </div>
              <h4>“Switching between demanding tasks carries a cost.”</h4>
              <p>
                <span className="category-dot" />
                Factual assertion <span>·</span> Source excerpt available
              </p>
              <div className="mini-claim-footer">
                <ShieldCheck size={16} />
                <span>A claim is a starting point. Evidence comes next.</span>
                <ChevronRight size={15} />
              </div>
            </div>
            <Link className="feature-link" href="/analyze?demo=1">
              Explore Claim Compass
              <ArrowUpRight size={16} />
            </Link>
          </article>
          <article className="feature-card reflection-feature">
            <div className="feature-heading">
              <span className="feature-icon">
                <MessageCircle size={21} />
              </span>
              <span className="eyebrow">02 / REFLECT</span>
            </div>
            <h3>Let the idea talk back.</h3>
            <p>
              Three thoughtful questions. Your own words. A little space to
              discover what you really took away.
            </p>
            <div className="mini-reflection">
              <span>
                01 <span>/ 03</span>
                <span className="mini-label">UNDERSTANDING</span>
              </span>
              <h4>
                How would you explain this idea
                <br />
                to a curious friend?
              </h4>
              <div className="mini-answer">
                Start with what you think…
                <span />
              </div>
              <div className="mini-dots">
                <i />
                <i />
                <i />
                <ArrowRight size={16} />
              </div>
            </div>
            <Link className="feature-link" href="/analyze?demo=1">
              Meet the Reflection Loop
              <ArrowUpRight size={16} />
            </Link>
          </article>
          <article className="feature-card focus-feature">
            <div className="feature-heading">
              <span className="feature-icon">
                <Focus size={21} />
              </span>
              <span className="eyebrow">03 / SLOW DOWN</span>
            </div>
            <h3>A little room to think.</h3>
            <p>
              Step into Focus Reading View. Just you, the ideas, and a reading
              experience that feels like your own.
            </p>
            <div className="mini-reader">
              <div>
                <span />
                <span />
                <span />
                <Focus size={13} />
              </div>
              <span className="mini-label">A MOMENT OF CLARITY</span>
              <h4>
                The quiet power
                <br />
                of doing one thing.
              </h4>
              <p>
                Understanding begins when we give an idea enough room to unfold.
              </p>
              <i />
              <i />
              <i />
            </div>
            <Link className="feature-link" href="/analyze?demo=1">
              Find your focus
              <ArrowUpRight size={16} />
            </Link>
          </article>
          <article className="feature-card receipt-feature">
            <div className="feature-heading">
              <span className="feature-icon">
                <ScanLine size={21} />
              </span>
              <span className="eyebrow">04 / TAKE SOMETHING WITH YOU</span>
            </div>
            <h3>Your attention, accounted for.</h3>
            <p>
              An honest receipt of the ideas you explored, the questions you
              asked, and the insight you want to keep.
            </p>
            <div className="receipt-preview">
              <span className="receipt-star">✳</span>
              <div>
                <span className="eyebrow">YOUR ATTENTION RECEIPT</span>
                <p>One idea worth remembering.</p>
              </div>
              <Check size={19} />
            </div>
            <Link className="feature-link" href="/analyze?demo=1">
              See an Attention Receipt
              <ArrowUpRight size={16} />
            </Link>
          </article>
          <article className="feature-card library-feature">
            <div className="feature-heading">
              <span className="feature-icon">
                <BookOpen size={21} />
              </span>
              <span className="eyebrow">05 / CONNECT THE DOTS</span>
            </div>
            <h3>A home for your discoveries.</h3>
            <p>
              Keep the ideas that stay with you. Build a private knowledge
              library, one thoughtful moment at a time.
            </p>
            <div className="book-spines" aria-hidden="true">
              <span>IDEAS</span>
              <span>PERSPECTIVES</span>
              <span>THE BIG QUESTIONS</span>
              <span>YOUR NEXT CHAPTER</span>
            </div>
            <Link className="feature-link" href="/library">
              Open your knowledge library
              <ArrowUpRight size={16} />
            </Link>
          </article>
        </div>
      </section>
      <section id="how-it-works" className="how-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A MORE INTENTIONAL LOOP</p>
            <h2>
              Less friction.
              <br />
              <em>More perspective.</em>
            </h2>
          </div>
          <p>
            Bring something that made you curious.
            <br />
            Leave with something that made you think.
          </p>
        </div>
        <div className="how-grid">
          {[
            {
              icon: BookOpen,
              title: "Add content",
              text: "An article, an essay, a transcript. Start with an idea you want to explore.",
            },
            {
              icon: Sparkles,
              title: "Understand",
              text: "Find the main argument, key ideas, and the context that makes them matter.",
            },
            {
              icon: Compass,
              title: "Challenge",
              text: "Examine the claims. Ask what is missing. Make room for another perspective.",
            },
            {
              icon: Lightbulb,
              title: "Remember",
              text: "Put it in your own words and take one meaningful next step.",
            },
          ].map((item, i) => (
            <article key={item.title}>
              <span className="how-number">0{i + 1}</span>
              <item.icon size={24} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              {i < 3 && <ArrowRight className="how-arrow" size={18} />}
            </article>
          ))}
        </div>
      </section>
      <section className="trust-section">
        <ShieldCheck size={23} />
        <div>
          <h3>Clarity includes knowing what we don’t know.</h3>
          <p>
            AI can make mistakes. We show uncertainty, keep unverified claims
            visible, and leave the final judgment with you.
          </p>
        </div>
        <Link href="/about">
          Our approach
          <ArrowUpRight size={16} />
        </Link>
      </section>
      <section className="final-cta">
        <span className="cta-mark">
          <LensMark />
        </span>
        <p className="eyebrow">THINK BEYOND THE SCROLL.</p>
        <h2>
          Consume less mindlessly.
          <br />
          <em>Understand more deeply.</em>
        </h2>
        <Button asChild>
          <Link href="/analyze">
            Begin your learning journey
            <ArrowUpRight size={17} />
          </Link>
        </Button>
        <p>No endless feed. Just your next good question.</p>
      </section>
    </>
  );
}
