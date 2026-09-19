"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import type { OnlineUser, Question, WsServerMessage } from "./types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080";

type MatchStatus = "idle" | "searching" | "incoming" | "playing";

type GameState = {
  gameId: string | null;
  question: Question | null;
  questionNumber: number;
};

type WsContextValue = {
  connected: boolean;
  onlineUsers: OnlineUser[];
  matchStatus: MatchStatus;
  game: GameState;
  opponentName: string | null;
  findMatch: () => void;
  joinMatch: () => void;
  submitAnswer: (answer: number) => void;
  resetMatchUi: () => void;
};

const WsContext = createContext<WsContextValue | null>(null);

const emptyGame: GameState = {
  gameId: null,
  question: null,
  questionNumber: 0,
};

export function WsProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>("idle");
  const [game, setGame] = useState<GameState>(emptyGame);
  const matchStatusRef = useRef<MatchStatus>("idle");

  useEffect(() => {
    matchStatusRef.current = matchStatus;
  }, [matchStatus]);

  useEffect(() => {
    if (!token) {
      const existing = wsRef.current;
      if (existing) {
        existing.close();
        wsRef.current = null;
      }
      return;
    }

    const ws = new WebSocket(`${WS_URL}/?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      if (wsRef.current === ws) wsRef.current = null;
    };
    ws.onerror = () => setConnected(false);

    ws.onmessage = (event) => {
      let msg: WsServerMessage;
      try {
        msg = JSON.parse(event.data as string) as WsServerMessage;
      } catch {
        return;
      }

      if (msg.type === "ONLINE_USERS") {
        const users = (msg.payload.user ?? [])
          .map((entry) => {
            const value = Array.isArray(entry) ? entry[1] : entry;
            if (!value || typeof value !== "object") return null;
            const { id, name } = value as OnlineUser;
            if (!id || !name) return null;
            return { id, name };
          })
          .filter((u): u is OnlineUser => u !== null);
        setOnlineUsers(users);
        return;
      }

      if (msg.type === "GAME_REQUEST") {
        if (matchStatusRef.current === "idle") {
          setMatchStatus("incoming");
        }
        return;
      }

      if (msg.type === "QUESTION") {
        const { gameId, question } = msg.payload;
        if (!question) return;

        setMatchStatus("playing");
        setGame((prev) => ({
          gameId,
          question,
          questionNumber:
            prev.gameId === gameId ? prev.questionNumber + 1 : 1,
        }));
      }
    };

    return () => {
      ws.close();
    };
  }, [token]);

  // When logged out, clear match UI after the socket teardown (async to avoid sync setState-in-effect)
  useEffect(() => {
    if (token) return;
    const id = window.setTimeout(() => {
      setConnected(false);
      setOnlineUsers([]);
      setMatchStatus("idle");
      setGame(emptyGame);
    }, 0);
    return () => window.clearTimeout(id);
  }, [token]);

  const send = useCallback((type: string, payload: unknown = {}) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type, payload }));
  }, []);

  const findMatch = useCallback(() => {
    setMatchStatus("searching");
    send("PLAY_GAME", {});
  }, [send]);

  const joinMatch = useCallback(() => {
    setMatchStatus("searching");
    send("PLAY_GAME", {});
  }, [send]);

  const submitAnswer = useCallback(
    (answer: number) => {
      if (!game.gameId || !game.question) return;
      send("SUBMIT_ANSWER", {
        gameId: game.gameId,
        questionId: game.question.id,
        answer,
      });
    },
    [game.gameId, game.question, send],
  );

  const resetMatchUi = useCallback(() => {
    setMatchStatus("idle");
    setGame(emptyGame);
  }, []);

  const opponentName = useMemo(() => {
    if (matchStatus !== "playing" || !user) return null;
    const others = onlineUsers.filter((u) => u.id !== user.id);
    return others.length === 1 ? others[0]!.name : null;
  }, [matchStatus, onlineUsers, user]);

  return (
    <WsContext.Provider
      value={{
        connected,
        onlineUsers,
        matchStatus,
        game,
        opponentName,
        findMatch,
        joinMatch,
        submitAnswer,
        resetMatchUi,
      }}
    >
      {children}
    </WsContext.Provider>
  );
}

export function useWs() {
  const ctx = useContext(WsContext);
  if (!ctx) throw new Error("useWs must be used within WsProvider");
  return ctx;
}
