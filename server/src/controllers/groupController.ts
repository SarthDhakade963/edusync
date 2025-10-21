import { Request, Response } from "express";
import prisma from "../config/prismaClient";

interface CreateGroup {
  name: string;
  description?: string;
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
            isOwner: true,
          },
        },
      },

      include: {
        members: {
          user: true,
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

export const addUser = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.body;
    const { userEmail } = req.body;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ message: "Group does not exist" });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const existing = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: user.id,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ message: "User already a Group Memeber" });
    }

    const member = await prisma.groupMember.create({
      data: {
        groupId: groupId,
        userId: user.id,
      },
    });

    return res
      .status(201)
      .json({ message: "User added to the Group successfully", member });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const groupDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { groupId } = req.params;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: { include: { user: true } } },
    });

    if (!group) {
      return res.status(404).json({ message: "Group does not exist" });
    }

    const isMember = group.members.some(
      (m: { userId: string }) => m.userId === userId
    );
    if (!isMember) return res.status(403).json({ message: "Access denied" });

    return res.status(200).json({
      group,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server error" });
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

    return res.status(200).json({ groups: userGroups });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
