import prisma from "../config/prismaClient";
import { Request, Response } from "express";
interface Assignment {
  title: string;
  description: string;
  due_date: string;
  onedrive_link: string;
  groupIds: string[];
}

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const {
      title,
      description,
      due_date,
      onedrive_link,
      groupIds,
    }: Assignment = req.body;

    if (!title || !due_date || !onedrive_link || !groupIds?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User does not exists" });
    }

    const groups = await prisma.group.findMany({
      where: { id: { in: groupIds } },
    });

    if (groups.length !== groupIds.length) {
      return res
        .status(404)
        .json({ message: "One or more groups do not exist" });
    }

    const assignment = await prisma.assignment.create({
      data: {
        created_by: userId,
        title,
        description,
        due_date: new Date(due_date),
        onedrive_link,
        group: {
          connect: groupIds.map((id) => ({ id })),
        },
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

    const assignments = await prisma.assignment.findMany({
      where: {
        group: { some: { id: groupId } },
      },
      include: {
        group: true,
        submission: {
          where: { submitted_by: userId },
          include: { submitor: true },
        },
      },
    });

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
