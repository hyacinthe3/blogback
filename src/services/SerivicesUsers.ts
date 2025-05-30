import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { Users } from "../entities/User";
import { Token, TokenType } from "../entities/token";
import { sendEmail } from "../utils/nodemailer";
import { tokengeneration } from "../utils/tokengeneration";
import { validateEntity } from "../utils/validate";
import { UserRole } from "../entities/User";
import { ConflictError,ForbiddenError,NotFoundError } from "../utils/errors";

const userRepository = AppDataSource.getRepository(Users);
const tokenRepository = AppDataSource.getRepository(Token);
const URL = "http://localhost:4000";

export const registerUserService = async ({ email, username, password, role }: any) => {
  // Normalize email
  email = email.toLowerCase().trim();

  // Decide user role
const roleToAssign: UserRole = role?.trim().toLowerCase() === "admin" ? "Admin" : "User";

  // Check if email already exists
  const existingUser = await userRepository.findOneBy({ email });
  if (existingUser) throw new ConflictError("Email already exists");

  // Only allow one admin
  if (roleToAssign === "Admin") {
    const existingAdmin = await userRepository.findOneBy({ role: "Admin" });
    if (existingAdmin) throw new ConflictError("Only one Admin is allowed in the system");
  }

  // Create user instance
  const user = new Users();
  user.username = username;
  user.email = email;
  user.password = await bcrypt.hash(password, 10);
  user.isVerified = false;
  user.role = roleToAssign;

  // Validate & save user
  await validateEntity(user);
  await userRepository.save(user);

  // Generate token for email verification
  const token = new Token();
  token.user = user;
  token.token = tokengeneration();
  token.token_type = TokenType.EMAIL_VERIFICATION;
  token.expirationData = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h expiry
  await tokenRepository.save(token);

  // ✅ Generate link and send to the actual user email
  const link = `${URL}/auth/verify-email?token=${token.token}`;
  await sendEmail(
    email, // <- user's actual email they entered
    "Verify your email",
    `<p>Hello ${username},</p>
     <p>Please verify your email by clicking the link below:</p>
     <a href="${link}">${link}</a>`
  );

  // Return user info (without password)
  return user;
};

export const verifyEmailService = async (token: string) => {
  const tokenEntity = await tokenRepository.findOne({
    where: { token, token_type: TokenType.EMAIL_VERIFICATION },
    relations: ["user"],
  });

  if (!tokenEntity) throw { status: 400, message: "Invalid token" };
  if (tokenEntity.expirationData < new Date()) {
    await tokenRepository.remove(tokenEntity);
    throw { status: 400, message: "Token expired" };
  }

  tokenEntity.user.isVerified = true;
  await userRepository.save(tokenEntity.user);
  await tokenRepository.remove(tokenEntity);

  return "Email verified. You can now log in.";
};

export const resendVerificationEmailService = async (email: string) => {
  const user = await userRepository.findOneBy({ email });
  if (!user) throw { status: 404, message: "User not found" };
  if (user.isVerified) return "User is already verified";

  const oldToken = await tokenRepository.findOne({
    where: {
      user: { user_id: user.user_id },
      token_type: TokenType.EMAIL_VERIFICATION
    }
  });
  if (oldToken) await tokenRepository.remove(oldToken);

  const token = new Token();
  token.user = user;
  token.token = tokengeneration();
  token.token_type = TokenType.EMAIL_VERIFICATION;
  token.expirationData = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await tokenRepository.save(token);

  const link = `${URL}/auth/verify-email?token=${token.token}`;
  await sendEmail(
    email,
    "Verify Email (Resend)",
    `<p>Hello ${user.username},</p><p>Click to verify:</p><a href="${link}">${link}</a>`
  );

  return "Verification email resent";
};

