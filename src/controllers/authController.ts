import { NextFunction, Request, Response } from "express";
import * as AuthService from "../services/SerivicesUsers";
import { deleteUserService } from "../services/SerivicesUsers";
import { CreateUserInput, LoginUserInput } from "../schemas/user.schemas";
import { asyncHandler } from "../middlewares/errorHandler";
import { ApiResponse, AuthenticatedRequest } from "../types/common.types";

import {
  getAllUsersService,
  getUserByIdService,
  updateUserService
} from "../services/SerivicesUsers";

// Register
export const register = asyncHandler(async (
  req: AuthenticatedRequest & CreateUserInput, 
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  
  const message = await AuthService.registerUserService(req.body);
  res.status(201).json({ 
    success:true,
    message:"successfully registered.check the email to verify",
    data:{
      id:message.user_id,
      username:message.username,
      email:message.email,
      role:message.role
    }
   });
});

// Verify Email
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const message = await AuthService.verifyEmailService(req.query.token as string);
  res.json({ message });
});

// Resend Verification Email
export const resendVerificationEmail = asyncHandler(async (req: Request, res: Response) => {
  const message = await AuthService.resendVerificationEmailService(req.body.email);
  res.json({ message });
});

// Forgot Password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const message = await AuthService.forgotPasswordService(req.body.email);
  res.json({ message });
});

// Reset Password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const message = await AuthService.resetPasswordService(req.body.token, req.body.newPassword);
  res.json({ message });
});

// Login
export const login = asyncHandler(async (
  req: AuthenticatedRequest & LoginUserInput, 
  res: Response<ApiResponse>,
  next:NextFunction
) => {
  const data = await AuthService.loginService(req.body.email, req.body.password);
 res.status(201).json({ 
    success:true,
    message:"successfully registered.check the email to verify",
    data:{
      token:data.token
    }
   });
});



export const deleteUserController = asyncHandler(async (req: Request, res: Response) => {
  const adminIdStr = req.userId;
  if (!adminIdStr) {
    res.status(401);
    throw new Error("Unauthorized: admin ID missing");
  }

  const adminId = Number(adminIdStr);
  if (isNaN(adminId)) {
    res.status(401);
    throw new Error("Unauthorized: invalid admin ID");
  }

  const userIdToDelete = parseInt(req.params.id);
  if (isNaN(userIdToDelete)) {
    res.status(400);
    throw new Error("Invalid user ID");
  }

  const result = await deleteUserService(adminId, userIdToDelete);
  res.status(200).json(result);
});




// Get User by ID (Admin only)
export const getUserByIdController = asyncHandler(async (req: Request, res: Response) => {
  const adminIdStr = req.userId;
  const userIdStr = req.params.id;

  if (!adminIdStr) {
    res.status(401);
    throw new Error("Unauthorized: admin ID missing");
  }

  const adminId = Number(adminIdStr);
  const userId = Number(userIdStr);

  const user = await getUserByIdService(adminId, userId);
  res.status(200).json({ success: true, data: user });
});

// Update User (Admin only)
export const updateUserController = asyncHandler(async (req: Request, res: Response) => {
  const adminIdStr = req.userId;
  const userIdStr = req.params.id;

  if (!adminIdStr) {
    res.status(401);
    throw new Error("Unauthorized: admin ID missing");
  }

  const adminId = Number(adminIdStr);
  const userId = Number(userIdStr);

  const updatedUser = await updateUserService(adminId, userId, req.body);
  res.status(200).json({ success: true, message: "User updated successfully", data: updatedUser });
});