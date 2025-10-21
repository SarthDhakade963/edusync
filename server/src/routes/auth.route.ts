import express from "express";
import { login, register } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();
router.use(authenticate);
router.post("/signup", register);
router.post("/login", login);

export default router;
