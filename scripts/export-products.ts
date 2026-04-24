import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  const filePath = path.join(process.cwd(), "data", "products_export.json");
  
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
  console.log(`✅ Exportados ${products.length} productos a ${filePath}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
