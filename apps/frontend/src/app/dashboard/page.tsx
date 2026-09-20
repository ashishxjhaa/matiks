"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";
import { useWs } from "@/lib/ws-context";

const NAV = [
  { id: "arena", label: "Arena", active: true },
  { id: "quests", label: "Quests", active: false },
  { id: "compete", label: "Compete", active: false },
  { id: "feed", label: "Feed", active: false },
  { id: "group", label: "Group Play", active: false },
  { id: "more", label: "More", active: false },
] as const;

function NavIcon({
  id,
  active,
}: {
  id: (typeof NAV)[number]["id"];
  active: boolean;
}) {
  const c = active ? "#B1FA63" : "#8a8a8a";
  const props = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    "aria-hidden": true as const,
  };

  switch (id) {
    case "arena":
      return (
        <svg {...props}>
          <path
            d="M7 4.5 17 19.5M17 4.5 7 19.5"
            stroke={c}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M5.5 6.5h3M15.5 6.5h3M5.5 17.5h3M15.5 17.5h3"
            stroke={c}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "quests":
      return (
        <svg {...props}>
          <path
            d="M8 3.5h8a2 2 0 0 1 2 2v15l-6-2.8-6 2.8v-15a2 2 0 0 1 2-2Z"
            stroke={c}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "compete":
      return (
        <svg {...props}>
          <path
            d="M7 20V10m5 10V4m5 16v-7"
            stroke={c}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "feed":
      return (
        <svg {...props}>
          <path
            d="M5 7h14M5 12h14M5 17h9"
            stroke={c}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "group":
      return (
        <svg {...props}>
          <circle cx="9" cy="9" r="3" stroke={c} strokeWidth="1.7" />
          <circle cx="16" cy="10" r="2.5" stroke={c} strokeWidth="1.7" />
          <path
            d="M4 18.5c.8-2.2 2.6-3.5 5-3.5s4.2 1.3 5 3.5M14 15c1.5 0 2.8.7 3.5 2"
            stroke={c}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="6" cy="12" r="1.5" fill={c} />
          <circle cx="12" cy="12" r="1.5" fill={c} />
          <circle cx="18" cy="12" r="1.5" fill={c} />
        </svg>
      );
  }
}

const CATEGORIES = [
  { id: "math", label: "Math", active: true },
  { id: "memory", label: "Memory", active: false },
  { id: "puzzle", label: "Puzzle", active: false },
  { id: "logic", label: "Logic", active: false },
] as const;

function CategoryGlyph({
  id,
}: {
  id: (typeof CATEGORIES)[number]["id"];
}) {
  if (id === "math") {
    return (
      <svg width="38" height="28" viewBox="0 0 38 28" fill="none" aria-hidden>
        <rect
          x="1.4"
          y="1.4"
          width="21"
          height="17"
          rx="5"
          stroke="#111"
          strokeWidth="2.4"
        />
        <circle cx="12" cy="10" r="3.2" stroke="#111" strokeWidth="2.2" />
        <rect
          x="15.2"
          y="8.2"
          width="21"
          height="17"
          rx="5"
          fill="#FFE500"
          stroke="#111"
          strokeWidth="2.4"
        />
        <circle cx="25.6" cy="16.8" r="3.2" fill="#111" />
      </svg>
    );
  }
  if (id === "memory") {
    return (
      <svg width="32" height="28" viewBox="0 0 32 28" fill="none" aria-hidden>
        <rect x="0" y="0" width="18" height="18" rx="4.5" fill="#7EB6FF" />
        <rect x="12" y="8" width="18" height="18" rx="4.5" fill="#3B7CFF" />
      </svg>
    );
  }
  if (id === "puzzle") {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <rect x="0" y="0" width="11" height="11" rx="3" fill="#2ECC71" />
        <rect x="17" y="0" width="11" height="11" rx="3" fill="#2ECC71" />
        <rect x="0" y="17" width="11" height="11" rx="3" fill="#2ECC71" />
        <rect x="17" y="17" width="11" height="11" rx="3" fill="#2ECC71" />
      </svg>
    );
  }
  return (
    <svg width="32" height="26" viewBox="0 0 32 26" fill="none" aria-hidden>
      <circle cx="10" cy="13" r="8" fill="#F062A8" />
      <rect
        x="14"
        y="5"
        width="16"
        height="16"
        rx="4"
        stroke="#F062A8"
        strokeWidth="2.6"
      />
    </svg>
  );
}

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const {
    connected,
    onlineUsers,
    matchStatus,
    findMatch,
    joinMatch,
    game,
  } = useWs();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [loading, user, router]);

  useEffect(() => {
    if (matchStatus === "playing" && game.question) {
      router.push("/game");
    }
  }, [matchStatus, game.question, router]);

  if (loading || !user) return <PageLoader />;

  const others = onlineUsers.filter((u) => u.id !== user.id);
  const isBusy = matchStatus === "searching" || matchStatus === "playing";
  const rating = user.rating?.rating ?? 0;

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#111] text-white xl:grid-cols-[184px_minmax(0,1fr)_280px]">
      {/* LEFT */}
      <aside className="hidden flex-col border-r border-white/[0.04] bg-[#161616] xl:flex">
        <div className="flex items-center gap-2 px-5 pt-6 pb-7">
          <Image
            src="/matiks-logo.svg"
            alt="Matiks"
            width={22}
            height={22}
            priority
            className="h-[22px] w-[22px]"
          />
          <span className="text-[12px] font-extrabold tracking-[0.16em] text-accent uppercase">
            Matiks
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={!item.active}
              className={`flex w-full items-center gap-3 px-3.5 py-[11px] text-left text-[11px] font-bold tracking-[0.14em] uppercase ${
                item.active
                  ? "rounded-full border-[1.5px] border-accent text-accent"
                  : "rounded-full border-[1.5px] border-transparent text-[#8a8a8a]"
              }`}
            >
              <NavIcon id={item.id} active={item.active} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-2.5 px-4 py-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2a2a2a] text-[10px] font-semibold">
            {initials(user.username)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold tracking-wide uppercase">
              {user.username}
            </p>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace("/");
              }}
              className="text-[11px] text-[#888] hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* MIDDLE — compact column, not stretched */}
      <div className="flex min-w-0 flex-col bg-[#111]">
        <header className="flex items-center justify-between px-4 py-3 xl:hidden">
          <span className="text-sm font-extrabold tracking-widest text-accent uppercase">
            Matiks
          </span>
          <button
            type="button"
            className="text-[12px] text-[#888]"
            onClick={() => {
              logout();
              router.replace("/");
            }}
          >
            Sign out
          </button>
        </header>

        <main className="mx-auto w-full max-w-[720px] space-y-5 px-5 py-5 lg:px-0 lg:py-6">
          <div className="flex items-start gap-3.5 overflow-x-auto pb-1">
            <div className="flex w-[58px] shrink-0 flex-col items-center gap-1.5">
              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#2d2d2d] text-[12px] font-bold">
                {initials(user.username)}
              </span>
              <span className="w-full truncate text-center text-[10px] font-bold tracking-[0.08em] uppercase">
                You
              </span>
            </div>
            {others.map((u) => (
              <div
                key={u.id}
                className="flex w-[58px] shrink-0 flex-col items-center gap-1.5"
              >
                <div className="relative h-[52px] w-[52px]">
                  <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#2d2d2d] text-[12px] font-bold">
                    {initials(u.name)}
                  </span>
                  <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-accent" />
                </div>
                <span className="w-full truncate text-center text-[10px] font-bold tracking-[0.08em] uppercase">
                  {u.name}
                </span>
              </div>
            ))}
          </div>

          <section className="relative">
            <div className="material-card relative bg-[#1c1c1c] px-6 pt-5 pr-14 pb-5">
              <span className="absolute -top-3 right-6 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#161616] px-2.5 py-1 text-[12px] font-bold text-[#FF3B3B] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm.75 3.5h-1.5v5.2l3.4 2 0.75-1.28-2.65-1.55V7.5Z" />
                  <path d="M9 3.2h6v1.6H9V3.2Z" />
                </svg>
                04:40
              </span>

              <h2 className="text-[26px] leading-none font-black tracking-[-0.035em] uppercase">
                Daily Challenges
              </h2>
              <p className="mt-2 text-[14px] text-[#8a8a8a]">
                Complete to earn rewards
              </p>

              <div className="relative mt-4 h-9 rounded-full bg-[#333]">
                <span className="absolute top-[3px] left-[3px] flex h-[30px] min-w-[54px] items-center justify-center rounded-full border-[3.5px] border-accent bg-[#1c1c1c] px-2.5 text-[12px] font-bold text-accent">
                  0/7
                </span>
                <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-accent">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M7 4h3v2.2H7V4zm7 0h3v2.2h-3V4zM6.5 8h11v1.8c0 2.6-1.5 4.8-3.7 5.8L13.4 21h-2.8l-.4-5.4C8 14.6 6.5 12.4 6.5 9.8V8z" />
                  </svg>
                </span>
              </div>

              <span className="absolute right-4 bottom-6 text-[22px] leading-none font-light text-accent">
                ›
              </span>
            </div>
          </section>

          <section>
            <p className="mb-2.5 text-[11px] font-bold tracking-[0.16em] text-[#777] uppercase">
              Duels
            </p>
            <div className="grid grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex min-w-0 flex-col items-center gap-2">
                  <button
                    type="button"
                    disabled={!cat.active}
                    className={`relative flex h-[78px] w-full items-center justify-center rounded-panel ${
                      cat.active
                        ? "border-[3px] border-black bg-[#FFE500]"
                        : "bg-[#1c1c1c]"
                    }`}
                  >
                    <span className={cat.active ? "-translate-y-1" : ""}>
                      <CategoryGlyph id={cat.id} />
                    </span>
                    {cat.active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-[5px] bg-black px-3 py-[3px] text-[10px] font-extrabold tracking-wide text-[#FFE500]">
                        {rating || 1009}
                      </span>
                    )}
                  </button>
                  <span
                    className="text-[11px] font-extrabold tracking-[0.12em] uppercase"
                    style={{ color: cat.active ? "#E6C000" : "#6a6a6a" }}
                  >
                    {cat.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={!connected || isBusy}
              onClick={() => {
                findMatch();
                router.push("/game");
              }}
              className="material-card relative flex min-h-[188px] flex-col bg-[#1c1c1c] p-5 text-left hover:bg-[#202020] disabled:opacity-70"
            >
              <span className="w-fit rounded-[4px] bg-[#2a2a2a] px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-[#F0C93D] uppercase">
                Math
              </span>
              <h3 className="mt-4 text-[34px] leading-[0.9] font-extrabold tracking-[-0.04em] text-white uppercase">
                Sprint
                <br />
                Duels
              </h3>
              <p className="mt-auto pt-5 text-[11px] tracking-[0.08em] text-[#8a8a8a] uppercase">
                Race to solve the most in 1 minute
              </p>
              <span className="absolute top-[52%] right-4 text-[#F0C93D]">▸</span>
            </button>

            <div className="material-card relative flex min-h-[188px] flex-col bg-[#1c1c1c] p-5">
              <span className="w-fit rounded-[4px] bg-[#2a2a2a] px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-[#F0C93D] uppercase">
                Math
              </span>
              <h3 className="mt-4 text-[34px] leading-[0.9] font-extrabold tracking-[-0.04em] text-white uppercase">
                Fastest Fingers
                <br />
                Duels
              </h3>
              <p className="mt-auto pt-5 text-[11px] tracking-[0.08em] text-[#8a8a8a] uppercase">
                Be the first to answer each question
              </p>
              <span className="absolute top-[52%] right-4 text-[#F0C93D]">▸</span>
            </div>
          </section>
        </main>
      </div>

      {/* RIGHT */}
      <aside className="flex flex-col border-l border-white/[0.04] bg-[#161616]">
        <div className="flex justify-end gap-1.5 px-4 pt-5 pb-4">
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-1">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-black">
              π
            </span>
            <span className="tabular text-[11px] font-bold">500</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 3c2 3 1 5-1 7 3 0 5 2 5 5a6 6 0 1 1-10.5-4C8 9 10 6 12 3Z"
                stroke="#777"
                strokeWidth="1.6"
              />
            </svg>
            <span className="tabular text-[11px] font-bold text-[#888]">0</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-1">
            <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#c4a574"
                d="M12 2.5 14.8 8l5.7.5-4.3 3.8 1.3 5.5L12 15.2 6.5 17.8l1.3-5.5L3.5 8.5 9.2 8 12 2.5Z"
              />
            </svg>
            <span className="tabular text-[11px] font-bold text-[#c4a574]">
              {rating} XP
            </span>
          </div>
        </div>

        <div className="px-4">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-[10px] font-bold tracking-[0.14em] text-[#9a9a9a] uppercase">
              Daily Quest
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
                <path d="M12 8v4l2.5 1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              07:16
            </span>
            <button
              type="button"
              className="ml-auto text-[10px] font-bold tracking-wide text-accent uppercase"
            >
              View all
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-panel bg-[#1c1c1c] px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium leading-snug">
                  Play 1 Math · 1v1 Duel
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F0C93D]" />
                  <div className="h-0.5 flex-1 rounded-full bg-[#333]" />
                  <span className="text-[10px] text-[#F0C93D]">0/1</span>
                </div>
              </div>
              <button
                type="button"
                disabled={!connected || isBusy}
                onClick={() => {
                  findMatch();
                  router.push("/game");
                }}
                className="shrink-0 rounded-md border border-white/15 bg-black px-2.5 py-1.5 text-[10px] font-bold shadow-[2px_2px_0_0_#F0C93D] disabled:opacity-40"
              >
                {matchStatus === "searching" ? "…" : "Play now"}
              </button>
            </div>

            <div className="flex items-center gap-2 rounded-panel bg-[#1c1c1c] px-3 py-2.5 opacity-50">
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium leading-snug">
                  Play 1 Math · Sprint Duel
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4D8BFF]" />
                  <div className="h-0.5 flex-1 rounded-full bg-[#333]" />
                  <span className="text-[10px] text-[#4D8BFF]">0/1</span>
                </div>
              </div>
              <button
                type="button"
                disabled
                className="shrink-0 rounded-md border border-white/10 bg-black px-2.5 py-1.5 text-[10px] font-bold text-[#888] shadow-[2px_2px_0_0_#4D8BFF]"
              >
                Soon
              </button>
            </div>
          </div>
        </div>

        <div className="mt-auto px-4 pt-6 pb-5">
          <div className="material-card bg-[#1a1a1a] px-4 pt-5 pb-4">
            <h2 className="text-center text-[13px] font-extrabold tracking-[0.08em] uppercase">
              Download Mobile App
            </h2>
            <p className="mt-1.5 text-center text-[12px] text-[#8a8a8a]">
              Scan the QR code using your phone
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-[92px] w-[92px] shrink-0 items-center justify-center rounded-control bg-white p-[6px]">
                <svg viewBox="0 0 29 29" className="h-full w-full" aria-hidden>
                  <rect width="29" height="29" fill="#fff" />
                  <g fill="#111">
                    <rect x="0" y="0" width="7" height="7" />
                    <rect x="1" y="1" width="5" height="5" fill="#fff" />
                    <rect x="2" y="2" width="3" height="3" />
                    <rect x="22" y="0" width="7" height="7" />
                    <rect x="23" y="1" width="5" height="5" fill="#fff" />
                    <rect x="24" y="2" width="3" height="3" />
                    <rect x="0" y="22" width="7" height="7" />
                    <rect x="1" y="23" width="5" height="5" fill="#fff" />
                    <rect x="2" y="24" width="3" height="3" />
                    <rect x="8" y="0" width="1" height="1" />
                    <rect x="10" y="0" width="1" height="1" />
                    <rect x="12" y="0" width="1" height="1" />
                    <rect x="14" y="0" width="1" height="1" />
                    <rect x="16" y="0" width="1" height="1" />
                    <rect x="19" y="0" width="1" height="1" />
                    <rect x="8" y="2" width="1" height="1" />
                    <rect x="11" y="2" width="1" height="1" />
                    <rect x="13" y="2" width="2" height="1" />
                    <rect x="17" y="2" width="1" height="1" />
                    <rect x="20" y="2" width="1" height="1" />
                    <rect x="9" y="3" width="1" height="1" />
                    <rect x="12" y="3" width="1" height="1" />
                    <rect x="15" y="3" width="1" height="1" />
                    <rect x="18" y="3" width="2" height="1" />
                    <rect x="8" y="4" width="2" height="1" />
                    <rect x="13" y="4" width="1" height="1" />
                    <rect x="16" y="4" width="1" height="1" />
                    <rect x="19" y="4" width="1" height="1" />
                    <rect x="10" y="5" width="1" height="1" />
                    <rect x="12" y="5" width="3" height="1" />
                    <rect x="17" y="5" width="1" height="1" />
                    <rect x="8" y="6" width="1" height="1" />
                    <rect x="11" y="6" width="1" height="1" />
                    <rect x="14" y="6" width="1" height="1" />
                    <rect x="16" y="6" width="2" height="1" />
                    <rect x="20" y="6" width="1" height="1" />
                    <rect x="0" y="8" width="1" height="1" />
                    <rect x="2" y="8" width="1" height="1" />
                    <rect x="4" y="8" width="2" height="1" />
                    <rect x="8" y="8" width="1" height="1" />
                    <rect x="10" y="8" width="1" height="1" />
                    <rect x="13" y="8" width="2" height="1" />
                    <rect x="17" y="8" width="1" height="1" />
                    <rect x="19" y="8" width="1" height="1" />
                    <rect x="22" y="8" width="2" height="1" />
                    <rect x="26" y="8" width="1" height="1" />
                    <rect x="28" y="8" width="1" height="1" />
                    <rect x="1" y="9" width="1" height="1" />
                    <rect x="5" y="9" width="1" height="1" />
                    <rect x="9" y="9" width="2" height="1" />
                    <rect x="14" y="9" width="1" height="1" />
                    <rect x="16" y="9" width="1" height="1" />
                    <rect x="21" y="9" width="1" height="1" />
                    <rect x="24" y="9" width="2" height="1" />
                    <rect x="0" y="10" width="3" height="1" />
                    <rect x="6" y="10" width="1" height="1" />
                    <rect x="8" y="10" width="1" height="1" />
                    <rect x="11" y="10" width="2" height="1" />
                    <rect x="15" y="10" width="1" height="1" />
                    <rect x="18" y="10" width="2" height="1" />
                    <rect x="23" y="10" width="1" height="1" />
                    <rect x="27" y="10" width="2" height="1" />
                    <rect x="2" y="11" width="1" height="1" />
                    <rect x="4" y="11" width="1" height="1" />
                    <rect x="9" y="11" width="1" height="1" />
                    <rect x="12" y="11" width="1" height="1" />
                    <rect x="16" y="11" width="1" height="1" />
                    <rect x="20" y="11" width="1" height="1" />
                    <rect x="25" y="11" width="1" height="1" />
                    <rect x="0" y="12" width="1" height="1" />
                    <rect x="3" y="12" width="2" height="1" />
                    <rect x="8" y="12" width="2" height="1" />
                    <rect x="13" y="12" width="3" height="1" />
                    <rect x="18" y="12" width="1" height="1" />
                    <rect x="21" y="12" width="1" height="1" />
                    <rect x="24" y="12" width="1" height="1" />
                    <rect x="26" y="12" width="1" height="1" />
                    <rect x="1" y="13" width="1" height="1" />
                    <rect x="5" y="13" width="1" height="1" />
                    <rect x="7" y="13" width="1" height="1" />
                    <rect x="10" y="13" width="1" height="1" />
                    <rect x="17" y="13" width="2" height="1" />
                    <rect x="22" y="13" width="2" height="1" />
                    <rect x="28" y="13" width="1" height="1" />
                    <rect x="0" y="14" width="2" height="1" />
                    <rect x="4" y="14" width="1" height="1" />
                    <rect x="8" y="14" width="1" height="1" />
                    <rect x="11" y="14" width="2" height="1" />
                    <rect x="15" y="14" width="1" height="1" />
                    <rect x="19" y="14" width="1" height="1" />
                    <rect x="23" y="14" width="1" height="1" />
                    <rect x="25" y="14" width="3" height="1" />
                    <rect x="2" y="15" width="1" height="1" />
                    <rect x="6" y="15" width="1" height="1" />
                    <rect x="9" y="15" width="1" height="1" />
                    <rect x="13" y="15" width="1" height="1" />
                    <rect x="16" y="15" width="2" height="1" />
                    <rect x="21" y="15" width="1" height="1" />
                    <rect x="24" y="15" width="1" height="1" />
                    <rect x="27" y="15" width="1" height="1" />
                    <rect x="0" y="16" width="1" height="1" />
                    <rect x="3" y="16" width="1" height="1" />
                    <rect x="7" y="16" width="2" height="1" />
                    <rect x="12" y="16" width="1" height="1" />
                    <rect x="18" y="16" width="1" height="1" />
                    <rect x="22" y="16" width="1" height="1" />
                    <rect x="26" y="16" width="2" height="1" />
                    <rect x="1" y="17" width="1" height="1" />
                    <rect x="5" y="17" width="1" height="1" />
                    <rect x="10" y="17" width="2" height="1" />
                    <rect x="14" y="17" width="1" height="1" />
                    <rect x="19" y="17" width="2" height="1" />
                    <rect x="23" y="17" width="1" height="1" />
                    <rect x="28" y="17" width="1" height="1" />
                    <rect x="0" y="18" width="3" height="1" />
                    <rect x="6" y="18" width="1" height="1" />
                    <rect x="9" y="18" width="1" height="1" />
                    <rect x="13" y="18" width="2" height="1" />
                    <rect x="17" y="18" width="1" height="1" />
                    <rect x="21" y="18" width="1" height="1" />
                    <rect x="24" y="18" width="2" height="1" />
                    <rect x="2" y="19" width="1" height="1" />
                    <rect x="4" y="19" width="1" height="1" />
                    <rect x="8" y="19" width="1" height="1" />
                    <rect x="11" y="19" width="1" height="1" />
                    <rect x="15" y="19" width="1" height="1" />
                    <rect x="20" y="19" width="1" height="1" />
                    <rect x="26" y="19" width="1" height="1" />
                    <rect x="0" y="20" width="1" height="1" />
                    <rect x="3" y="20" width="2" height="1" />
                    <rect x="7" y="20" width="1" height="1" />
                    <rect x="10" y="20" width="2" height="1" />
                    <rect x="16" y="20" width="1" height="1" />
                    <rect x="19" y="20" width="1" height="1" />
                    <rect x="22" y="20" width="1" height="1" />
                    <rect x="25" y="20" width="1" height="1" />
                    <rect x="28" y="20" width="1" height="1" />
                    <rect x="8" y="22" width="1" height="1" />
                    <rect x="11" y="22" width="1" height="1" />
                    <rect x="14" y="22" width="2" height="1" />
                    <rect x="18" y="22" width="1" height="1" />
                    <rect x="21" y="22" width="1" height="1" />
                    <rect x="23" y="22" width="1" height="1" />
                    <rect x="26" y="22" width="1" height="1" />
                    <rect x="9" y="23" width="1" height="1" />
                    <rect x="12" y="23" width="1" height="1" />
                    <rect x="16" y="23" width="1" height="1" />
                    <rect x="19" y="23" width="2" height="1" />
                    <rect x="24" y="23" width="1" height="1" />
                    <rect x="27" y="23" width="1" height="1" />
                    <rect x="8" y="24" width="2" height="1" />
                    <rect x="13" y="24" width="1" height="1" />
                    <rect x="17" y="24" width="1" height="1" />
                    <rect x="22" y="24" width="2" height="1" />
                    <rect x="26" y="24" width="1" height="1" />
                    <rect x="10" y="25" width="1" height="1" />
                    <rect x="12" y="25" width="2" height="1" />
                    <rect x="18" y="25" width="1" height="1" />
                    <rect x="21" y="25" width="1" height="1" />
                    <rect x="24" y="25" width="1" height="1" />
                    <rect x="28" y="25" width="1" height="1" />
                    <rect x="8" y="26" width="1" height="1" />
                    <rect x="11" y="26" width="1" height="1" />
                    <rect x="15" y="26" width="1" height="1" />
                    <rect x="19" y="26" width="1" height="1" />
                    <rect x="23" y="26" width="1" height="1" />
                    <rect x="25" y="26" width="2" height="1" />
                    <rect x="9" y="27" width="2" height="1" />
                    <rect x="14" y="27" width="1" height="1" />
                    <rect x="17" y="27" width="2" height="1" />
                    <rect x="22" y="27" width="1" height="1" />
                    <rect x="28" y="27" width="1" height="1" />
                    <rect x="8" y="28" width="1" height="1" />
                    <rect x="12" y="28" width="1" height="1" />
                    <rect x="16" y="28" width="1" height="1" />
                    <rect x="20" y="28" width="1" height="1" />
                    <rect x="24" y="28" width="1" height="1" />
                    <rect x="26" y="28" width="1" height="1" />
                  </g>
                </svg>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-[42px] items-center justify-center gap-2 rounded-control border border-white/[0.08] bg-[#111] text-[13px] font-semibold hover:bg-[#161616]"
                >
                  <svg width="13" height="15" viewBox="0 0 14 17" fill="currentColor" aria-hidden>
                    <path d="M11.4 9.1c0-2 1.6-3 1.7-3.1-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.7-.7c-1.4 0-2.7.8-3.4 2.1-1.5 2.5-.4 6.3 1 8.3.7 1 1.5 2.1 2.6 2 1 0 1.4-.7 2.7-.7s1.6.7 2.7.7 1.8-1 2.5-2c.8-1.1 1.1-2.2 1.1-2.2s-2.1-.8-2.3-3.3ZM9.4 2.8c.6-.7 1-1.7.9-2.8-1 .1-2.1.7-2.7 1.5-.6.7-1.1 1.7-.9 2.7 1.1.1 2.1-.6 2.7-1.4Z" />
                  </svg>
                  App Store
                </a>
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-[42px] items-center justify-center gap-2 rounded-control border border-white/[0.08] bg-[#111] text-[13px] font-semibold hover:bg-[#161616]"
                >
                  <svg width="13" height="14" viewBox="0 0 14 16" fill="currentColor" aria-hidden>
                    <path d="M.9.7v14.6l8.4-7.3L.9.7Zm9.1 7.9 1.9 1.6-8.7 5 6.8-6.6Zm1.9-3.2-1.9 1.6 6.8 6.6-4.9-8.2ZM2.2.8 11 6.4 9.1 8 2.2.8Z" />
                  </svg>
                  Play Store
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {matchStatus === "incoming" && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 sm:bottom-8 sm:p-0">
          <div className="material-card animate-toast-in flex w-full max-w-md items-center gap-4 bg-[#1c1c1c] px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold">Opponent searching</p>
              <p className="mt-0.5 text-[12px] text-[#888]">Join to start the duel</p>
            </div>
            <Button size="sm" onClick={() => {
              joinMatch();
              router.push("/game");
            }}>
              Join
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
