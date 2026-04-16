import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Consulta requerida" }, { status: 400 });
  }

  // 1. Try to find by exact ID first (Very fast, indexed)
  const foundById = await prisma.repair.findUnique({
    where: { id: q }
  });

  if (foundById) {
    return NextResponse.json(foundById);
  }

  // 2. If not found by ID, we check for DNI.
  // Since DNI is encrypted with random IV (AES-GCM), we must decrypt in-memory.
  // This is acceptable for a small-scale local shop.
  const repairs = await prisma.repair.findMany();
  
  const { decrypt } = require("@/lib/crypto");
  const foundByDni = repairs.find(r => {
    try {
      // Direct comparison with decrypted value
      return decrypt(r.dni) === q;
    } catch {
      return false;
    }
  });

  if (foundByDni) {
    const dec = { ...foundByDni, dni: q };
    return NextResponse.json(dec);
  }

  return NextResponse.json({ error: "No se encontró el equipo o DNI inválido" }, { status: 404 });
}
