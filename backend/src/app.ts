import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.routes";
import plansRoutes from "./modules/plans/plans.routes";
import  investmentsRouter  from "./modules/investments/investments.routes";
import { referralsRouter } from "./modules/referrals/referrals.routes";
import   walletRouter  from "./modules/wallet/wallet.routes";
import   adminRouter  from "./modules/admin/admin.routes";
import { pricesRouter } from "./modules/prices/prices.routes";
import { errorHandler } from "./middleware/errorHandler";
import dashboardRoutes from "./routes/dashboardRoutes";
import withdrawalRouter from "./modules/withdrawal/withdrawal.routes";
import referralRoutes from "./routes/referralRoutes";
import securityRoutes from "./routes/securityRoutes";
import notificationsRoutes from "./routes/notificationRoutes";
// import turnstileRouter from "./modules/security/turnstile.routes";



export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/auth", authRouter);
app.use("/api/plans", plansRoutes);
app.use("/api/investments", investmentsRouter);
app.use("/api/referrals", referralsRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/admin", adminRouter);
app.use("/api/prices", pricesRouter);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/withdrawals", withdrawalRouter);
app.use("/api/referrals", referralRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/notifications", notificationsRoutes);
// app.use("/api/security", turnstileRouter);


// error
app.use(errorHandler);
