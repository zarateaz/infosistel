import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/crypto";
import { signAuth } from "@/lib/auth";
import { checkRateLimit, resetRateLimit, getClientIP, rateLimitKey } from "@/lib/rateLimit";
import { sanitizeName } from "@/lib/sanitize";

export async function POST(request: Request) {
  // ── 1. Rate Limiting: max 5 attempts per IP per 15 minutes ──
  const ip = getClientIP(request);
  // S-04: Use namespaced key to prevent cross-endpoint rate limit collisions
  const rateKey = rateLimitKey("login", ip);
  const rateCheck = checkRateLimit(rateKey, 5, 15 * 60 * 1000);

  if (!rateCheck.allowed) {
    console.warn(`[LOGIN] Rate limit exceeded for IP: ${ip}`);
    return NextResponse.json(
      {
        error: "Demasiados intentos. Intenta de nuevo más tarde.",
        retryAfterSeconds: rateCheck.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateCheck.retryAfterSeconds ?? 900),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
    }

    // ── 2. Input validation & sanitization ──
    const username = sanitizeName(body.username, 50);
    const password = typeof body.password === "string" ? body.password.slice(0, 128) : "";

    if (!username || !password) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
    }

    // ── 3. Lookup user (Prisma uses parameterized queries → SQL injection safe) ──
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      // SECURITY FIX (VULN-04): Perform a dummy scrypt hash to equalize response time.
      // Without this, an attacker can enumerate valid usernames by measuring response time
      // (non-existent users respond instantly; existing ones take 50-200ms for scrypt).
      await verifyPassword(password, "a".repeat(128), "dummy-salt-for-timing-equalization");
      // Return same generic message to prevent username enumeration
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // ── 4. Constant-time password verify (Scrypt + timingSafeEqual) ──
    const isValid = await verifyPassword(password, user.passwordHash, user.salt);

    if (!isValid) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // ── 5. Success: reset rate limit, issue JWT ──
    resetRateLimit(rateKey); // Reset with same namespaced key used for checking

    const token = await signAuth({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json(
      { success: true, message: "Autenticado" },
      { status: 200 }
    );

    const isSecure = process.env.COOKIE_SECURE === "true";
    response.cookies.set({
      name: "infositel_token",
      value: token,
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 60 * 60 * 12, // 12 horas
      path: "/",
    });

    console.info(`[LOGIN] Success: ${user.username} from ${ip}`);
    return response;
  } catch (error) {
    console.error("[LOGIN_ERROR]:", error);
    return NextResponse.json(
      {
        error: "Error en el servidor",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