export const forgotPasswordService = async (email: string) => {
  const user = await userRepository.findOneBy({ email });
  if (!user) throw { status: 404, message: "User not found" };

  const token = new Token();
  token.user = user;
  token.token = tokengeneration();
  token.token_type = TokenType.RESET_PASSWORD;
  token.expirationData = new Date(Date.now() + 1 * 60 * 60 * 1000);
  await tokenRepository.save(token);

  const link = `${process.env.FRONTEND_URL || URL}/auth/reset-password?token=${token.token}`;
  await sendEmail(email, "Reset Password", `<p>Reset password:</p><a href="${link}">${link}</a>`);

  return "Reset link sent";
};

export const resetPasswordService = async (token: string, newPassword: string) => {
  const tokenEntity = await tokenRepository.findOne({
    where: { token, token_type: TokenType.RESET_PASSWORD },
    relations: ["user"],
  });

  if (!tokenEntity || tokenEntity.expirationData < new Date()) {
    throw { status: 400, message: "Token is invalid or expired" };
  }

  tokenEntity.user.password = await bcrypt.hash(newPassword, 10);
  await userRepository.save(tokenEntity.user);
  await tokenRepository.delete(tokenEntity.id);

  return "Password reset successful";
};

export const loginService = async (email: string, password: string) => {
  const user = await userRepository.findOneBy({ email });
  if (!user || !await bcrypt.compare(password, user.password)) throw new NotFoundError("Invalid email or password");

  if (!user.isVerified) throw new ForbiddenError ("Please verify your email before logging in." );

  const secret = process.env.JWT_SECRET || "secret123";
  const token = jwt.sign({ userId: user.user_id }, secret, { expiresIn: "1d" });

  return { token, username: user.username };
};



export const deleteUserService = async (adminId: number, userIdToDelete: number) => {
  const requestingUser = await userRepository.findOneBy({ user_id: adminId });

  if (!requestingUser || requestingUser.role !== "Admin") {
    throw { status: 403, message: "Only admins can delete users" };
  }

  if (adminId === userIdToDelete) {
    throw { status: 403, message: "Admins cannot delete themselves" };
  }

  const userToDelete = await userRepository.findOneBy({ user_id: userIdToDelete });
  if (!userToDelete) {
    throw { status: 404, message: "User not found" };
  }

  if (userToDelete.role === "Admin") {
    throw { status: 403, message: "Cannot delete another admin" };
  }

  await userRepository.remove(userToDelete);
  return { message: "User deleted successfully" };
};


// Get all users - Admin only
export const getAllUsersService = async (adminId: number) => {
  const admin = await userRepository.findOneBy({ user_id: adminId });
  if (!admin || admin.role !== "Admin") {
    throw new ForbiddenError("Only admins can view users");
  }

  const users = await userRepository.find();
  return users.map(({ password, ...user }) => user); // Exclude passwords
};

// Get single user by ID - Admin only
export const getUserByIdService = async (adminId: number, userId: number) => {
  const admin = await userRepository.findOneBy({ user_id: adminId });
  if (!admin || admin.role !== "Admin") {
    throw new ForbiddenError("Only admins can view user details");
  }

  const user = await userRepository.findOneBy({ user_id: userId });
  if (!user) throw new NotFoundError("User not found");

  const { password, ...safeUser } = user;
  return safeUser;
};

// Update a user (username or email) - Admin only
export const updateUserService = async (
  adminId: number,
  userId: number,
  data: { username?: string; email?: string }
) => {
  const admin = await userRepository.findOneBy({ user_id: adminId });
  if (!admin || admin.role !== "Admin") {
    throw new ForbiddenError("Only admins can update users");
  }

  const user = await userRepository.findOneBy({ user_id: userId });
  if (!user) throw new NotFoundError("User not found");

  // Check if new email already exists (excluding the current user)
  if (data.email && data.email !== user.email) {
    const existingUser = await userRepository.findOneBy({ email: data.email });
    if (existingUser) throw new ConflictError("Email already exists");
    user.email = data.email.toLowerCase().trim();
  }

  if (data.username) {
    user.username = data.username;
  }

  await userRepository.save(user);
  const { password, ...safeUser } = user;
  return safeUser;
};

