import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.product.count();
  const all = await prisma.product.findMany();
  console.log("Count:", count);
  console.log("Images:", all.map(p => p.image));
}
main();
