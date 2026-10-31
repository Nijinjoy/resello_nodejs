import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error("Twilio credentials are missing");
}

export const twilioClient = twilio(accountSid, authToken);

export const verifyServiceSid =
  process.env.TWILIO_VERIFY_SERVICE_SID;

if (!verifyServiceSid) {
  throw new Error("Twilio Verify Service SID is missing");
}