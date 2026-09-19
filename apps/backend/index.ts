import express from "express";
import { authRouter } from "./routes/auth.routes";

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRouter);

const port = Number(process.env.PORT ?? 4000);

app.listen(port, "0.0.0.0", () => {
  console.log("server is running at ", port);
});
