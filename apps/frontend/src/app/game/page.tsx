"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PageLoader, Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";
import { useWs } from "@/lib/ws-context";
import {
  operationGlyph,
  type GamePlayerResult,
  type Question,
} from "@/lib/types";

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function sanitizeAnswerInput(value: string) {
  const normalized = value.replace(/,/g, ".");
  let out = "";
  let seenDot = false;
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (ch === "-" && out.length === 0) {
      out = "-";
      continue;
    }
    if (ch >= "0" && ch <= "9") {
      out += ch;
      continue;
    }
    if (ch === "." && !seenDot) {
      out += ".";
      seenDot = true;
    }
  }
  return out.slice(0, 12);
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2d2d2d] text-[11px] font-bold tracking-wide uppercase">
      {initials(name)}
    </span>
  );
}

function ScorePip({ value }: { value: number }) {
  return (
    <span className="absolute -bottom-1.5 left-1/2 flex h-[18px] min-w-[18px] -translate-x-1/2 items-center justify-center rounded-full border border-white/15 bg-[#1a1a1a] px-1 text-[10px] font-semibold text-white">
      {value}
    </span>
  );
}

function PlayerChip({
  name,
  rating,
  score,
  align,
}: {
  name: string;
  rating: number | string;
  score: number;
  align: "left" | "right";
}) {
  const text = (
    <div className={align === "left" ? "min-w-0 text-left" : "min-w-0 text-right"}>
      <p className="max-w-[72px] truncate text-[12px] font-medium leading-tight">
        {name}
      </p>
      <p className="tabular text-[11px] leading-tight text-[#3ECFFF]">{rating}</p>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      {align === "right" && text}
      <div className="relative">
        <Avatar name={name} />
        <ScorePip value={score} />
      </div>
      {align === "left" && text}
    </div>
  );
}

