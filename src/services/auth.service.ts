import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

import { pool } from "../config/database";
import {
  twilioClient,
  verifyServiceSid,
} from "../config/twilio";
import { PROFILE_PICTURES_DIR } from "../config/uploads";
import { CompleteProfileInput } from "../validators/auth.validator";

export interface UserRow {
  id: string;
  phone_number: string;
  full_name: string | null;
  email: string | null;
  profile_picture: string | null;
  is_verified: boolean;
  is_profile_complete: boolean;
}

export interface ProfilePictureFile {
  buffer: Buffer;
  extension: string;
}

export class ProfileConflictError extends Error {}

const POSTGRES_UNIQUE_VIOLATION = "23505";

export const toPublicUser = (user: UserRow) => ({
  id: user.id,
  phoneNumber: user.phone_number,
  fullName: user.full_name,
  email: user.email,
  profilePicture: user.profile_picture,
  isVerified: user.is_verified,
  isProfileComplete: user.is_profile_complete,
});

export const sendOtp = async (phoneNumber: string) => {
  const verification = await twilioClient.verify.v2
    .services(verifyServiceSid)
    .verifications.create({
      to: phoneNumber,
      channel: "sms",
    });

  return {
    status: verification.status,
    phoneNumber: verification.to,
  };
};

export const verifyOtp = async (
  phoneNumber: string,
  code: string
) => {
  const verification = await twilioClient.verify.v2
    .services(verifyServiceSid)
    .verificationChecks.create({
      to: phoneNumber,
      code,
    });

  return {
    status: verification.status,
    valid: verification.status === "approved",
  };
};

export const findOrCreateVerifiedUser = async (
  phoneNumber: string
) => {
  const { rows } = await pool.query<UserRow>(
    `INSERT INTO users (phone_number, is_verified)
     VALUES ($1, true)
     ON CONFLICT (phone_number)
     DO UPDATE SET is_verified = true, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [phoneNumber]
  );

  return rows[0];
};

export const findUserById = async (id: string) => {
  const { rows } = await pool.query<UserRow>(
    "SELECT * FROM users WHERE id = $1",
    [id]
  );

  return rows[0] ?? null;
};

export const completeProfile = async (
  userId: string,
  { fullName, email }: CompleteProfileInput,
  picture?: ProfilePictureFile
) => {
  let picturePath: string | null = null;
  let pictureFilePath: string | null = null;

  if (picture) {
    const fileName = `${randomUUID()}.${picture.extension}`;

    pictureFilePath = path.join(PROFILE_PICTURES_DIR, fileName);
    picturePath = `/uploads/profile-pictures/${fileName}`;

    await mkdir(PROFILE_PICTURES_DIR, { recursive: true });
    await writeFile(pictureFilePath, picture.buffer);
  }

  try {
    const { rows } = await pool.query<UserRow>(
      `UPDATE users
       SET full_name = $2,
           email = $3,
           profile_picture = $4,
           is_profile_complete = true,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND is_profile_complete = false
       RETURNING *`,
      [userId, fullName, email, picturePath]
    );

    if (!rows[0]) {
      throw new ProfileConflictError("Profile is already completed");
    }

    return rows[0];
  } catch (error: any) {
    if (pictureFilePath) {
      await unlink(pictureFilePath).catch(() => undefined);
    }

    if (error.code === POSTGRES_UNIQUE_VIOLATION) {
      throw new ProfileConflictError("Email is already in use");
    }

    throw error;
  }
};
