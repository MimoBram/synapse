import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import authRoutes from "./features/auth/auth.route";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Synapse API listening on port ${env.port}`);
});
