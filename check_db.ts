import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const onSale = await prisma.product.findMany({ where: { onSale: true } });
  console.log("On Sale Products:", JSON.stringify(onSale, null, 2));
}
main();
