import bcrypt from "bcryptjs";
import prisma from "../config/prismaClient";
import { Request, Response } from "express";
import { LoginBody, RegisterBody } from "../utils/types";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response
): Promise<Response> => {
  try {
    const { name, email, password, role }: RegisterBody = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email already requests" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        role: role || "STUDENT",
      },
    });

    return res.status(201).json({ message: "User saved successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const login = async (
  req: Request<{}, {}, LoginBody>,
  res: Response
): Promise<Response> => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: "User does not exists" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: "Password is Incorrect" });
  }

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
    })
    .json({
      message: "Login Successful",
      user,
      currentUser: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};
