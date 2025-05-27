import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { Users } from "../entities/User";
import { validateEntity } from "../utils/validate";
import { sendEmail } from "../utils/nodemailer";
import { tokengeneration } from "../utils/tokengeneration";
import { Token, TokenType } from "../entities/token"; // Import TokenType enum

const userRepository = AppDataSource.getRepository(Users);
const tokenRepository = AppDataSource.getRepository(Token);
const URL = "http://localhost:4000";

export const register = async (req: Request, res: Response) => {
  
  try {
    const email = req.body.email.toLowerCase().trim();
    const { username, password } = req.body;

    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    const user = new Users();
    user.username = username;
    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    user.isVerified = false;

    await validateEntity(user);
    await userRepository.save(user);

    const token = new Token();
    token.user = user;
    token.token = tokengeneration();
    token.token_type = TokenType.EMAIL_VERIFICATION;  // Use enum
    token.expirationData = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await tokenRepository.save(token);

    const link = `${URL}/auth/verify-email?token=${token.token}`;
    await sendEmail(
      email,
      "Verify your email",
      `<p>Hello ${username},</p><p>Please click the link to verify your email:</p><a href="${link}">${link}</a>`
    );

    res.status(201).json({ message: "User registered successfully. Check your email to verify." });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(400).json({ message: "Email already registered" });
    }
    res.status(400).json({ message: err.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (typeof token !== "string") {
      return res.status(400).json({ message: "Invalid token format" });
    }

    const tokenEntity = await tokenRepository.findOne({
      where: { token: token, token_type: TokenType.EMAIL_VERIFICATION },
      relations: ["user"],
    });

    if (!tokenEntity) return res.status(400).json({ message: "Invalid token" });

    if (tokenEntity.expirationData < new Date()) {
      await tokenRepository.remove(tokenEntity);
      return res.status(400).json({ message: "Token expired" });
    }

    tokenEntity.user.isVerified = true;
    await userRepository.save(tokenEntity.user);
    await tokenRepository.remove(tokenEntity);

    res.json({ message: "Email verified. You can now log in." });
  } catch (err: any) {
    console.error("Error verifying email:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await userRepository.findOneBy({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.json({ message: "User is already verified" });

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
      `<p>Hello ${user.username},</p><p>Click the new link to verify:</p><a href="${link}">${link}</a>`
    );

    res.json({ message: "Verification email resent" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const user = await userRepository.findOneBy({ email });

    if (!user) {
      // check if user exists
      return res.status(404).json({ message: "User not found" });
    }

    const token = new Token();
    token.user = user;
    token.token = tokengeneration();
    token.token_type = TokenType.RESET_PASSWORD;
    token.expirationData = new Date(Date.now() + 1 * 60 * 60 * 1000);
    await tokenRepository.save(token);

    const link = `${process.env.FRONTEND_URL || URL}/auth/reset-password?token=${token.token}`;

    await sendEmail(
      email,
      "Reset Password",
      `<p>Click the link to reset your password:</p><a href="${link}">${link}</a>`
    );

    return res.json({ message: "Reset link sent" });

  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};




export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;


    const tokenEntity = await tokenRepository.findOne({
      where: { token, token_type: TokenType.RESET_PASSWORD },
      relations: ["user"],
    });

    if (!tokenEntity || tokenEntity.expirationData < new Date()) {
      return res.status(400).json({ message: "Token is invalid or expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    tokenEntity.user.password = hashedPassword;
    await userRepository.save(tokenEntity.user);
    await tokenRepository.delete(tokenEntity.id);

    return res.json({ message: "Password reset successful" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await userRepository.findOneBy({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const secret = process.env.JWT_SECRET || "secret123";
    const token = jwt.sign({ userId: user.user_id }, secret, { expiresIn: "1d" });

    res.json({ token, username: user.username });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
