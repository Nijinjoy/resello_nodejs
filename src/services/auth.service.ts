import {
  twilioClient,
  verifyServiceSid,
} from "../config/twilio";

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