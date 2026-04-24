const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:../prisma/dev.db"
    }
  }
});

async function main() {
  const uploadsDir = path.join(__dirname, '../public/uploads');
  const files = fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.'));
  
  const existingProducts = await prisma.product.findMany();
  const existingImages = existingProducts.map(p => p.image);
  
  let recoveredCount = 0;
  for (const file of files) {
    const originalImageName = `/uploads/${file}`;
    // If the product doesn't exist, recover it
    if (!existingImages.includes(originalImageName)) {
      const match = file.match(/^\d+-(.+)\.\w+$/);
      let name = "Producto Recuperado";
      if (match) {
        name = match[1].toUpperCase().replace(/-/g, ' ');
      }
      
      await prisma.product.create({
        data: {
          name: name,
          category: "General",
          description: "Producto recuperado. Por favor, edita su precio y categoría.",
          price: 0,
          stock: 1,
          image: originalImageName,
        }
      });
      recoveredCount++;
    }
  }
  console.log(`Recovered ${recoveredCount} products from orphan images.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
