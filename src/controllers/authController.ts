import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { validateEntity } from "../utils/validate";


const userRepository = AppDataSource.getRepository(User);

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = new User();
    user.username = username;
    user.email = email;
    user.password = await bcrypt.hash(password, 10);

    await validateEntity(user);

    await userRepository.save(user);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await userRepository.findOneBy({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const secret = process.env.JWT_SECRET || "secret123";

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "1d" });

    res.json({ token, username: user.username });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
