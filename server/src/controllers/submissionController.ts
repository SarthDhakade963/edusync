import { Request, Response } from "express";
import prisma from "../config/prismaClient";

interface AssignmentBody {
  assignmentId: string;
  groupId: string;
  submissionLink: string;
}
export const submitAssignment = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.id;
    const { assignmentId, groupId, submissionLink }: AssignmentBody = req.body;

    if (!assignmentId || !groupId || !submissionLink) {
      return res.status(400).json({ message: "Required fields not there" });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment does not exists" });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ message: "Group does not exists" });
    }

    const membership = await prisma.groupMember.findFirst({
      where: { groupId, userId: studentId },
    });

    if (!membership) {
      return res.status(404).json({ message: "Not member of this group" });
    }

    const existingSubmission = await prisma.submission.findFirst({
      where: { assignmentId, groupId, submitted_by: studentId },
    });

    if (existingSubmission) {
      return res.status(400).json({ message: "Already submitted" });
    }

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        groupId,
        submitted_by: studentId,
        status: "CONFIRMED",
        confirmed_at: new Date(),
        submissionLink,
      },
      include: {
        assignment: true,
        group: true,
      },
    });

    return res
      .status(201)
      .json({ message: "Assignment submitted", submission });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error (submitAssignment)" });
  }
};

export const listSubmissionByAssignment = async (
  req: Request,
  res: Response
) => {
  try {
    const { assignmentId } = req.params;

    if (!assignmentId) {
      return res.status(400).json({ message: "Assignment id not send" });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment does not exists" });
    }

    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      include: {
        submitor: {
          select: { id: true, name: true, email: true },
        },
        group: {
          select: { id: true, name: true },
        },
      },
      orderBy: { confirmed_at: "desc" },
    });

    return res.status(200).json({ submissions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};