import { WebSocketServer, WebSocket } from "ws";
import { prisma } from "@repo/db/client";
import { verify, type JwtPayload } from "jsonwebtoken";
import type { Game, Question, User } from "./types";
import { generateQuestions } from "./utils";

const WS_PORT = Number(process.env.WS_PORT ?? 8080);
const wss = new WebSocketServer({ port: WS_PORT, host: "0.0.0.0" });

const GAME_DURATION_MS = 60_000;

const onlineUsers: Map<string, User> = new Map();
const games: Map<string, Game> = new Map();
const currentQuestions: Map<string, number> = new Map();
const allQuestions: Map<string, Question[]> = new Map();
const scores: Map<string, number> = new Map();
const endTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

function progressKey(gameId: string, userId: string) {
  return `g:${gameId}-u:${userId}`;
}

function answersMatch(submitted: number, expected: number) {
  return Math.abs(Number(submitted) - Number(expected)) < 1e-6;
}

async function finishGame(game: Game) {
  if (game.status === "OVER") return;

  game.status = "OVER";
  games.set(game.id, game);

  const timer = endTimers.get(game.id);
  if (timer) {
    clearTimeout(timer);
    endTimers.delete(game.id);
  }

  const players = await Promise.all(
    game.members.map(async (mem) => {
      const ratingRow = await prisma.userRating.findUnique({
        where: { userId: mem.id },
      });
      return {
        id: mem.id,
        name: mem.name,
        score: scores.get(progressKey(game.id, mem.id)) ?? 0,
        rating: ratingRow?.rating ?? 0,
      };
    }),
  );

  const payload = JSON.stringify({
    type: "GAME_OVER",
    payload: { gameId: game.id, players },
  });

  game.members.forEach((mem) => {
    if (mem.ws.readyState === WebSocket.OPEN) mem.ws.send(payload);
  });
}

type ExtendedWs = WebSocket & { userId: string };

wss.on("connection", async (ws: ExtendedWs, req) => {
  const token = req.url?.split("?token=")[1];
  if (!token) {
    ws.close();
    return;
  }

  let decoded;

  try {
    decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (e) {
    ws.close();
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });
  if (!user) {
    ws.close();
    return;
  }

  ws.userId = decoded.userId;

  onlineUsers.set(decoded.userId, {
    name: user.username,
    ws,
    id: user.id,
  });

  wss.clients.forEach((ws) => {
    ws.send(
      JSON.stringify({
        type: "ONLINE_USERS",
        payload: {
          user: Array.from(onlineUsers),
        },
      }),
    );
  });

  ws.on("message", (event) => {
    const parsedData = JSON.parse(event.toString());

    if (parsedData.type === "PLAY_GAME") {
      const {} = parsedData.payload;

      let runningGame: Game | null = null;

      for (const [gameId, game] of games.entries()) {
        if (game.status === "SEARCHING_FOR_PLAYER") {
          runningGame = game;
          break;
        }
      }

      if (!runningGame) {
        const gameId = crypto.randomUUID();

        games.set(gameId, {
          id: gameId,
          members: [
            {
              id: user.id,
              name: user.username,
              ws,
            },
          ],
          adminId: user.id,
          status: "SEARCHING_FOR_PLAYER",
          questions: [],
          answers: [],
        });

        wss.clients.forEach((wsAll) => {
          if (wsAll === ws) return;

          wsAll.send(
            JSON.stringify({
              type: "GAME_REQUEST",
              payload: { gameId },
            }),
          );
        });

        return;
      }

      const currentGameFetched = games.get(runningGame.id)!;

      currentGameFetched.members.push({
        id: user.id,
        name: user.username,
        ws,
      });

      const questions = generateQuestions();

      currentGameFetched.questions = questions;

      allQuestions.set(runningGame.id, questions);

      currentGameFetched.status = "RUNNING";

      games.set(currentGameFetched.id, currentGameFetched);

      const firstQuestion = currentGameFetched.questions[0]!;

      currentGameFetched.members.forEach((mem) => {
        currentQuestions.set(progressKey(currentGameFetched.id, mem.id), 0);
        scores.set(progressKey(currentGameFetched.id, mem.id), 0);
        mem.ws.send(
          JSON.stringify({
            type: "QUESTION",
            payload: {
              gameId: runningGame.id,
              question: firstQuestion,
            },
          }),
        );
      });

      const timer = setTimeout(() => {
        void finishGame(currentGameFetched);
      }, GAME_DURATION_MS);
      endTimers.set(currentGameFetched.id, timer);
    }

    if (parsedData.type === "SUBMIT_ANSWER") {
      const { gameId, questionId, answer } = parsedData.payload;

      const existingGame = games.get(gameId);

      if (!existingGame) {
        ws.close();
        return;
      }

      const existingQuestion = existingGame.questions.find(
        (qs) => qs.id === questionId,
      );

      if (!existingQuestion) {
        ws.close();
        return;
      }

      if (existingGame.status !== "RUNNING") {
        return;
      }

      existingGame.answers.push({
        id: crypto.randomUUID(),
        answer,
        questionId,
      });

      if (!answersMatch(answer, existingQuestion.answer)) {
        return;
      }

      const key = progressKey(existingGame.id, ws.userId);
      scores.set(key, (scores.get(key) ?? 0) + 1);

      const currentQuestionIndex = currentQuestions.get(key) ?? 0;
      const storedQuestions =
        allQuestions.get(existingGame.id) ?? existingGame.questions;

      const nextIndex = currentQuestionIndex + 1;
      const nextQuestion = storedQuestions[nextIndex];
      if (!nextQuestion) {
        return;
      }

      currentQuestions.set(key, nextIndex);

      ws.send(
        JSON.stringify({
          type: "QUESTION",
          payload: {
            gameId: existingGame.id,
            question: nextQuestion,
          },
        }),
      );
    }
  });
});
