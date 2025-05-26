"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const User_1 = require("../entities/User");
const validate_1 = require("../utils/validate");
const userRepository = index_1.AppDataSource.getRepository(User_1.User);
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await userRepository.findOneBy({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const user = new User_1.User();
        user.username = username;
        user.email = email;
        user.password = await bcryptjs_1.default.hash(password, 10);
        await (0, validate_1.validateEntity)(user);
        await userRepository.save(user);
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userRepository.findOneBy({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const secret = process.env.JWT_SECRET || "secret123";
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, secret, { expiresIn: "1d" });
        res.json({ token, username: user.username });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.login = login;
