import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

// Middleware to restrict access based on roles
export const authorize = (...roles: ("ADMIN" | "STUDENT")[]) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden. You do not have access." });
    }

    return next();
  };
};
