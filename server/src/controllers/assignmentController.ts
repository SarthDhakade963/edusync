import prisma from "../config/prismaClient";
import { Request, Response } from "express";
interface Assignment {
  title: string;
  description: string;
  due_date: string;
  onedrive_link: string;
  groupId: string;
}

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { title, description, due_date, onedrive_link, groupId }: Assignment =
      req.body;

    console.log("Assignment request body", req.body);

    if (!title || !due_date || !onedrive_link || !groupId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User does not exists" });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ message: "Group does not exists" });
    }
    const assignment = await prisma.assignment.create({
      data: {
        created_by: userId,
        title,
        description,
        due_date: new Date(due_date),
        onedrive_link,
        groupId: groupId,
      },

      include: {
        group: true,
      },
    });

    return res
      .status(201)
      .json({ message: "Assignment created succcessfully", assignment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const listGroupAssignments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(404).json({ message: "GroupID is required" });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    console.log(group);

    const assignments = await prisma.assignment.findMany({
      where: {
        group: { id: groupId },
      },
      include: {
        group: true,
        submission: {
          where: { submitted_by: userId },
          include: { submitor: true },
        },
      },
    });

    console.log(assignments);

    return res.status(200).json({ assignments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const listAllAssignments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const assignments = await prisma.assignment.findMany({
      where: {
        created_by: userId,
      },
      include: {
        group: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, role: true },
                },
              },
            },
            submissions: {
              include: {
                submitor: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });

    return res.status(200).json({ assignments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const listAssignmentSubmissionsForGroup = async (
  req: Request,
  res: Response
) => {
  try {
    const { assignmentId } = req.params;

    if (!assignmentId) {
      return res.status(400).json({ message: "assignmentId is required" });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        id: true,
        title: true,
        group: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const groupId = assignment!.group.id;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Fetch submissions of this assignment in this group
    const submissions = await prisma.submission.findMany({
      where: { assignmentId, groupId },
      include: {
        submitor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Map submissions to all members
    const studentsWithSubmissions = group.members.map((member: any) => {
      const submission = submissions.find(
        (sub: any) => sub.submitted_by === member.userId
      );

      return {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        submissionLink: submission ? submission.submissionLink : "-",
        submissionDate: submission?.confirmed_at
          ? submission.confirmed_at.toISOString()
          : "-",
        submissionStatus: submission ? submission.status : "NOT_SUBMITTED",
      };
    });

    return res.status(200).json({
      assignmentId,
      groupId,
      students: studentsWithSubmissions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
