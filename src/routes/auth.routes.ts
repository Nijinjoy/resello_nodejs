import { Router } from "express";

import {
  completeProfileController,
  sendOtpController,
  verifyOtpController,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { uploadProfilePicture } from "../middleware/upload.middleware";

const router = Router();

router.post("/send-otp", sendOtpController);

router.post("/verify-otp", verifyOtpController);

router.post(
  "/complete-profile",
  authenticate,
  uploadProfilePicture,
  completeProfileController
);

export default router;