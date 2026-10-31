import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error("Twilio credentials are missing");
}

export const twilioClient = twilio(accountSid, authToken);

const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!serviceSid) {
  throw new Error("Twilio Verify Service SID is missing");
}

export const verifyServiceSid: string = serviceSid;