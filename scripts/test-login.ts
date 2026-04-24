import { prisma } from "../lib/prisma";
import { verifyPassword } from "../lib/crypto";

async function main() {
  const username = "zarate";
  const password = "2208";
  
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    console.log("❌ Usuario no encontrado en la DB");
    return;
  }
  
  const isValid = await verifyPassword(password, user.passwordHash, user.salt);
  if (isValid) {
    console.log("✅ Contraseña VÁLIDA para zarate / 2208");
  } else {
    console.log("❌ Contraseña INVÁLIDA para zarate / 2208");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
