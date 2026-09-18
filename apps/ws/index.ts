import { WebSocketServer, WebSocket } from "ws";
import { prisma } from "@repo/db/client";
import { verify, type JwtPayload } from "jsonwebtoken";

const wss = new WebSocketServer({ port: 8080 });

export type User = {
  id: string;
  name: string;
  ws: WebSocket;
};

const onlineUsers: Map<string, User> = new Map();

wss.on("connection", async (ws, req) => {
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
          users: onlineUsers,
        },
      }),
    );
  });

  ws.on("message", (event) => {
    const parsedData = JSON.parse(event.toString());

    if (parsedData.type === "JOIN") {
      onlineUsers.set();
    }
  });
});
