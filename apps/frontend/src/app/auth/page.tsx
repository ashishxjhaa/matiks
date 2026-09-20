"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordField } from "@/components/ui/password-field";
import { PageLoader } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";

type Mode = "login" | "register";

export default function AuthPage() {
  const { user, loading, login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="atmosphere flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 md:px-8">
        <Logo />
        <Link
          href="/"
          className="text-[13px] text-muted transition-colors hover:text-foreground"
        >
          Back
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center px-6 pb-20">
        <div>
          <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.03em]">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            {mode === "login"
              ? "Continue to your arena and find a match."
              : "Set up credentials to join live duels."}
          </p>
        </div>

        <div
          role="tablist"
          className="mt-8 flex gap-1 rounded-panel bg-surface p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 rounded-control px-3 py-2.5 text-[13px] font-medium transition-colors ${
              mode === "login"
                ? "bg-accent text-black"
                : "text-muted hover:text-foreground"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 rounded-control px-3 py-2.5 text-[13px] font-medium transition-colors ${
              mode === "register"
                ? "bg-accent text-black"
                : "text-muted hover:text-foreground"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
          <Field
            label="Email"
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
          />
          <PasswordField
            name="password"
            required
            minLength={3}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 3 characters"
          />

          {error && (
            <p
              className="rounded-control border border-danger/20 bg-danger/5 px-3 py-2.5 text-[13px] text-danger"
              role="alert"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            size="lg"
            className="mt-1 w-full"
          >
            {submitting
              ? "Working…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </Button>
        </form>

        <p className="mt-8 text-center text-[13px] text-muted">
          {mode === "login" ? (
            <>
              No account?{" "}
              <button
                type="button"
                className="text-foreground underline-offset-4 hover:underline"
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already registered?{" "}
              <button
                type="button"
                className="text-foreground underline-offset-4 hover:underline"
                onClick={() => setMode("login")}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </main>
    </div>
  );
}
