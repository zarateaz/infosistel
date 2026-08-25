/**
 * scripts/final-user.ts
 * SECURITY FIX (VULN-02): Credentials are read from CLI args, never hardcoded.
 *
 * Uso: npx tsx scripts/final-user.ts <username> <password>
 */
import { hashPassword } from "../lib/crypto";
import { prisma } from "../lib/prisma";

async function main() {
  const username = process.argv[2];
  const password = process.argv[3];

  if (!username || !password) {
    console.error("❌ Uso: npx tsx scripts/final-user.ts <username> <password>");
    process.exit(1);
  }

  if (password.length < 12) {
    console.error("❌ La contraseña debe tener mínimo 12 caracteres.");
    process.exit(1);
  }

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

  console.log(`[FINAL-FIX] Usuario ${user.username} configurado correctamente.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
