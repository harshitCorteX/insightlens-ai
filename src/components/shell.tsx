"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  ChartNoAxesCombined,
  Menu,
  Plus,
  Settings2,
  Sparkles,
  X,
  Compass,
  LogOut,
} from "lucide-react";
import { Brand } from "./brand";
import { ThemeControl } from "./theme-control";
import { Button } from "./ui/button";
import { useApp } from "./providers";
import { api } from "@/lib/utils";
import { clearSessions } from "@/lib/session";
const navigation = [
  { href: "/analyze", label: "Analyze content", icon: Compass },
  { href: "/dashboard", label: "Your overview", icon: ChartNoAxesCombined },
  { href: "/library", label: "Knowledge library", icon: BookOpen },
  { href: "/settings", label: "Preferences", icon: Settings2 },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const { user, refreshUser } = useApp();
  const [message, setMessage] = useState("");
  const workspace = [
    "/analyze",
    "/analysis/",
    "/dashboard",
    "/library",
    "/settings",
  ].some((p) => path.startsWith(p));
  const focusable = path.startsWith("/analysis/");
  return (
    <div
      className={`site-shell ${workspace ? "workspace-shell" : ""} ${focusable ? "analysis-shell" : ""}`}
    >
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="main-header">
        <Brand />
        {!workspace && (
          <nav className="desktop-nav" aria-label="Main navigation">
            <Link href="/#product">Product</Link>
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/#features">Features</Link>
          </nav>
        )}
        <div className="header-actions">
          <ThemeControl />
          {user ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/library">My library</Link>
            </Button>
          ) : (
            <Link className="signin-link" href="/login">
              Sign in
            </Link>
          )}
          <Button asChild size="sm">
            <Link href="/analyze">
              {workspace ? "New analysis" : "Get started"}
              <ArrowUpRight size={15} />
            </Link>
          </Button>
          <button
            className="mobile-toggle"
            onClick={() => setMobile(!mobile)}
            aria-label={mobile ? "Close navigation" : "Open navigation"}
            aria-expanded={mobile}
          >
            {mobile ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {mobile && (
        <nav className="mobile-navigation" aria-label="Mobile navigation">
          {(workspace
            ? navigation
            : [
                { href: "/#product", label: "Product" },
                { href: "/#how-it-works", label: "How it works" },
                { href: "/#features", label: "Features" },
                { href: "/library", label: "Knowledge library" },
              ]
          ).map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setMobile(false)}>
              {n.label}
            </Link>
          ))}
          <Link href="/settings" onClick={() => setMobile(false)}>
            Preferences
          </Link>
          <Link href="/login" onClick={() => setMobile(false)}>
            Sign in
          </Link>
          <ThemeControl full />
        </nav>
      )}
      {workspace && (
        <aside className="sidebar">
          <div>
            <p className="eyebrow sidebar-caption">YOUR THINKING SPACE</p>
            <nav aria-label="Workspace">
              {navigation.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={
                    path === href ||
                    (href === "/analyze" && path.startsWith("/analysis/"))
                      ? "active"
                      : ""
                  }
                >
                  <Icon size={18} />
                  {label}
                  {href === "/analyze" && (
                    <Plus size={14} className="nav-plus" />
                  )}
                </Link>
              ))}
            </nav>
          </div>
          <div className="sidebar-bottom">
            <div className="sidebar-note">
              <Sparkles size={21} />
              <p>
                A little curiosity.
                <br />
                <strong>A deeper perspective.</strong>
              </p>
              <Link href="/analyze?demo=1">
                Explore a sample <ArrowUpRight size={14} />
              </Link>
            </div>
            <p className="sidebar-user">
              {user ? user.email : "Your space to think freely"}
            </p>
            {user ? (
              <button
                className="text-button"
                onClick={async () => {
                  try {
                    await api("/api/auth", {
                      method: "POST",
                      body: JSON.stringify({ action: "logout" }),
                    });
                    clearSessions();
                    await refreshUser();
                    router.push("/analyze");
                  } catch (e) {
                    setMessage((e as Error).message);
                  }
                }}
              >
                <LogOut size={15} />
                Sign out
              </button>
            ) : (
              <Link className="text-button" href="/signup">
                Create a free account <ArrowUpRight size={14} />
              </Link>
            )}
            {message && (
              <p role="alert" className="error-text">
                {message}
              </p>
            )}
            <div className="sidebar-legal">
              <Link href="/privacy">Privacy</Link>
              <Link href="/about">About</Link>
            </div>
          </div>
        </aside>
      )}
      <main id="main-content" className={workspace ? "workspace-main" : ""}>
        {children}
      </main>
      {!workspace && (
        <footer className="footer">
          <div>
            <Brand />
            <p>Think Beyond the Scroll.</p>
          </div>
          <nav aria-label="Footer">
            <Link href="/analyze">Start analyzing</Link>
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
          <span>Made for curious minds.</span>
        </footer>
      )}
    </div>
  );
}
