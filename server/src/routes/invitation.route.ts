import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import {
  listInvitations,
  respondToInvitation,
  sendInvitation,
} from "../controllers/invitationController";

const router = express.Router();
router.use(authenticate, authorize("STUDENT"));

router.post("/", sendInvitation);
router.get("/", listInvitations);
router.post("/:invitation_id/respond", respondToInvitation);

export default router;
