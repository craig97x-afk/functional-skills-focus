import { createHash, randomInt } from "crypto";

export function generateGuardianCode() {
  const value = randomInt(100000, 999999);
  return String(value);
}

export function hashGuardianCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}
