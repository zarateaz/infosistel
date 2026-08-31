import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/requireAdminRole";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authError = await requireAdminRole(req);
  if (authError) return authError;

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json(
      { error: "Falta configurar GOOGLE_GENERATIVE_AI_API_KEY en el servidor." },
      { status: 503 }
    );
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta la imagen" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 });
  }

  try {
    // Built from the real Category table (same one /tienda and "Añadir
    // Producto" read) so the AI can never return a category that doesn't
    // exist in the dropdown — no second hardcoded taxonomy to drift out of sync.
    const dbCategories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    const categoryNames = dbCategories.length ? dbCategories.map((c) => c.name) : ["GENERAL"];

    const productSchema = z.object({
      model: z
        .string()
        .describe("Exact model / part number as printed on the box (e.g. 'DS-2CD1323G0E-I'). Empty string if unreadable."),
      description: z
        .string()
        .describe("Short 1-2 sentence description combining brand, product type and the key specs visible on the box."),
      category: z.enum(categoryNames as [string, ...string[]]),
    });

    const bytes = Buffer.from(await file.arrayBuffer());

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: productSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Esta es una foto de la caja/empaque de un producto de tienda de tecnología. " +
                "Lee el texto impreso (marca, modelo, especificaciones) y devuelve los datos " +
                "estructurados. Si algo no se lee con certeza, usa tu mejor estimación con lo " +
                "visible en la imagen; nunca inventes un modelo que no aparezca en la foto.",
            },
            { type: "image", image: bytes, mediaType: file.type },
          ],
        },
      ],
    });

    return NextResponse.json({ success: true, ...object });
  } catch (err) {
    console.error("[RECOGNIZE_PRODUCT_ERROR]:", err);
    return NextResponse.json(
      { error: "No se pudo analizar la imagen. Intenta con una foto más clara del empaque." },
      { status: 500 }
    );
  }
}
