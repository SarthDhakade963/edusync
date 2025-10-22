import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import {
  submitAssignment,
  listSubmissionByAssignment,
} from "../controllers/submissionController";

const router = express.Router();

router.use(authenticate);
router.post("/", authorize("STUDENT"), submitAssignment);
router.get("/:assignmentId", authorize("ADMIN"), listSubmissionByAssignment);

export default router;
