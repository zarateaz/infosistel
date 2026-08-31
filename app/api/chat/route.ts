import {
  streamText,
  convertToModelMessages,
  tool,
  stepCountIs,
  type UIMessage,
} from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Eres el asistente virtual de INFOSISTEL, una tienda y taller técnico en Huancayo, Perú.

DATOS DEL NEGOCIO:
- Direcciones: Av. Giráldez 274, Semisótano Stand S25, Huancayo · y Av. Giráldez 274, 1er Nivel Stand B-10, Huancayo.
- WhatsApp / Teléfono: +51 964 648 202
- Correo: ecaballero@hotmail.com
- Horario: Lunes a Sábado, 9:00 AM a 7:00 PM (domingos cerrado).
- Tienda online: /tienda · Rastreo de reparaciones: /rastreo

SERVICIOS QUE OFRECEMOS:
- Mantenimiento preventivo (limpieza interna, cambio de pasta térmica, optimización de software).
- Reparación de laptops (pantallas, bisagras, teclados, cortos en placa).
- Servicio de impresoras (almohadillas, cabezales, reparación mecánica).
- Venta de repuestos y periféricos (cargadores originales, baterías, pantallas, RAM, SSD, teclados, mouse).
- Repotenciación con SSD y RAM.
- Soporte corporativo para empresas y colegios.

CÓMO RESPONDER:
- Responde siempre en español, de forma breve, cálida y directa — como un técnico de tienda real, no como un bot corporativo.
- Si preguntan por un producto específico (precio, stock, disponibilidad), usa la herramienta buscarProductos para consultar el catálogo real antes de responder. Nunca inventes precios ni stock.
- Si preguntan por una reparación en curso, indícales que la rastreen en /rastreo con su DNI o código de orden — tú no tienes acceso a ese estado.
- Si la consulta requiere hablar con una persona, cotizar algo complejo, o coordinar una visita, invita a escribir por WhatsApp al +51 964 648 202.
- Si no sabes algo con certeza, dilo y deriva a WhatsApp — no inventes información sobre precios, marcas o garantías.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: anthropic("claude-opus-5"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: {
      buscarProductos: tool({
        description:
          "Busca productos en el catálogo real de Infosistel por nombre o categoría (ej. RAM, SSD, teclado, mouse, pantalla, batería, impresora, laptop, PC). Úsala siempre que el usuario pregunte por un producto, precio o disponibilidad concreta.",
        inputSchema: z.object({
          query: z.string().describe("Término de búsqueda, por ejemplo 'RAM' o 'teclado mecánico'"),
        }),
        execute: async ({ query }) => {
          const products = await prisma.product.findMany({
            where: {
              OR: [
                { name: { contains: query } },
                { category: { contains: query } },
              ],
            },
            take: 8,
          });

          if (products.length === 0) {
            return { encontrados: 0, mensaje: "No se encontraron productos con ese término en el catálogo." };
          }

          return {
            encontrados: products.length,
            productos: products.map((p) => ({
              nombre: p.name,
              categoria: p.category,
              precio: `S/. ${p.onSale && p.salePrice ? p.salePrice : p.price}`,
              enOferta: p.onSale,
              stock: p.stock > 0 ? "Disponible" : "Agotado",
            })),
          };
        },
      }),
    },
    stopWhen: stepCountIs(4),
  });

  return result.toUIMessageStreamResponse();
}
