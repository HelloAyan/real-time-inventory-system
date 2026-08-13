import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ success: true, status: "ok" }));

app.use("/api/auth", authRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
