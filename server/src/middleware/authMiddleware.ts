import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "STUDENT";
  };
}

interface JwtPayload {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "STUDENT";
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  try {
    const token =
      req.cookies.accessToken || req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized. Token missing." });
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as JwtPayload;

    req.user = {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch (error) {
    console.error(error);
    return res.json(401).json({ message: "Unauthorized. Invalid token" });
  }
};
