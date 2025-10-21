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

router.post("/group", authorize("ADMIN"), createGroup);
router.post("/group/add-user", authorize("STUDENT"), addUser);
router.get("/group/:groupId", authorize("STUDENT"), groupDetails);
router.get("/group-members", authorize("STUDENT"), listStudentGroups);

export default router;
