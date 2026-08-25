/**
 * app/api/orders/route.ts
 *
 * SECURITY FIX (VULN-01): Server-side price recalculation.
 * The total is NEVER trusted from the client. The server fetches real prices
 * from the database and computes the total itself. Client-supplied prices are ignored.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { sanitizeName, sanitizePhone, sanitizeInt } from "@/lib/sanitize";
import { checkRateLimit, getClientIP, rateLimitKey } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  // ── Rate Limiting: max 20 orders per IP per 10 minutes (anti-spam) ──
  const ip = getClientIP(request);
  const rateCheck = checkRateLimit(rateLimitKey("order", ip), 20, 10 * 60 * 1000);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." },
      { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds ?? 600) } }
    );
  }

  try {
    // ── Input validation & sanitization ──
    // Note: Request body size limit is enforced by Nginx (client_max_body_size 5M)
    // We removed manual Content-Length check as it could be bypassed via chunked encoding.
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
    }

    // ── Input validation & sanitization ──
    const customerPhone = sanitizePhone(body.customerPhone);
    if (!customerPhone || customerPhone.length < 7) {
      return NextResponse.json(
        { error: "Teléfono requerido (mínimo 7 dígitos)" },
        { status: 400 }
      );
    }

    const customerName = sanitizeName(body.customerName, 80) || "Cliente Web";

    // ── Validate items array ──
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Se requiere al menos un producto" }, { status: 400 });
    }
    if (body.items.length > 50) {
      return NextResponse.json({ error: "Demasiados productos por pedido" }, { status: 400 });
    }

    // ── SECURITY FIX (VULN-01): Server-side price recalculation ──
    // For items with a productId, fetch the real price from the database.
    // The client-supplied `total` is completely IGNORED.
    let serverTotal = 0;
    const sanitizedItems: {
      productId?: string;
      name: string;
      quantity: number;
      category: string;
      unitPrice?: number;
    }[] = [];

    for (const item of body.items) {
      const quantity = sanitizeInt(item.quantity, 1, 999) ?? 1;
      const itemName = sanitizeName(item.name, 100) || "Producto";
      const itemCategory = sanitizeName(item.category, 50) || "General";
      const rawProductId = typeof item.productId === "string" ? item.productId.trim() : null;

      if (rawProductId) {
        // Fetch real price from DB — never trust the client
        const product = await prisma.product.findUnique({
          where: { id: rawProductId },
          select: { id: true, name: true, category: true, price: true, salePrice: true, onSale: true },
        });

        if (!product) {
          return NextResponse.json(
            { error: `Producto no encontrado: ${itemName}` },
            { status: 404 }
          );
        }

        // Use salePrice if the product is currently on sale, otherwise use regular price
        const unitPrice = product.onSale && product.salePrice ? product.salePrice : product.price;
        serverTotal += unitPrice * quantity;

        sanitizedItems.push({
          productId: product.id,
          name: product.name,
          quantity,
          category: product.category,
          unitPrice,
        });
      } else {
        // Items without productId (e.g. custom items) — use sanitized name only, price = 0 contribution
        // These are "consultation" style items without a DB-verified price
        sanitizedItems.push({ name: itemName, quantity, category: itemCategory });
      }
    }

    // ── Validate date ──
    const orderDate =
      body.date && !isNaN(Date.parse(body.date)) ? new Date(body.date) : new Date();

    // ── Create order with SERVER-CALCULATED total ──
    const newOrder = await prisma.order.create({
      data: {
        customerName,
        customerPhone: encrypt(customerPhone), // AES-256-GCM encryption
        total: serverTotal, // ✅ Server-calculated, NOT from client
        date: orderDate,
        items: {
          create: sanitizedItems,
        },
      },
      include: { items: true },
    });

    console.info(`[ORDER] Created order ${newOrder.id} | Total: ${serverTotal} | IP: ${ip}`);
    return NextResponse.json({ success: true, order: { id: newOrder.id } });
  } catch (error: any) {
    console.error("[ORDER_ERROR]:", error);
    return NextResponse.json(
      {
        error: "Error al procesar el pedido",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
