import { Request, Response } from "express";
import { sendOtp, verifyOtp } from "../services/auth.service";

const isValidPhoneNumber = (phone: string) => {
  return /^\+[1-9]\d{7,14}$/.test(phone);
};

export const sendOtpController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phoneNumber } = req.body ?? {};

    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Valid phone number in E.164 format is required",
        ...(process.env.NODE_ENV !== "production" && {
          received: {
            contentType: req.headers["content-type"] ?? null,
            bodyKeys: Object.keys(req.body ?? {}),
            phoneNumber: phoneNumber ?? null,
            phoneNumberType: typeof phoneNumber,
          },
        }),
      });
    }

    const result = await sendOtp(phoneNumber);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Send OTP error:", {
      code: error.code,
      status: error.status,
      message: error.message,
    });

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP",
      ...(process.env.NODE_ENV !== "production" && {
        error: { code: error.code, message: error.message },
      }),
    });
  }
};

export const verifyOtpController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phoneNumber, code } = req.body ?? {};

    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Valid phone number is required",
      });
    }

    if (!code || !/^\d{4,10}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Valid OTP code is required",
      });
    }

    const result = await verifyOtp(phoneNumber, code);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Phone number verified successfully",
      data: {
        phoneNumber,
        verified: true,
      },
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error.message);

    return res.status(400).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};