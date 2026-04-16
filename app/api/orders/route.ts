import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.customerPhone) {
      return NextResponse.json({ error: "Teléfono requerido" }, { status: 400 });
    }

    // Create the order in Prisma with encrypted phone
    const newOrder = await prisma.order.create({
      data: {
        customerName: data.customerName || "Cliente Web",
        customerPhone: encrypt(data.customerPhone), 
        total: parseFloat(data.total) || 0,
        date: (data.date && !isNaN(Date.parse(data.date))) ? new Date(data.date) : new Date(),
        items: {
          create: (data.items && Array.isArray(data.items)) 
            ? data.items.map((item: any) => ({
                name: item.name || "Producto",
                quantity: parseInt(item.quantity) || 1,
                category: item.category || "General",
              }))
            : [],
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    // Log the full error to the server console for the developer
    console.error("CRITICAL: Order creation failed:", error);
    
    return NextResponse.json({ 
      error: "Error al procesar el pedido de forma segura",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    }, { status: 500 });
  }
}
