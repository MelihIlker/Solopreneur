import "tsconfig-paths/register";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import pinoHttp from "pino-http";
import { appLogger } from "./utils/logger";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/routes/auth.routes";
import { userRouter } from "@modules/user";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cookieParser());

app.use(pinoHttp({ logger: appLogger }));

app.use(helmet());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET","HEAD","PUT","PATCH","POST","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)

app.listen(PORT, () => {
  appLogger.info(`Server is running on port ${PORT}`);
});

export default app;
