"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PageLoader, Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";
import { useWs } from "@/lib/ws-context";
import { operationGlyph, type Question } from "@/lib/types";

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
  const [secondsLeft, setSecondsLeft] = useState(59);

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

export default function GamePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const {
    matchStatus,
    game,
    submitAnswer,
    resetMatchUi,
    opponentName,
  } = useWs();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user && matchStatus === "idle" && !game.question) {
      router.replace("/dashboard");
    }
  }, [loading, user, matchStatus, game.question, router]);

  function leave() {
    resetMatchUi();
    router.push("/dashboard");
  }

  if (loading || !user) return <PageLoader />;

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
