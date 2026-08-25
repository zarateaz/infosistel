/**
 * lib/requireAdminRole.ts
 *
 * SECURITY FIX (VULN-06): Centralized authentication + role authorization helper.
 *
 * Verifies that a request has a valid JWT token AND that the user's role
 * is "admin" or "superadmin". Use this in ALL private API routes to prevent
 * privilege escalation if new non-admin roles are added in the future.
 *
 * Usage:
 *   import { requireAdminRole } from "@/lib/requireAdminRole";
 *
 *   export async function POST(req: NextRequest) {
 *     const authError = await requireAdminRole(req);
 *     if (authError) return authError;
 *     // ... rest of handler
 *   }
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

const ALLOWED_ROLES = ["admin", "superadmin"] as const;

/**
 * Validates the request has a valid JWT with an admin-level role.
 * Returns a NextResponse error if unauthorized, or null if access is granted.
 */
export async function requireAdminRole(req: NextRequest): Promise<NextResponse | null> {
  const token = req.cookies.get("infositel_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "No autorizado: token ausente" },
      { status: 401 }
    );
  }

  const payload = await verifyAuth(token);

  if (!payload) {
    return NextResponse.json(
      { error: "No autorizado: token inválido o expirado" },
      { status: 401 }
    );
  }

  const role = payload.role as string;
  if (!ALLOWED_ROLES.includes(role as typeof ALLOWED_ROLES[number])) {
    return NextResponse.json(
      { error: `Acceso denegado: el rol '${role}' no tiene permisos de administrador` },
      { status: 403 }
    );
  }

  return null; // Access granted
}
