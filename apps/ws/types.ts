import { WebSocket } from "ws";

export type User = {
  id: string;
  name: string;
  ws: WebSocket;
};

export type questionOperation = "PLUS" | "MINUS" | "DIVIDE" | "MULTIPLICATION";

export type Question = {
  id: string;
  number1: number;
  number2: number;
  operation: questionOperation;
  answer: number;
};

export type Answer = {
  id: string;
  answer: number;
  questionId: string;
};

export type Game = {
  id: string;
  status: "SEARCHING_FOR_PLAYER" | "OVER" | "RUNNING";
  adminId: string;
  members: User[];
  questions: Question[];
  answers: Answer[];
};
