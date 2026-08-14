import cors from "cors";
import express from "express";

import { environment } from "./config/environment.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { healthRouter } from "./routes/healthRoutes.js";

export const app = express();

app.use(
  cors({
    origin: environment.webOrigin,
  }),
);
app.use(express.json());

app.use("/health", healthRouter);

app.use(notFound);
app.use(errorHandler);
