import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import {
  submitAssignment,
  getSubmissionOfAssignment,
} from "../controllers/submissionController";

const router = express.Router();

router.use(authenticate);
router.post("/", authorize("STUDENT"), submitAssignment);
router.get("/:assignmentId", authorize("STUDENT"), getSubmissionOfAssignment);

export default router;
