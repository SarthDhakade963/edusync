import { Request, Response } from "express";
import prisma from "../config/prismaClient";

interface CreateGroup {
  name: string;
  description: string;
}

export const createGroup = async (
  req: Request<{}, {}, CreateGroup>,
  res: Response
): Promise<Response> => {
  try {
    const { name, description }: CreateGroup = req.body;
    const userId = (req as any).user.id;

    const existingGroup = await prisma.group.findUnique({
      where: { name: name },
    });

    if (existingGroup) {
      return res.status(400).json({ message: "Group already exists" });
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        ownerId: userId,
        members: {
          create: {
            userId,
          },
        },
      },

      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return res
      .status(201)
      .json({ message: "Group created successfully", group });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const listStudentGroups = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const groups = await prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            members: {
              include: { user: true },
            },
          },
        },
      },
    });

    const userGroups = groups.map((gm: { group: any }) => gm.group);

    return res.status(201).json({ groups: userGroups });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const groupDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(404).json({ message: "Group id required" });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: { include: { user: true } },
        submissions: { include: { submitor: true, assignment: true } },
      },
    });

    if (!group)
      return res.status(404).json({ message: "Group does not exist" });

    if (role === "STUDENT") {
      const isMember = group?.members?.some(
        (m: { userId: string }) => m.userId === userId
      );
      if (!isMember) return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json({ group });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const listAllGroups = async (req: Request, res: Response) => {
  try {
    // Only admin can access this route (enforced by authorize middleware)
    const groups = await prisma.group.findMany({
      include: {
        members: { include: { user: true } }, // List all members
        submissions: { include: { submitor: true, assignment: true } }, // Submission details
        assignments: true, // List assignments for group
      },
    });

    return res.status(200).json({ groups });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
