import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { isValidQuery, sanitizeDNI } from "@/lib/sanitize";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  // ── Rate Limiting: max 30 lookups per IP per 5 minutes ──
  const ip = getClientIP(request);
  const rateCheck = checkRateLimit(ip, 30, 5 * 60 * 1000);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Demasiadas consultas. Intenta en unos minutos." },
      { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds ?? 300) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") ?? "";

  // ── Input validation ──
  if (!rawQuery || rawQuery.trim().length === 0) {
    return NextResponse.json({ error: "Consulta requerida" }, { status: 400 });
  }

  if (!isValidQuery(rawQuery)) {
    return NextResponse.json(
      { error: "Formato de consulta inválido. Usa tu código INF#### o DNI (8 dígitos)." },
      { status: 400 }
    );
  }

  const q = rawQuery.trim().toUpperCase();

  try {
    // ── 1. Search by repair code (INF + digits pattern) ──
    if (q.startsWith("INF")) {
      const foundByCode = await prisma.repair.findFirst({
        where: { code: q },
        select: {
          id: true,
          code: true,
          equipment: true,
          problem: true,
          progress: true,
          statusText: true,
          createdAt: true,
          lastUpdate: true,
          // DO NOT return DNI in the response
        },
      });

      if (foundByCode) {
        return NextResponse.json(foundByCode);
      }
    }

    // ── 2. Search by exact ID (UUID) ──
    if (/^[0-9a-f-]{36}$/i.test(q.toLowerCase())) {
      const foundById = await prisma.repair.findUnique({
        where: { id: q.toLowerCase() },
        select: {
          id: true,
          code: true,
          equipment: true,
          problem: true,
          progress: true,
          statusText: true,
          createdAt: true,
          lastUpdate: true,
          // DO NOT return DNI in the response
        },
      });

      if (foundById) {
        return NextResponse.json(foundById);
      }
    }

    // ── 3. Search by DNI (only digits, 8 characters) ──
    const dniQuery = sanitizeDNI(rawQuery);
    if (dniQuery.length >= 7 && dniQuery.length <= 12) {
      // Must decrypt in-memory since DNI is AES-encrypted with random IV
      const repairs = await prisma.repair.findMany({
        select: {
          id: true,
          code: true,
          equipment: true,
          problem: true,
          progress: true,
          statusText: true,
          createdAt: true,
          lastUpdate: true,
          dni: true, // needed for decrypt comparison
        },
      });

      const foundByDni = repairs.find((r) => {
        try {
          return decrypt(r.dni) === dniQuery;
        } catch {
          return false;
        }
      });

      if (foundByDni) {
        // Return WITHOUT DNI in the response
        const { dni: _removed, ...safeRepair } = foundByDni;
        return NextResponse.json(safeRepair);
      }
    }

    // ── 4. Not found — generic message (no info leakage) ──
    return NextResponse.json(
      { error: "No se encontró ningún equipo con ese código o DNI." },
      { status: 404 }
    );
  } catch (error) {
    console.error("[REPAIRS_LOOKUP_ERROR]:", error);
    return NextResponse.json({ error: "Error al buscar el equipo" }, { status: 500 });
  }
}
