"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  LoaderCircle,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { LensMark } from "./brand";
import { useApp } from "./providers";
import { api, safeNext } from "@/lib/utils";
export function AuthForm({ signup = false }: { signup?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const { refreshUser } = useApp();
  const { register, handleSubmit } = useForm<{
    email: string;
    password: string;
  }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const next = safeNext(params.get("next"));
  async function submit(values: { email: string; password: string }) {
    setBusy(true);
    setError("");
    try {
      const data = await api<{ confirmEmail: boolean }>("/api/auth", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          action: signup ? "signup" : "login",
        }),
      });
      if (data.confirmEmail) setConfirmation(true);
      else {
        await refreshUser();
        router.push(next);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <section className="auth-intro">
        <span className="auth-mark">
          <LensMark />
        </span>
        <p className="eyebrow">YOUR PERSONAL THINKING SPACE</p>
        <h1>
          A home for
          <br />
          your <em>curiosity.</em>
        </h1>
        <p>
          Keep the ideas that changed your perspective.
          <br />
          Return to the questions that stayed with you.
        </p>
        <div>
          <span>
            <Check size={15} />A private knowledge library
          </span>
          <span>
            <Check size={15} />
            Your reflections, preserved
          </span>
          <span>
            <Check size={15} />
            Your own pace. Always.
          </span>
        </div>
        <span className="auth-caption">THINK BEYOND THE SCROLL.</span>
      </section>
      <section className="auth-form-card">
        {confirmation ? (
          <>
            <span className="feature-icon">
              <Check size={22} />
            </span>
            <h2>Check your inbox.</h2>
            <p>
              Confirm your email using the account confirmation link, then sign
              in. Your guest analysis stays in this tab while you do.
            </p>
            <Button asChild>
              <Link href={`/login?next=${encodeURIComponent(next)}`}>
                Continue to sign in
                <ArrowRight size={15} />
              </Link>
            </Button>
          </>
        ) : (
          <>
            <span className="eyebrow">
              {signup ? "MAKE ROOM FOR WHAT MATTERS" : "GOOD TO SEE YOU AGAIN"}
            </span>
            <h2>{signup ? "Begin your next chapter." : "Welcome back."}</h2>
            <p>
              {signup
                ? "Create your personal space for ideas worth keeping."
                : "A few good ideas are waiting for you."}
            </p>
            <form onSubmit={handleSubmit(submit)}>
              <label>
                Email address
                <input
                  type="email"
                  {...register("email", { required: true })}
                  autoComplete="email"
                  placeholder="you@example.com"
                  maxLength={254}
                  required
                  disabled={busy}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  {...register("password", { required: true, minLength: 8 })}
                  autoComplete={signup ? "new-password" : "current-password"}
                  placeholder="At least 8 characters"
                  minLength={8}
                  maxLength={128}
                  required
                  disabled={busy}
                />
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              {params.get("error") === "confirmation" && (
                <p className="form-error" role="alert">
                  That confirmation link couldn't be completed. Try signing in
                  after confirming your email, or request a new account
                  confirmation.
                </p>
              )}
              <Button type="submit" disabled={busy}>
                {busy ? (
                  <LoaderCircle className="spin" size={16} />
                ) : (
                  <ArrowRight size={16} />
                )}{" "}
                {signup ? "Create account" : "Sign in"}
              </Button>
            </form>
            <p className="auth-alternate">
              {signup ? "Already have a thinking space?" : "New here?"}{" "}
              <Link
                href={`${signup ? "/login" : "/signup"}?next=${encodeURIComponent(next)}`}
              >
                {signup ? "Sign in" : "Create an account"}
              </Link>
            </p>
            <div className="auth-divider">
              <span />
              OR KEEP EXPLORING
              <span />
            </div>
            <Link href="/analyze" className="auth-guest">
              <Sparkles size={15} />
              Continue without an account
              <ArrowRight size={14} />
            </Link>
            <p className="auth-privacy">
              <LockKeyhole size={12} />
              By continuing, you agree to our <Link href="/terms">
                Terms
              </Link>{" "}
              and <Link href="/privacy">Privacy policy</Link>.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
