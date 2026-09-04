import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";

import { environment } from "./config/environment.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { authRouter } from "./routes/authRoutes.js";
import { healthRouter } from "./routes/healthRoutes.js";
import { rbacRouter } from "./routes/rbacRoutes.js";
import { requestRouter } from "./routes/requestRoutes.js";
import { roleRequestRouter } from "./routes/roleRequestRoutes.js";
import { approvalRouter } from "./routes/approvalRoutes.js";

export const app = express();

app.use(
  cors({
    credentials: true,
    origin: environment.webOrigin,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/rbac", rbacRouter);
app.use("/api/requests", requestRouter);
app.use("/api/role-requests", roleRequestRouter);
app.use("/api/approvals", approvalRouter);

app.use(notFound);
app.use(errorHandler);
