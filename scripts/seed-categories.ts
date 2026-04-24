import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const categories = [
  'Cartuchos y Tintas', 
  'Impresoras', 
  'Cables y Adaptadores', 
  'Cases y Fuentes', 
  'Almacenamiento (SSD/HDD)', 
  'Accesorios',
  'Teclados',
  'Monitores',
  'Switchs',
  'MOUSE'
];

async function main() {
  console.log("🌱 Seeding categories...");
  for (const cat of categories) {
    const name = cat.trim().toUpperCase();
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
  console.log("✅ Categories seeded successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
