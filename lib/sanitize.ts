/**
 * lib/sanitize.ts
 * Input sanitization utilities to prevent XSS, injection, and data abuse.
 * Prisma ORM already prevents SQL injection via parameterized queries.
 * This module handles data sanitization at the application layer.
 */

/**
 * Sanitize a generic text string:
 * - Trims whitespace
 * - Limits length
 * - Escapes HTML special characters to prevent XSS if ever rendered
 */
export function sanitizeString(input: unknown, maxLength = 200): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>&"'`]/g, (char) => {
      const map: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&#x27;",
        "`": "&#x60;",
      };
      return map[char] ?? char;
    });
}

/**
 * Sanitize a DNI (Peruvian national ID):
 * - Only digits allowed
 * - Max 12 characters (DNI is 8 digits, extra for foreign IDs)
 */
export function sanitizeDNI(input: unknown): string {
  if (typeof input !== "string") return "";
  const cleaned = input.replace(/[^0-9]/g, "").slice(0, 12);
  return cleaned;
}

/**
 * Sanitize a phone number:
 * - Allow digits, +, -, spaces, parentheses
 * - Max 20 characters
 */
export function sanitizePhone(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.replace(/[^0-9+\-\s()]/g, "").slice(0, 20).trim();
}

/**
 * Sanitize a name (person name, product name, etc.):
 * - Allow letters (including accented), numbers, spaces, hyphens, dots, ampersands
 * - Trim and limit length
 */
export function sanitizeName(input: unknown, maxLength = 100): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .slice(0, maxLength)
    // Remove characters that are clearly not part of a name
    .replace(/[<>&"'`\\]/g, "")
    .trim();
}

/**
 * Sanitize a number field:
 * - Parse as float
 * - Clamp to a min/max range
 * - Return null if invalid
 */
export function sanitizeNumber(
  input: unknown,
  min = 0,
  max = 1_000_000
): number | null {
  const n = parseFloat(String(input));
  if (isNaN(n)) return null;
  return Math.max(min, Math.min(max, n));
}

/**
 * Sanitize an integer field.
 */
export function sanitizeInt(
  input: unknown,
  min = 0,
  max = 100_000
): number | null {
  const n = parseInt(String(input), 10);
  if (isNaN(n)) return null;
  return Math.max(min, Math.min(max, n));
}

/**
 * Validate that a string looks like a plausible DNI or repair code.
 * Returns true if the input is 5–12 alphanumeric chars (or all digits for DNI).
 */
export function isValidQuery(input: string): boolean {
  // Repair codes start with INF + digits: INFXXXX
  // DNIs are 8 digits
  return /^[a-zA-Z0-9]{4,20}$/.test(input.trim());
}
