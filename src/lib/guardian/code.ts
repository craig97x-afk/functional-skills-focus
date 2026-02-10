import { createHash, randomInt } from "crypto";

// Generate a short-lived numeric code for guardians; stored hashed in DB.
export function generateGuardianCode() {
  const value = randomInt(100000, 999999);
  return String(value);
}

// Hash codes server-side so we never store raw access codes.
export function hashGuardianCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}
