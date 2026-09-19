export type QuestionOperation =
  | "PLUS"
  | "MINUS"
  | "DIVIDE"
  | "MULTIPLICATION";

export type Question = {
  id: string;
  number1: number;
  number2: number;
  operation: QuestionOperation;
  answer: number;
};

export type OnlineUser = {
  id: string;
  name: string;
};

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  rating: { rating: number } | null;
};

export type GamePlayerResult = {
  id: string;
  name: string;
  score: number;
  rating: number;
};

export type WsServerMessage =
  | {
      type: "ONLINE_USERS";
      payload: { user: [string, OnlineUser][] };
    }
  | {
      type: "GAME_REQUEST";
      payload: { gameId: string };
    }
  | {
      type: "QUESTION";
      payload: { gameId: string; question: Question };
    }
  | {
      type: "GAME_OVER";
      payload: { gameId: string; players: GamePlayerResult[] };
    };

export function operationGlyph(op: QuestionOperation): string {
  switch (op) {
    case "PLUS":
      return "+";
    case "MINUS":
      return "−";
    case "DIVIDE":
      return "÷";
    case "MULTIPLICATION":
      return "×";
  }
}
