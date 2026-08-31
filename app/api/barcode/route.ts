import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/requireAdminRole";
import { prisma } from "@/lib/prisma";

// Maps the (often long, English) category string returned by public UPC
// databases to the exact category names stored in the Category table — must
// match those strings verbatim (the /tienda filter compares with ===), not
// just be "close enough" spelling.
const CATEGORY_KEYWORDS: Array<{ match: RegExp; category: string }> = [
  { match: /\bram\b|memory/i, category: "RAM" },
  { match: /\bssd\b|solid state|nvme/i, category: "SSD" },
  { match: /keyboard|teclado/i, category: "TECLADO" },
  { match: /\bmouse\b|mice/i, category: "MOUSE" },
  { match: /monitor|pantalla|display/i, category: "Monitores" },
  { match: /battery|bater/i, category: "BATERÍAS" },
  { match: /printer|impresora/i, category: "IMPRESORAS" },
  { match: /camera|cámara|cctv|dvr|nvr/i, category: "CÁMARAS DE SEGURIDAD" },
  { match: /router|wifi|antenna|antena|switch|network|red\b/i, category: "REDES" },
  { match: /headphone|headset|earbud|audíf|parlante|speaker|audio/i, category: "AUDIO" },
  { match: /cable|adapter|adaptador|hdmi|usb-c|charger|cargador/i, category: "CABLES Y ADAPTADORES" },
  { match: /laptop|notebook/i, category: "Laptops" },
  { match: /desktop|\bpc\b|computer/i, category: "PC" },
];

function guessCategory(...texts: Array<string | undefined>): string {
  const combined = texts.filter(Boolean).join(" ");
  for (const { match, category } of CATEGORY_KEYWORDS) {
    if (match.test(combined)) return category;
  }
  return "GENERAL";
}

export async function GET(req: NextRequest) {
  const authError = await requireAdminRole(req);
  if (authError) return authError;

  const barcode = req.nextUrl.searchParams.get("barcode")?.trim();
  if (!barcode || !/^[0-9]{6,14}$/.test(barcode)) {
    return NextResponse.json({ error: "Código de barras inválido" }, { status: 400 });
  }

  // The local catalog is authoritative: if this barcode was already scanned
  // before, its saved name/price/category reflect real admin decisions and
  // must win over the public database — never let a re-scan silently
  // overwrite them with generic external data.
  const existing = await prisma.product.findUnique({ where: { barcode } });
  if (existing) {
    return NextResponse.json({
      found: true,
      existsLocally: true,
      barcode,
      model: existing.name,
      description: existing.description,
      imageUrl: existing.image,
      category: existing.category,
      price: existing.price,
      stock: existing.stock,
      specs: (() => {
        try {
          return existing.specs ? JSON.parse(existing.specs) : null;
        } catch {
          return null;
        }
      })(),
    });
  }

  try {
    const res = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) }
    );

    if (!res.ok) {
      return NextResponse.json(
        { found: false, barcode, message: "El servicio de búsqueda no respondió. Completa los datos manualmente." },
        { status: 200 }
      );
    }

    const data = await res.json();
    const item = data?.items?.[0];

    if (!item) {
      return NextResponse.json(
        { found: false, barcode, message: "No se encontró este código en la base pública. Completa los datos manualmente." },
        { status: 200 }
      );
    }

    return NextResponse.json({
      found: true,
      barcode,
      model: item.title || item.model || "",
      description: item.description || [item.brand, item.model, item.size, item.color].filter(Boolean).join(" · "),
      imageUrl: Array.isArray(item.images) ? item.images[0] : undefined,
      category: guessCategory(item.category, item.title),
      specs: {
        brand: item.brand || null,
        model: item.model || null,
        color: item.color || null,
        size: item.size || null,
        dimension: item.dimension || null,
        weight: item.weight || null,
      },
    });
  } catch {
    return NextResponse.json(
      { found: false, barcode, message: "No se pudo consultar el servicio externo. Completa los datos manualmente." },
      { status: 200 }
    );
  }
}
