import express from "express";
import { login, me, refresh, register } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();
router.post("/signup", register);
router.post("/login", login);
router.get("/me", authenticate, me);
router.post("/refresh", authenticate, refresh);

export default router;
