import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import groupRoutes from "./routes/group.route";
import invitationRoutes from "./routes/invitation.route";
import assignmentRoutes from "./routes/assignment.route";
import submissionRoutes from "./routes/submission.route";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.get("/health", (req, res) => res.status(200).json({ status: "OK" })); // health check
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/invitation", invitationRoutes);
app.use("/api/assignment", assignmentRoutes);
app.use("/api/submission", submissionRoutes);

export default app;
