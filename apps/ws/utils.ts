import type { Question, questionOperation } from "./types";

export const generateQuestions = (): Question[] => {
  const operation = ["PLUS", "MINUS", "DIVIDE", "MULTIPLICATION"];
  const questions: Question[] = [];

  for (let i = 0; i <= 60; i++) {
    const randomNumber1 = Math.floor(Math.random() * 10);
    const randomNumber2 = Math.floor(Math.random() * 20);

    const randomOperation = operation[
      Math.floor(Math.random() * operation.length)
    ]! as questionOperation;

    let answer;

    if (randomOperation === "DIVIDE") {
      answer = randomNumber1 / randomNumber2;
    } else if (randomOperation === "MINUS") {
      answer = randomNumber1 - randomNumber2;
    } else if (randomOperation === "MULTIPLICATION") {
      answer = randomNumber1 * randomNumber2;
    } else {
      answer = randomNumber1 + randomNumber2;
    }

    questions.push({
      id: crypto.randomUUID(),
      operation: randomOperation,
      number1: randomNumber1,
      number2: randomNumber2,
      answer: answer,
    });
  }

  return questions;
};
