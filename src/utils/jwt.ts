import jwt, { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is missing");
}

const secret: string = jwtSecret;

const expiresIn = (process.env.JWT_EXPIRES_IN ||
  "7d") as SignOptions["expiresIn"];

export const signToken = (userId: string) => {
  return jwt.sign({}, secret, {
    subject: userId,
    expiresIn,
    algorithm: "HS256",
  });
};

export const verifyToken = (token: string) => {
  const payload = jwt.verify(token, secret, {
    algorithms: ["HS256"],
  });

  if (typeof payload === "string" || !payload.sub) {
    throw new Error("Invalid token payload");
  }

  return payload.sub;
};
