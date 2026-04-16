import { hashPassword } from "../lib/crypto";
import { prisma } from "../lib/prisma";

async function main() {
  const username = "zarate";
  const password = "2209";

  console.log(`[FINAL-FIX] Creando/Actualizando usuario: ${username}`);

  const { hash, salt } = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      passwordHash: hash,
      salt: salt,
      role: "superadmin",
    },
    create: {
      username,
      passwordHash: hash,
      salt: salt,
      role: "superadmin",
    },
  });

  console.log(`[FINAL-FIX] Usuario ${user.username} listo con contraseña: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
