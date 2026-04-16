import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
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
