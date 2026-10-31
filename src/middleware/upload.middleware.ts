import { NextFunction, Request, Response } from "express";
import multer from "multer";

import { MAX_PROFILE_PICTURE_BYTES } from "../config/uploads";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PROFILE_PICTURE_BYTES, files: 1 },
}).single("profilePicture");

// The file type comes from the bytes themselves, because the client controls
// both the filename and the mimetype it declares.
const detectImageExtension = (buffer: Buffer) => {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return "jpg";
  }

  if (
    buffer
      .subarray(0, 8)
      .equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      )
  ) {
    return "png";
  }

  if (
    buffer.subarray(0, 4).toString("latin1") === "RIFF" &&
    buffer.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return "webp";
  }

  return null;
};

const uploadErrorMessage = (error: unknown) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return "Profile picture must be 5 MB or smaller";
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return "Upload a single file in the profilePicture field";
    }
  }

  return "Invalid file upload";
};

export const uploadProfilePicture = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload(req, res, (error: unknown) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: uploadErrorMessage(error),
      });
    }

    if (!req.file) {
      return next();
    }

    const extension = detectImageExtension(req.file.buffer);

    if (!extension) {
      return res.status(400).json({
        success: false,
        message: "Profile picture must be a JPEG, PNG or WebP image",
      });
    }

    res.locals.profilePictureExtension = extension;

    next();
  });
};
