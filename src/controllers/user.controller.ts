import { Request, Response } from "express";
import { toPublicUser } from "../services/auth.service";

export const getUserProfileController = (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: { user: toPublicUser(req.user!) },
  });
};
