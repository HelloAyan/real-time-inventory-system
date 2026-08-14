import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import dropsRoutes from "./modules/drops/drops.routes.js";
import reservationsRoutes from "./modules/reservations/reservations.routes.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Your backend server is running");
});

app.get("/health", (req, res) => res.json({ success: true, status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/drops", dropsRoutes);
app.use("/api/reservations", reservationsRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
