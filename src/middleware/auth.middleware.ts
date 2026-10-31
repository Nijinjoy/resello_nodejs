import { NextFunction, Request, Response } from "express";

import { findUserById, UserRow } from "../services/auth.service";
import { verifyToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: UserRow;
    }
  }
}

const unauthorized = (res: Response) => {
  return res.status(401).json({
    success: false,
    message: "Authentication required",
  });
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return unauthorized(res);
  }

  let userId: string;

  try {
    userId = verifyToken(header.slice("Bearer ".length));
  } catch {
    return unauthorized(res);
  }

  const user = await findUserById(userId);

  if (!user) {
    return unauthorized(res);
  }

  req.user = user;

  next();
};

// Use after `authenticate` on every route that needs a registered user.
export const requireCompleteProfile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.is_profile_complete) {
    return res.status(403).json({
      success: false,
      message: "Complete your profile to continue",
    });
  }

  next();
};
