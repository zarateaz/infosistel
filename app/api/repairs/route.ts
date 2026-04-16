import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Consulta requerida" }, { status: 400 });
  }

  // Find repair by ID or DNI
  // Note: We search for DNI exactly (even if encrypted, but here we expect the user to provide the plain DNI)
  // Since we encrypt DNI in the DB, we can't search it directly with a query unless we decrypt all or use a search index.
  // HOWEVER, for this demo, we can just findMany and filter in JS if the volume is low, or search by ID only.
  
  const repairs = await prisma.repair.findMany();
  
  // Need to import decrypt here or use a helper
  // For simplicity and performance, we'll try to find by exact ID first.
  const foundById = repairs.find(r => r.id.toLowerCase() === q.toLowerCase());
  
  if (foundById) {
    return NextResponse.json(foundById);
  }

  // If not found by ID, we'd need to decrypt DNIs to find a match.
  // This is expensive but okay for a small shop.
  const { decrypt } = require("@/lib/crypto");
  const foundByDni = repairs.find(r => {
    try {
      return decrypt(r.dni) === q;
    } catch {
      return false;
    }
  });

  if (foundByDni) {
    const dec = { ...foundByDni, dni: q };
    return NextResponse.json(dec);
  }

  return NextResponse.json({ error: "No se encontró el equipo" }, { status: 404 });
}
