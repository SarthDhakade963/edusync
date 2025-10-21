import express from "express";
import {
  addUser,
  createGroup,
  groupDetails,
  listStudentGroups,
} from "../controllers/groupController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = express.Router();
router.use(authenticate);

router.post("/", createGroup);
router.post("/add-user", authorize("ADMIN"), addUser);
router.get("/:groupId", authorize("STUDENT"), groupDetails);
router.get("/members", authorize("STUDENT"), listStudentGroups);

export default router;
