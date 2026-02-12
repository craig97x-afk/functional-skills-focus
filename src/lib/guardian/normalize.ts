// Normalize names for guardian access matching (case/spacing/punctuation tolerant).
export function normalizeGuardianName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
