"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Download,
  LoaderCircle,
  LogOut,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useApp } from "./providers";
import { ThemeControl } from "./theme-control";
import { ReadingSettings } from "./reading-settings";
import { Button } from "./ui/button";
import { Modal } from "./ui/dialog";
import { depths, styles, preferencesSchema } from "@/lib/schema";
import { api, downloadMarkdown } from "@/lib/utils";
import { clearSessions } from "@/lib/session";
const interests = [
  "Technology",
  "Science",
  "Business",
  "History",
  "Philosophy",
  "Psychology",
  "Economics",
  "Creativity",
  "Personal development",
  "General knowledge",
];
export function Settings() {
  const { preferences: p, update, user, refreshUser } = useApp();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [deletion, setDeletion] = useState<"data" | "account" | null>(null);
  async function sync(load = false) {
    setBusy(true);
    setMessage("");
    try {
      if (load) {
        const result = preferencesSchema.safeParse(
          await api("/api/preferences"),
        );
        if (result.success) {
          update(result.data);
          setMessage(
            "Your account preferences are now applied to this browser.",
          );
        } else
          setMessage(
            "No saved account preferences yet. Save these preferences first.",
          );
      } else {
        await api("/api/preferences", {
          method: "PUT",
          body: JSON.stringify(p),
        });
        setMessage(
          "Preferences saved to your account. Appearance mode is stored on this browser.",
        );
      }
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    try {
      await api(deletion === "account" ? "/api/account" : "/api/account/data", {
        method: "DELETE",
      });
      clearSessions();
      if (deletion === "account") await refreshUser();
      setMessage(
        deletion === "account"
          ? "Your account and saved data have been deleted."
          : "All saved analyses and reflections have been deleted.",
      );
      setDeletion(null);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page-container settings-page">
      <div className="page-breadcrumb">
        Your workspace <span>/</span> Preferences
      </div>
      <div className="page-heading">
        <p className="eyebrow">MAKE THIS SPACE YOUR OWN</p>
        <h1>A little more you.</h1>
        <p>
          Small adjustments for the way you like to read, reflect, and explore.
        </p>
      </div>
      <section className="settings-section">
        <div className="settings-section-title">
          <Palette size={19} />
          <div>
            <h2>Appearance</h2>
            <p>A comfortable setting for your next good idea.</p>
          </div>
        </div>
        <div className="settings-row">
          <div>
            <h3>Choose your atmosphere</h3>
            <p>System follows your device’s appearance.</p>
          </div>
          <ThemeControl full />
        </div>
        <div className="settings-row accent-row">
          <div>
            <h3>A thoughtful accent</h3>
            <p>A subtle color to make this space feel like yours.</p>
          </div>
          <div className="accent-picker" role="group" aria-label="Accent color">
            {(
              [
                ["violet", "Insight Violet"],
                ["forest", "Forest Green"],
                ["ocean", "Ocean Blue"],
                ["amber", "Warm Amber"],
              ] as const
            ).map(([value, name]) => (
              <button
                key={value}
                title={name}
                aria-label={name}
                aria-pressed={p.accent === value}
                className={`accent-${value}`}
                onClick={() => update({ accent: value })}
              >
                {p.accent === value && <Check size={13} />}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="settings-section">
        <div className="settings-section-title">
          <SlidersHorizontal size={19} />
          <div>
            <h2>Learning preferences</h2>
            <p>The same standard of evidence. A different way of exploring.</p>
          </div>
        </div>
        <div className="settings-select-grid">
          <label>
            Explanation depth
            <select
              value={p.depth}
              onChange={(e) =>
                update({ depth: e.target.value as typeof p.depth })
              }
            >
              {depths.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label>
            Reflection style
            <select
              value={p.reflectionStyle}
              onChange={(e) =>
                update({
                  reflectionStyle: e.target.value as typeof p.reflectionStyle,
                })
              }
            >
              {styles.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="interest-setting">
          <h3>What sparks your curiosity?</h3>
          <p>
            Your interests can inspire the next step. There’s always room for an
            unfamiliar idea.
          </p>
          <div role="group" aria-label="Learning interests">
            {interests.map((interest) => (
              <button
                key={interest}
                aria-pressed={p.interests.includes(interest)}
                onClick={() =>
                  update({
                    interests: p.interests.includes(interest)
                      ? p.interests.filter((i) => i !== interest)
                      : [...p.interests, interest],
                  })
                }
              >
                {p.interests.includes(interest) && <Check size={12} />}{" "}
                {interest}
              </button>
            ))}
          </div>
        </div>
        <div className="settings-row">
          <div>
            <h3>Language</h3>
            <p>English is available in this release.</p>
          </div>
          <span className="tag violet-tag">English</span>
        </div>
      </section>
      <section className="settings-section">
        <div className="settings-section-title">
          <SlidersHorizontal size={19} />
          <div>
            <h2>Your reading rhythm</h2>
            <p>Used in Focus Reading View. Saved on this browser.</p>
          </div>
        </div>
        <ReadingSettings />
      </section>
      <section className="settings-section">
        <div className="settings-section-title">
          <ShieldCheck size={19} />
          <div>
            <h2>Your data. Your choice.</h2>
            <p>Nothing is added to your library until you choose to save it.</p>
          </div>
        </div>
        {user ? (
          <>
            <p className="signed-in-as">
              Signed in as <strong>{user.email}</strong>
            </p>
            <div className="settings-account-buttons">
              <Button variant="outline" disabled={busy} onClick={() => sync()}>
                {busy && <LoaderCircle size={14} className="spin" />}Save
                preferences to account
              </Button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => sync(true)}
              >
                Load saved preferences
              </Button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={async () => {
                  try {
                    await api("/api/auth", {
                      method: "POST",
                      body: JSON.stringify({ action: "logout" }),
                    });
                    clearSessions();
                    await refreshUser();
                    setMessage("You’re signed out.");
                  } catch (e) {
                    setMessage((e as Error).message);
                  }
                }}
              >
                <LogOut size={14} />
                Sign out
              </Button>
            </div>
            <div className="settings-row">
              <div>
                <h3>Delete all saved analyses</h3>
                <p>Permanently remove your analyses and reflection answers.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletion("data")}
              >
                <Trash2 size={14} />
                Delete data
              </Button>
            </div>
            <div className="settings-row">
              <div>
                <h3>Delete your account</h3>
                <p>
                  Remove your account, saved content, and account preferences.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletion("account")}
              >
                Delete account
              </Button>
            </div>
          </>
        ) : (
          <div className="settings-row">
            <div>
              <h3>A private home for your discoveries</h3>
              <p>
                Your guest preferences already work. Sign in to save analyses
                and sync learning preferences.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/login">
                Sign in
                <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        )}
        <p className="settings-privacy-note">
          Guest analyses stay in session storage in the current tab. Reading
          preferences stay in local storage. Export individual analyses as
          Markdown from their Attention Receipt.{" "}
          <Link href="/privacy">Read our privacy disclosures.</Link>
        </p>
      </section>
      {message && (
        <p className="inline-message" role="status">
          {message}
        </p>
      )}
      <Modal
        open={!!deletion}
        onOpenChange={(v) => {
          if (!v && !busy) setDeletion(null);
        }}
        title={
          deletion === "account"
            ? "Delete your account?"
            : "Delete your saved analyses?"
        }
        description="This action is permanent. Export any analyses you want to keep from your library before continuing."
      >
        <div className="dialog-actions">
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => setDeletion(null)}
          >
            Keep my data
          </Button>
          <Button variant="danger" disabled={busy} onClick={remove}>
            {busy ? "Deleting…" : "Permanently delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
