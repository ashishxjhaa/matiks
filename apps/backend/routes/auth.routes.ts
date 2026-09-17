import { Router } from "express";
import { prisma } from "@repo/db/client";
import {
  registerSchema,
  loginSchema,
  zodErrorMessage,
} from "@repo/common/common";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { authMiddleware } from "../auth.middleware";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const { success, data, error } = registerSchema.safeParse(req.body);
  if (!success) {
    return res.status(403).json({
      message: zodErrorMessage({ error }),
    });
  }

  const { email, password } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({
      message: "user already exists",
    });
  }

  const username = email.split("@")[0]!;
  const hashedPassword = await hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      username,
    },
  });

  return res.status(201).json({
    message: "registration successfull",
  });
});

authRouter.post("/login", async (req, res) => {
  const { success, data, error } = loginSchema.safeParse(req.body);
  if (!success) {
    return res.status(403).json({
      message: zodErrorMessage({ error }),
    });
  }

  const { email, password } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    return res.status(400).json({
      message: "user not found",
    });
  }

  const isPasswordValid = await compare(password, existingUser.password);
  if (!isPasswordValid) {
    return res.status(400).json({
      message: "invalid password",
    });
  }

  const token = sign({ userId: existingUser.id }, process.env.JWT_SECRET!);

  return res.status(200).json({
    message: "login successfull",
    data: { token },
  });
});

authRouter.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findFirst({
      where: { id: userId },
      omit: {
        password: true,
      },
      include: {
        rating: true,
        gameMember: {
          include: {
            game: true,
          },
        },
      },
    });

    return res.json({ message: "user found", data: { user } });
  } catch (e) {
    return res.status(500).json({
      message: "something went wrong",
    });
  }
});
