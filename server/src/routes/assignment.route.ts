import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import {
  createAssignment,
  listAllAssignments,
  listAssignmentSubmissionsForGroup,
  listGroupAssignments,

} from "../controllers/assignmentController";

const router = express.Router();
router.use(authenticate);

router.post("/", authorize("ADMIN"), createAssignment);
router.get("/:groupId", authorize("STUDENT"), listGroupAssignments);
router.get("/", authorize("ADMIN"), listAllAssignments);
router.get("/:assignmentId/student", authorize("ADMIN"), listAssignmentSubmissionsForGroup);

export default router;