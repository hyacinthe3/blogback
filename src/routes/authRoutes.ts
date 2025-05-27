import { Router } from "express";
import { register, login } from "../controllers/authController";
import { verifyEmail } from '../controllers/authController'; // adjust if needed
import { resendVerificationEmail } from "../controllers/authController";
import { forgotPassword } from "../controllers/authController";
import { resetPassword } from "../controllers/authController";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get('/verify-email', verifyEmail);
router.post('/resendverification',resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',resetPassword);

export default router;
