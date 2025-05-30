import { Router } from "express";
import {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  deleteUserController,
//   getAllUsersController,
  getUserByIdController,
  updateUserController,
} from "../controllers/authController";
import { validate } from "../middlewares/validation.middleware";
import { createUserSchema, loginUserSchema, updateUserSchema } from "../schemas/user.schemas";
import { authMiddleware, requireAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Register
router.post("/register", validate(createUserSchema), register);

// Login
router.post("/login", validate(loginUserSchema), login);

// Email Verification
router.get("/verify-email", verifyEmail);
router.post("/resendverification", resendVerificationEmail);

// Password Reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Get all users (admin)
// router.get("/users", authMiddleware, requireAdmin, getAllUsersController);

// Get user by ID (admin or self)
router.get("/users/:id", authMiddleware, getUserByIdController);

// Update user by ID (admin or self)
router.put("/users/:id", authMiddleware, validate(updateUserSchema), updateUserController);

// Delete user by ID (admin only)
router.delete("/users/:id", authMiddleware, requireAdmin, deleteUserController);

export default router;
