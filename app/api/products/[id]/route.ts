/**
 * app/api/products/[id]/route.ts
 * SECURITY FIX (VULN-06): Uses requireAdminRole helper to validate both token
 * AND user role (admin/superadmin) on all destructive operations.
 *
 * SECURITY FIX (H-01): UUID format validation on the `id` parameter.
 * Without this, malformed IDs (e.g., SQL fragments, very long strings) reach
 * Prisma/SQLite unnecessarily and can trigger unexpected DB errors or info leakage.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminRole } from "@/lib/requireAdminRole";
import { checkRateLimit, getClientIP, rateLimitKey } from "@/lib/rateLimit";

/** Validate that a string looks like a UUID v4 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // SECURITY FIX (VULN-06): Validates token AND role (admin/superadmin)
  const authError = await requireAdminRole(req);
  if (authError) return authError;

  // [H-01] Rate limit: max 30 deletes per hour per IP (admin abuse protection)
  const ip = getClientIP(req);
  const rateCheck = checkRateLimit(rateLimitKey("products-delete", ip), 30, 60 * 60 * 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Demasiadas operaciones. Intenta en un momento." },
      { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds ?? 3600) } }
    );
  }

  const { id } = await params;

  // [H-01] Validate ID format — reject anything that isn't a UUID
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: "ID de producto inválido" },
      { status: 400 }
    );
  }

  // Check if product exists before deleting (avoids silent no-op)
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // SECURITY FIX (VULN-06): Validates token AND role (admin/superadmin)
  const authError = await requireAdminRole(req);
  if (authError) return authError;

  const { id } = await params;

  // [H-01] Validate ID format
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: "ID de producto inválido" },
      { status: 400 }
    );
  }

  const data = await req.json().catch(() => null);
  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  const updated = await prisma.product.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}
