import "tsconfig-paths/register";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import pinoHttp from "pino-http";
import { appLogger } from "./utils/logger";
import cookieParser from "cookie-parser";
import { csrfProtection } from "@config/csrf";
import authRouter from "./modules/auth/routes/auth.routes";
import { userRouter } from "@modules/user";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cookieParser());
app.use(express.json());

app.use(pinoHttp({ logger: appLogger }));

app.use(helmet());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET","HEAD","PUT","PATCH","POST","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-Session-ID"],
}));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// CSRF token endpoint - requires session ID in headers
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  const token = res.locals.csrfToken;
  res.json({ csrfToken: token });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.listen(PORT, () => {
  appLogger.info(`Server is running on port ${PORT}`);
});

export default app;
