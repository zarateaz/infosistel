import { hashPassword } from "../lib/crypto";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Limpiando DB...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.repair.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding Categorías...");
  const categorias = ["Periféricos", "Componentes", "Monitores", "Laptops", "Accesorios"];
  for (const cat of categorias) {
    await prisma.category.create({ data: { name: cat } });
  }

  console.log("Seeding Usuario Admin Default...");
  // SECURITY FIX (VULN-02): Password is never hardcoded. Read from CLI arg or generate a random one.
  const seedPassword = process.argv[2] || require("crypto").randomBytes(16).toString("hex");
  if (!process.argv[2]) {
    console.log(`\n⚠️  Auto-generated seed password: ${seedPassword}`);
    console.log("   Save this and change it immediately after seeding!\n");
  }
  const { hash, salt } = await hashPassword(seedPassword);
  await prisma.user.create({
    data: {
      username: "zarate",
      passwordHash: hash,
      salt: salt,
      role: "superadmin"
    }
  });

  console.log("Seeding Productos Iniciales...");
  await prisma.product.create({
    data: {
      name: "Mouse Gamer PRO G7",
      category: "Periféricos",
      description: "Tecnología de neón RGB, sensor óptico de alta precisión y diseño ergonómico para largas sesiones.",
      price: 490,
      stock: 10,
      image: "/img/producto3mouse.webp",
      isFeatured: true
    }
  });

  await prisma.product.create({
    data: {
      name: "Teclado Mecánico RGB",
      category: "Periféricos",
      description: "Iluminación RGB Pro Series, switches mecánicos de respuesta instantánea y cable reforzado.",
      price: 380,
      stock: 8,
      image: "/img/producto5teclado.webp",
      isFeatured: true
    }
  });

  await prisma.product.create({
    data: {
      name: "Laptop Titan Pro RTX",
      category: "Laptops",
      description: "Potencia sin límites: RTX 4080, i9-13980HX, 32GB RAM. La cima del rendimiento móvil.",
      price: 8900,
      stock: 3,
      image: "/img/fondo4laptop.webp",
      isFeatured: true
    }
  });

  console.log("Seeding finalizado exitosamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
