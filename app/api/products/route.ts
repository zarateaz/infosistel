/**
 * app/api/products/route.ts
 * SECURITY FIX (VULN-06): Uses requireAdminRole helper to validate both token
 * AND user role (admin/superadmin) on all write operations.
 *
 * SECURITY FIX (D-04): Added rate limiting on GET to prevent DB overload via
 * mass polling. SQLite is single-writer and can be saturated easily without
 * a request throttle at the application layer (nginx also limits at L7).
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminRole } from "@/lib/requireAdminRole";
import { checkRateLimit, getClientIP, rateLimitKey } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // [D-04] Rate limit: max 60 requests per IP per minute for product catalog
  const ip = getClientIP(req);
  const rateCheck = checkRateLimit(rateLimitKey("products-get", ip), 60, 60 * 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta en un momento." },
      { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds ?? 60) } }
    );
  }

  // SECURITY FIX (2026-08-30, hallazgo del diagnóstico ASVS V4.1.3 — ver
  // docs de tesis / capítulo III): sin `select` explícito, Prisma devolvía
  // TODAS las columnas de Product a cualquier visitante no autenticado,
  // incluyendo `costPrice` (precio de costo / margen de ganancia interno).
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
      price: true,
      stock: true,
      image: true,
      isFeatured: true,
      onSale: true,
      salePrice: true,
      barcode: true,
      model: true,
      specs: true,
      createdAt: true,
      updatedAt: true,
      // costPrice deliberadamente excluido — solo debe ser visible en el
      // panel de administración, nunca en el catálogo público.
    },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  // SECURITY FIX (VULN-06): Validates token AND role (admin/superadmin)
  const authError = await requireAdminRole(req);
  if (authError) return authError;

  // [H-04] Rate limit for admin writes: max 30 creates per hour per IP
  const ip = getClientIP(req);
  const rateCheck = checkRateLimit(rateLimitKey("products-post", ip), 30, 60 * 60 * 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Demasiadas operaciones. Intenta en un momento." },
      { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds ?? 3600) } }
    );
  }

  const data = await req.json();
  const newProduct = await prisma.product.create({
    data: {
      name: data.name,
      category: data.category,
      description: data.description,
      price: parseFloat(data.price),
      stock: parseInt(data.stock),
      image: data.image,
      onSale: data.onSale || false,
      salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
      isFeatured: data.isFeatured || false,
    },
  });
  return NextResponse.json(newProduct);
}
