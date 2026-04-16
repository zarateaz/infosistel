import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/crypto";

const prisma = new PrismaClient();

async function main() {
  const username = "zarate";
  const password = "2208";

  console.log(`[SEED] Creando usuario: ${username}...`);

  const { hash, salt } = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      passwordHash: hash,
      salt: salt,
      role: "superadmin", // giving superadmin as requested for "maximum security" / access
    },
    create: {
      username,
      passwordHash: hash,
      salt: salt,
      role: "superadmin",
    },
  });

  console.log(`[SEED] Usuario ${user.username} creado/actualizado con éxito.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
