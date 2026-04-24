import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Reseteando marcadores de ventas...");
  await prisma.sale.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  console.log("✅ Todos los marcadores de ventas y pedidos se han reiniciado a 0.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
