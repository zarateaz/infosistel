/**
 * lib/auth.ts
 *
 * JWT signing and verification using jose.
 * Algorithm: HS256 with a 256-bit minimum key.
 *
 * SECURITY FIX (S-05): The fallback secret has been completely removed.
 * If JWT_SECRET is not set, the application will ALWAYS throw a fatal error,
 * regardless of NODE_ENV. There is no fallback, no recovery, no silent failure.
 *
 * The application MUST NOT start without a properly configured JWT_SECRET.
 * This prevents a scenario where a deployment bug (e.g., .env not loaded)
 * causes the server to silently use a known key from source code.
 */
import { SignJWT, jwtVerify } from "jose";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;

  // S-05: Fatal error in ALL environments, not just production.
  // A missing JWT_SECRET is always a critical misconfiguration.
  if (!secret || secret.length === 0) {
    throw new Error(
      "FATAL: JWT_SECRET environment variable is not set. " +
      "The application cannot start without a valid secret. " +
      "Set it with: export JWT_SECRET=\"$(openssl rand -base64 64)\""
    );
  }

  // Enforce minimum key length — HS256 requires at least 256 bits (32 bytes).
  // A short key would make HMAC-SHA256 trivially brute-forceable.
  if (Buffer.from(secret).length < 32) {
    throw new Error(
      "FATAL: JWT_SECRET is too short. Minimum 32 characters required for HS256. " +
      "Generate one with: openssl rand -base64 64"
    );
  }

  return secret;
};

export async function verifyAuth(token: string) {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey())
    );
    return verified.payload;
  } catch (err) {
    return null;
  }
}

export async function signAuth(payload: { id: string; username: string; role: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(getJwtSecretKey()));
  return token;
}
