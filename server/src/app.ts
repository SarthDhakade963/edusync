import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import groupRoutes from "./routes/group.route";
import invitationRoutes from "./routes/invitation.route";
import assignmentRoutes from "./routes/assignment.route";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/invitation", invitationRoutes);
app.use("/api/assignment", assignmentRoutes);

export default app;
