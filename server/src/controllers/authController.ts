import bcrypt from "bcryptjs";
import prisma from "../config/prismaClient";
import { Request, Response } from "express";
import { LoginBody, RegisterBody } from "../utils/types";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import jwt from "jsonwebtoken";

export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response
): Promise<Response> => {
  try {
    const { name, email, password, role }: RegisterBody = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
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

  console.log("When logged in access token", accessToken);

  const refreshToken = generateRefreshToken(payload);

  console.log("When logged in refresh token", refreshToken);

  return res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      path: "/",
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      path: "/",
    })
    .json({
      message: "Login Successful",
      user,
      accessToken,
      refreshToken,
      currentUser: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      console.warn("🚫 No refresh token found in cookies");
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { id: string; email: string; role: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newAccessToken = generateAccessToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "none",
      path: "/",
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      path: "/",
    });

    return res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