function SearchingView({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#111] text-white">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="relative flex h-[260px] w-[260px] items-center justify-center">
          <div className="game-grid pointer-events-none absolute inset-0" />
          <p className="absolute top-5 z-10 text-[10px] font-medium tracking-[0.16em] text-[#8a8a8a] uppercase">
            Searching for opponent
          </p>
          <span className="radar-ring" style={{ animationDelay: "0s" }} />
          <span className="radar-ring" style={{ animationDelay: "0.8s" }} />
          <span className="radar-ring" style={{ animationDelay: "1.6s" }} />
          <Image
            src="/matiks-logo.svg"
            alt="Matiks"
            width={52}
            height={52}
            className="relative z-10 h-[52px] w-[52px] rounded-[14px]"
            priority
          />
        </div>
      </div>
      <div className="flex justify-center pb-16">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/12 bg-[#1c1c1c] px-4 py-2 text-[13px] font-medium text-[#cfcfcf] hover:bg-[#242424]"
        >
          Cancel Search
        </button>
      </div>
    </div>
  );
}

function PlayView({
  question,
  playerName,
  playerRating,
  myScore,
  opponent,
  secondsLeft,
  onSubmitAnswer,
  onCorrect,
  onLeave,
}: {
  question: Question;
  playerName: string;
  playerRating: number;
  myScore: number;
  opponent: string;
  secondsLeft: number;
  onSubmitAnswer: (answer: number) => void;
  onCorrect: () => void;
  onLeave: () => void;
}) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"none" | "correct" | "wrong">("none");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function commit(raw: string) {
    const trimmed = raw.trim();
    if (
      trimmed === "" ||
      trimmed === "-" ||
      trimmed === "." ||
      trimmed === "-." ||
      feedback === "correct"
    ) {
      return;
    }
    const numeric = Number(trimmed.replace(/,/g, "."));
    if (Number.isNaN(numeric)) {
      setFeedback("wrong");
      return;
    }
    onSubmitAnswer(numeric);
    if (Math.abs(numeric - question.answer) < 1e-6) {
      setFeedback("correct");
      onCorrect();
    } else {
      setFeedback("wrong");
      setAnswer("");
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    commit(answer);
  }

  const clock = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return (
    <div className="relative flex min-h-screen flex-col bg-[#111] text-white">
      <button
        type="button"
        onClick={onLeave}
        className="absolute top-5 right-6 z-20 text-[12px] text-[#6a6a6a] hover:text-white"
      >
        Leave
      </button>

      <header className="flex items-start justify-center pt-8">
        <div className="flex items-center gap-10">
          <PlayerChip
            name={playerName}
            rating={playerRating}
            score={myScore}
            align="left"
          />
          <span className="tabular pt-1 text-[15px] font-semibold text-[#3ECFFF]">
            {clock}
          </span>
          <PlayerChip
            name={opponent}
            rating="—"
            score={0}
            align="right"
          />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="relative flex h-[280px] w-[280px] items-center justify-center">
          <div className="game-grid pointer-events-none absolute inset-0" />
          <div
            className={`relative z-10 tabular text-[32px] leading-[1.15] font-medium tracking-[-0.02em] ${
              feedback === "correct"
                ? "text-accent"
                : feedback === "wrong"
                  ? "animate-shake text-danger"
                  : "text-white"
            }`}
          >
            <p className="text-center">{question.number1}</p>
            <p className="mt-0.5 flex items-center justify-center gap-1.5">
              <span className="text-[22px] text-[#cfcfcf]">
                {operationGlyph(question.operation)}
              </span>
              <span>{question.number2}</span>
            </p>
          </div>
        </div>
      </main>

      <form onSubmit={onSubmit} className="flex flex-col items-center pb-14">
        <p className="mb-2 text-[9px] font-medium tracking-[0.16em] text-[#6a6a6a] uppercase">
          Type out your answer
        </p>
        <div
          className={`relative flex h-11 w-[220px] items-center justify-center rounded-xl bg-[#2a2a2a] ${
            feedback === "wrong"
              ? "animate-shake ring-1 ring-danger"
              : feedback === "correct"
                ? "ring-1 ring-accent"
                : ""
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={answer}
            onChange={(e) => {
              const next = sanitizeAnswerInput(e.target.value);
              setAnswer(next);
              if (feedback !== "none") setFeedback("none");
            }}
            className="tabular h-full w-full bg-transparent text-center text-[18px] font-medium text-white outline-none"
            aria-label="Answer"
            autoFocus
          />
          {answer === "" && (
            <span
              aria-hidden
              className="answer-caret pointer-events-none absolute h-5 w-px bg-white"
            />
          )}
        </div>
      </form>
    </div>
  );
}

function ActiveGame({
  question,
  playerName,
  playerRating,
  opponent,
  onSubmitAnswer,
  onLeave,
}: {
  question: Question;
  playerName: string;
  playerRating: number;
  opponent: string;
  onSubmitAnswer: (answer: number) => void;
  onLeave: () => void;
}) {
  const [myScore, setMyScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <PlayView
      key={question.id}
      question={question}
      playerName={playerName}
      playerRating={playerRating}
      myScore={myScore}
      opponent={opponent}
      secondsLeft={secondsLeft}
      onSubmitAnswer={onSubmitAnswer}
      onCorrect={() => setMyScore((n) => n + 1)}
      onLeave={onLeave}
    />
  );
}

function FlameMark() {
  return (
    <svg width="56" height="62" viewBox="0 0 56 62" fill="none" aria-hidden>
      <path
        d="M28 2c4 10 2 16-3 22 8 0 14 6 14 16 0 12-10 20-19 20S2 52 2 40c0-10 6-16 12-20-1 6 2 11 6 13C16 18 22 10 28 2Z"
        fill="#FF8A1A"
      />
      <path
        d="M28 14c3 7 1 12-2 16 6 0 10 4 10 12 0 9-7 14-13 14s-11-5-11-14c0-7 4-11 8-14 0 5 2 8 5 9 0-10 3-16 8-23Z"
        fill="#FFE14A"
      />
    </svg>
  );
}

function ResultModal({
  me,
  opponent,
  onBack,
  onRematch,
  onNewSprint,
}: {
  me: GamePlayerResult;
  opponent: GamePlayerResult | null;
  onBack: () => void;
  onRematch: () => void;
  onNewSprint: () => void;
}) {
  const oppScore = opponent?.score ?? 0;
  const outcome =
    me.score > oppScore ? "win" : me.score < oppScore ? "lose" : "draw";
  const title =
    outcome === "win" ? "YOU WIN" : outcome === "lose" ? "YOU LOSE" : "DRAW";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111] px-4">
      <div className="relative w-full max-w-[420px]">
        <div className="absolute -top-10 left-1/2 z-20 -translate-x-1/2">
          <FlameMark />
        </div>

        <div className="relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#161616] px-5 pt-8 pb-5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(rgba(177,250,99,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(177,250,99,0.07) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
              maskImage:
                "radial-gradient(ellipse 70% 55% at 50% 42%, black 20%, transparent 70%)",
            }}
          />

          <button
            type="button"
            onClick={onBack}
            className="absolute top-4 left-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#1c1c1c] text-white"
            aria-label="Back"
          >
            ‹
          </button>

          <div className="relative z-10 flex flex-col items-center pt-2">
            <span className="mb-2 h-1 w-8 rounded-full bg-accent" />
            <div className="relative">
              <h1
                className="font-display text-[42px] leading-none font-extrabold tracking-[0.04em]"
                style={{
                  color: "transparent",
                  WebkitTextStroke: "1.8px #B1FA63",
                }}
              >
                {title}
              </h1>
              <span className="absolute top-[18px] left-1/2 -translate-x-1/2 rounded-full bg-accent px-2 py-[2px] text-[8px] font-extrabold tracking-[0.12em] text-black uppercase">
                Sprint Duel
              </span>
            </div>

            <div className="mt-10 flex w-full items-start justify-center gap-10">
              <div className="flex min-w-[110px] flex-col items-center">
                <p
                  className={`tabular text-[52px] leading-none font-extrabold ${
                    outcome === "lose" ? "text-[#6a6a6a]" : "text-accent"
                  }`}
                >
                  {me.score}
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#1c1c1c] px-2.5 py-1.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2d2d2d] text-[8px] font-bold">
                    {initials(me.name)}
                  </span>
                  <div>
                    <p className="max-w-[88px] truncate text-[11px] font-semibold">
                      {me.name}
                    </p>
                    <p className="tabular text-[10px] text-[#8a8a8a]">
                      {me.rating}
                    </p>
                  </div>
                </div>
              </div>

              <span className="mt-6 text-[#4a4a4a]">–</span>

              <div className="flex min-w-[110px] flex-col items-center">
                <p
                  className={`tabular text-[52px] leading-none font-extrabold ${
                    outcome === "win" ? "text-[#6a6a6a]" : "text-accent"
                  }`}
                >
                  {oppScore}
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#1c1c1c] px-2.5 py-1.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2d2d2d] text-[8px] font-bold">
                    {initials(opponent?.name ?? "OP")}
                  </span>
                  <div>
                    <p className="max-w-[88px] truncate text-[11px] font-semibold">
                      {opponent?.name ?? "Opponent"}
                    </p>
                    <p className="tabular text-[10px] text-[#8a8a8a]">
                      {opponent?.rating ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-[#2a2a2a] px-3 py-1.5 text-[11px] text-[#9a9a9a]"
            >
              <span aria-hidden>☺</span>
              Send a Reaction
            </button>

            <div className="mt-5 grid w-full grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onRematch}
                className="h-11 rounded-full border-[1.5px] border-accent text-[12px] font-extrabold tracking-[0.08em] text-accent uppercase"
              >
                Rematch
              </button>
              <button
                type="button"
                onClick={onNewSprint}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-accent text-[12px] font-extrabold tracking-[0.06em] text-black uppercase"
              >
                <span aria-hidden>▶</span>
                New Math Sprint
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GamePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const {
    matchStatus,
    game,
    submitAnswer,
    resetMatchUi,
    opponentName,
    result,
    findMatch,
  } = useWs();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [loading, user, router]);

  useEffect(() => {
    if (
      !loading &&
      user &&
      matchStatus === "idle" &&
      !game.question &&
      !result
    ) {
      router.replace("/dashboard");
    }
  }, [loading, user, matchStatus, game.question, result, router]);

  function leave() {
    resetMatchUi();
    router.push("/dashboard");
  }

  if (loading || !user) return <PageLoader />;

  if (matchStatus === "finished" && result) {
    const me =
      result.find((p) => p.id === user.id) ??
      ({
        id: user.id,
        name: user.username,
        score: 0,
        rating: user.rating?.rating ?? 0,
      } satisfies GamePlayerResult);
    const opponent = result.find((p) => p.id !== user.id) ?? null;

    return (
      <ResultModal
        me={me}
        opponent={opponent}
        onBack={leave}
        onRematch={findMatch}
        onNewSprint={leave}
      />
    );
  }

  if (matchStatus === "searching" || (matchStatus === "playing" && !game.question)) {
    if (matchStatus === "playing" && !game.question) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#111]">
          <Spinner className="h-5 w-5" />
        </div>
      );
    }
    return <SearchingView onCancel={leave} />;
  }

  if (!game.question || !game.gameId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#111]">
        <Spinner className="h-5 w-5" />
        <button
          type="button"
          onClick={leave}
          className="text-[13px] text-[#8a8a8a] hover:text-white"
        >
          Leave
        </button>
      </div>
    );
  }

  return (
    <ActiveGame
      key={game.gameId}
      question={game.question}
      playerName={user.username}
      playerRating={user.rating?.rating ?? 0}
      opponent={opponentName ?? "Opponent"}
      onSubmitAnswer={submitAnswer}
      onLeave={leave}
    />
  );
}
