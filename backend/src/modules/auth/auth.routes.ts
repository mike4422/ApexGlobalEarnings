import { Router } from "express";
import { register, login, me, verifyEmail, resendVerification } from "./auth.controller";
import { requireAuth } from "../../middleware/auth";
import { updateProfile, changePassword, forgotPassword,
  resetPassword } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", requireAuth, me);

// NEW:
authRouter.get("/verify-email", verifyEmail);
authRouter.post("/resend-verification", requireAuth, resendVerification);

// ✅ NEW
authRouter.put("/profile", requireAuth, updateProfile);
authRouter.post("/change-password", requireAuth, changePassword);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
