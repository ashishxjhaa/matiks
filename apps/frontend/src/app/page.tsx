"use client";

import { Logo } from "@/components/logo";
import { LinkButton } from "@/components/ui/link-button";
import { useAuth } from "@/lib/auth-context";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create your account",
    body: "Sign up in seconds. Your profile stays ready for the next duel.",
  },
  {
    step: "02",
    title: "Queue for a match",
    body: "Hit find match and join the live pool of players online right now.",
  },
  {
    step: "03",
    title: "Solve under pressure",
    body: "Questions arrive in real time. Correct answers advance you. Wrong ones keep you still.",
  },
];

const OPERATIONS = [
  { glyph: "+", label: "Addition" },
  { glyph: "−", label: "Subtraction" },
  { glyph: "×", label: "Multiplication" },
  { glyph: "÷", label: "Division" },
];

export default function LandingPage() {
  const { user } = useAuth();
  const playHref = user ? "/dashboard" : "/auth";

  return (
    <div className="atmosphere flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 md:px-8">
        <Logo />
        <nav className="flex items-center gap-3">
          {!user && (
            <LinkButton href="/auth" variant="ghost" size="sm">
              Sign in
            </LinkButton>
          )}
          <LinkButton href={playHref} size="sm">
            {user ? "Dashboard" : "Play"}
          </LinkButton>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-6xl flex-col justify-center px-6 pb-24 pt-10 md:px-8 md:pt-6">
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-0 hidden -translate-y-1/2 select-none font-display text-[clamp(10rem,22vw,18rem)] leading-none font-bold tracking-[-0.07em] text-white/[0.12] md:block"
          >
            24
          </div>

          <div className="relative z-10">
            <p
              className="animate-hero-rise text-[12px] font-medium tracking-[0.14em] text-accent uppercase"
              style={{ animationDelay: "0ms" }}
            >
              Mental math duels
            </p>

            <h1
              className="animate-hero-rise mt-5 max-w-[14ch] font-display text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.98] font-bold tracking-[-0.045em] text-foreground"
              style={{ animationDelay: "70ms" }}
            >
              Turn screen time into{" "}
              <span className="text-accent">smart time</span>
            </h1>

            <p
              className="animate-hero-rise mt-6 max-w-md text-[16px] leading-relaxed text-muted-strong"
              style={{ animationDelay: "140ms" }}
            >
              Real-time 1v1 arithmetic against live opponents. Speed, accuracy,
              and composure under pressure.
            </p>

            <div
              className="animate-hero-rise mt-10 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "210ms" }}
            >
              <LinkButton href={playHref} size="lg">
                Play in browser
              </LinkButton>
              {!user && (
                <LinkButton href="/auth" variant="secondary" size="lg">
                  Create account
                </LinkButton>
              )}
            </div>
          </div>
        </section>

        <div className="hairline w-full" />

        {/* Philosophy + mode */}
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:gap-16 md:px-8">
          <div>
            <p className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
              Philosophy
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] md:text-[2.25rem]">
              Thinking is a sport
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
              Face real opponents, react in real time, and improve with every
              match, not passive drills.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
              Mode
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] md:text-[2.25rem]">
              1v1 Math Duel
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
              Addition, subtraction, multiplication, and division. Answer
              correctly to advance. Hesitation costs you the match.
            </p>
          </div>
        </section>

        <div className="hairline w-full" />

        {/* How it works */}
        <section className="mx-auto w-full max-w-6xl px-6 py-20 md:px-8">
          <p className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
            How it works
          </p>
          <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold tracking-[-0.03em] md:text-[2.25rem]">
            From login to duel in three steps
          </h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {HOW_IT_WORKS.map((item) => (
              <li key={item.step}>
                <span className="font-display text-[13px] font-semibold tracking-[0.08em] text-accent">
                  {item.step}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.02em]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <div className="hairline w-full" />

        {/* Momentum */}
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-16 md:px-8">
          <div>
            <p className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
              Momentum
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] md:text-[2.25rem]">
              Streaks reflect consistency
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
              Show up, compete, improve. Matiks rewards rhythm, not nagging
              reminders. Every session sharpens speed and accuracy.
            </p>
          </div>
          <div className="material-card bg-surface/80 p-6 md:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] tracking-[0.1em] text-muted uppercase">
                  Focus
                </p>
                <p className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em] text-accent">
                  Live
                </p>
              </div>
              <p className="max-w-[12rem] text-right text-[13px] leading-relaxed text-muted">
                Real opponents. Real-time questions. No solitary flashcards.
              </p>
            </div>
            <div className="mt-8 h-px w-full bg-border" />
            <div className="mt-6 grid grid-cols-3 gap-4">
              {["Speed", "Accuracy", "Composure"].map((label) => (
                <div key={label}>
                  <p className="text-[11px] text-muted">{label}</p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
                    <div className="h-full w-3/4 rounded-full bg-accent/80" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="hairline w-full" />

        {/* Operations */}
        <section className="mx-auto w-full max-w-6xl px-6 py-20 md:px-8">
          <p className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
            Operations
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] md:text-[2.25rem]">
            Four skills. One arena.
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
            Every duel mixes the core four. Stay sharp across the board, not
            just the operations you like.
          </p>
          <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {OPERATIONS.map((op) => (
              <li
                key={op.label}
                className="material-card flex flex-col items-start gap-3 bg-surface/70 px-5 py-6"
              >
                <span className="font-display text-3xl font-semibold text-accent">
                  {op.glyph}
                </span>
                <span className="text-[13px] font-medium tracking-[-0.01em]">
                  {op.label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="hairline w-full" />

        {/* Why live */}
        <section className="mx-auto w-full max-w-6xl px-6 py-20 md:px-8">
          <p className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
            Why live
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-[-0.03em] md:text-[2.25rem]">
            Practice alone builds skill. Duels build instinct.
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Realtime pressure",
                body: "An opponent on the other side forces cleaner, faster decisions.",
              },
              {
                title: "Instant feedback",
                body: "Correct answers unlock the next question. Mistakes keep you honest.",
              },
              {
                title: "Browser-native",
                body: "No install. Open a tab, sign in, and queue for a match.",
              },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="font-display text-lg font-semibold tracking-[-0.02em]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="hairline w-full" />

        {/* Final CTA */}
        <section className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-8 px-6 py-16 md:flex-row md:items-center md:px-8">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
              Ready when you are
            </h2>
            <p className="mt-2 text-[15px] text-muted">
              Match with someone online in seconds.
            </p>
          </div>
          <LinkButton href={playHref} size="lg">
            Enter arena
          </LinkButton>
        </section>

        <footer className="border-t border-border px-6 py-6 md:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between text-[12px] text-muted">
            <span>© 2026 Matiks</span>
            <span className="tracking-wide">Mental math, live.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
