import express from "express";
import {
  createGroup,
  groupDetails,
  listAllGroups,
  listStudentGroups,
} from "../controllers/groupController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = express.Router();
router.use(authenticate);

router.post("/", authorize("STUDENT"), createGroup);
router.get("/members", authorize("STUDENT"), listStudentGroups);
router.get("/all", authorize("ADMIN"), listAllGroups);
router.get("/:groupId", groupDetails);

export default router;
