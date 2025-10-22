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

router.post("/", authorize("STUDENT"), sendInvitation);
router.get("/", authorize("STUDENT"), listInvitations);
router.post(
  "/:invitation_id/respond",
  authorize("STUDENT"),
  respondToInvitation
);

export default router;
