import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { sanitizeName, sanitizePhone, sanitizeNumber, sanitizeInt } from "@/lib/sanitize";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  // ── Rate Limiting: max 20 orders per IP per 10 minutes (anti-spam) ──
  const ip = getClientIP(request);
  const rateCheck = checkRateLimit(ip, 20, 10 * 60 * 1000);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." },
      { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds ?? 600) } }
    );
  }

  try {
    // ── Request body size guard ──
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 102_400) {
      // 100KB max
      return NextResponse.json({ error: "Payload demasiado grande" }, { status: 413 });
    }

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

    const total = sanitizeNumber(body.total, 0, 500_000);
    if (total === null) {
      return NextResponse.json({ error: "Total inválido" }, { status: 400 });
    }

    // ── Validate items array ──
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Se requiere al menos un producto" }, { status: 400 });
    }
    if (body.items.length > 50) {
      return NextResponse.json({ error: "Demasiados productos por pedido" }, { status: 400 });
    }

    const sanitizedItems = body.items.map((item: any) => ({
      name: sanitizeName(item.name, 100) || "Producto",
      quantity: sanitizeInt(item.quantity, 1, 999) ?? 1,
      category: sanitizeName(item.category, 50) || "General",
    }));

    // ── Validate date ──
    const orderDate =
      body.date && !isNaN(Date.parse(body.date)) ? new Date(body.date) : new Date();

    // ── Create order (Prisma parameterized → SQL injection safe) ──
    const newOrder = await prisma.order.create({
      data: {
        customerName,
        customerPhone: encrypt(customerPhone), // AES-256-GCM encryption
        total,
        date: orderDate,
        items: {
          create: sanitizedItems,
        },
      },
      include: { items: true },
    });

    console.info(`[ORDER] Created order ${newOrder.id} from IP ${ip}`);
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
