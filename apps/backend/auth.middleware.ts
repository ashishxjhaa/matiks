import type { Request, Response, NextFunction } from "express";
import { verify, type JwtPayload } from "jsonwebtoken";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeaders = req.headers.authorization;
  if (!authHeaders) {
    return res.status(401).json({
      message: "missing token",
    });
  }

  const token = authHeaders.split("Bearer ")[1];
  if (!token) {
    return res.status(401).json({
      message: "invalid token",
    });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch (e) {
    return res.status(401).json({
      message: "invalid token",
    });
  }
};
