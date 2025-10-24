import { Request, Response } from "express";
import prisma from "../config/prismaClient";
import { InvitationBody } from "../utils/types";

export const sendInvitation = async (req: Request, res: Response) => {
  try {
    const fromUser = (req as any).user;
    const fromUserId = fromUser.id;
    const { groupId, toUserEmail }: InvitationBody = req.body;

    console.log("Invitation Body :", req.body);

    const toUser = await prisma.user.findUnique({
      where: { email: toUserEmail },
    });

    if (!toUser) {
      return res.status(404).json({ message: "User does not exists" });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ message: "Group does not exists" });
    }

    if (group.ownerId !== fromUserId)
      return res
        .status(403)
        .json({ message: "Only group owner can send invites" });

    const existingInvite = await prisma.invitation.findFirst({
      where: {
        groupId: groupId,
        invited_to: toUser.id,
        invited_by: fromUserId,
        status: "PENDING",
      },
    });

    if (existingInvite)
      return res.status(400).json({ message: "Invite already exists" });

    const invitation = await prisma.invitation.create({
      data: {
        groupId,
        invited_by: fromUserId,
        invited_to: toUser.id,
      },
    });

    return res.status(201).json({ message: "Invitation sent", invitation });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const respondToInvitation = async (req: Request, res: Response) => {
  try {
    const respondId = (req as any).user.id;
    const { invitation_id } = req.params;
    const { accept } = req.body;

    console.log("Invitation Request Body: ", req.body);

    if (!invitation_id) {
      return res.status(400).json({ message: "Invitation ID is required" });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitation_id },
    });

    if (!invitation || invitation.invited_to !== respondId) {
      return res.status(404).json({ message: "Invitation does not exists" });
    }

    const updated = await prisma.invitation.update({
      where: { id: invitation_id },
      data: { status: accept ? "ACCEPTED" : "DECLINED" },
    });

    if (accept) {
      const alreadyMember = await prisma.groupMember.findFirst({
        where: { groupId: invitation.groupId, userId: respondId },
      });
      if (!alreadyMember) {
        await prisma.groupMember.create({
          data: { groupId: invitation.groupId, userId: respondId },
        });
      }
    }

    return res.status(200).json({
      message: `Invitation ${accept ? "accepted" : "rejected"}`,
      updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const listInvitations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const invitations = await prisma.invitation.findMany({
      where: { invited_to: userId, status: "PENDING" },
      include: {
        invitor: true,
        group: true,
      },
    });

    return res.status(200).json({ invitations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
