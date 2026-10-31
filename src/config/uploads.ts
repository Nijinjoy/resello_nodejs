import path from "path";

export const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

export const PROFILE_PICTURES_DIR = path.join(
  UPLOADS_DIR,
  "profile-pictures"
);

export const MAX_PROFILE_PICTURE_BYTES = 5 * 1024 * 1024;
