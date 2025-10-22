import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import {
  createAssignment,
  listAllAssignments,
  listGroupAssignments,
} from "../controllers/assignmentController";

const router = express.Router();

router.use(authenticate);
router.post("/", authorize("ADMIN"), createAssignment);
router.get("/:groupId", authorize("STUDENT"), listGroupAssignments);
router.get("/", authorize("ADMIN"), listAllAssignments);

export default router;
