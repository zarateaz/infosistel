/**
 * scripts/reset-admin.mjs
 * Crea o resetea el usuario admin en la base de datos de producción.
 *
 * SECURITY FIX (VULN-02): Password is now read from CLI argument or environment variable.
 * It is NEVER hardcoded in source code.
 *
 * USO en el VPS:
 *   cd /home/zarate/infosistel
 *   node scripts/reset-admin.mjs <username> <password>
 *
 *   Ejemplo:
 *   node scripts/reset-admin.mjs zarate "MiContraseñaSegura2026!!"
 *
 * Luego reinicia la app:
 *   pm2 restart infosistel
 */

import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// ── Read credentials from CLI args — NEVER from source code ──
const ADMIN_USERNAME = process.argv[2];
const ADMIN_PASSWORD = process.argv[3];

if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.error("❌ Uso: node scripts/reset-admin.mjs <username> <password>");
  console.error("   Ejemplo: node scripts/reset-admin.mjs zarate 'MiPass2026!!'");
  console.error("\n⚠️  La contraseña debe tener mínimo 12 caracteres, mayúsculas, números y símbolos.");
  process.exit(1);
}

if (ADMIN_PASSWORD.length < 12) {
  console.error("❌ La contraseña debe tener mínimo 12 caracteres.");
  console.error("   Usa: openssl rand -base64 18 (para generar una segura)");
  process.exit(1);
}

const ADMIN_ROLE = "superadmin";

const SCRYPT_CONFIG = {
  keylen: 64,
  cost: 16384,
  blockSize: 8,
  parallelization: 1,
};

async function hashPassword(password, salt) {
  const usedSalt = salt ?? crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, usedSalt, SCRYPT_CONFIG.keylen, SCRYPT_CONFIG, (err, derivedKey) => {
      if (err) reject(err);
      else resolve({ hash: derivedKey.toString("hex"), salt: usedSalt });
    });
  });
}

async function main() {
  console.log("=== INFOSISTEL — Reset Admin Script ===\n");

  process.env.DATABASE_URL = process.env.DATABASE_URL || `file:${path.join(projectRoot, "data/dev.db")}`;
  console.log("📦 DATABASE_URL:", process.env.DATABASE_URL);

  let PrismaClient;
  try {
    const mod = await import("@prisma/client");
    PrismaClient = mod.PrismaClient;
  } catch (e) {
    console.error("❌ No se pudo importar @prisma/client:", e.message);
    console.error("   Asegúrate de haber ejecutado: npx prisma generate");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log("✅ Conexión a DB exitosa\n");

    console.log(`🔐 Hasheando contraseña para usuario: ${ADMIN_USERNAME}`);
    const { hash, salt } = await hashPassword(ADMIN_PASSWORD);

    const user = await prisma.user.upsert({
      where: { username: ADMIN_USERNAME },
      update: {
        passwordHash: hash,
        salt: salt,
        role: ADMIN_ROLE,
      },
      create: {
        username: ADMIN_USERNAME,
        passwordHash: hash,
        salt: salt,
        role: ADMIN_ROLE,
      },
    });

    console.log("\n✅ Usuario admin configurado exitosamente:");
    console.log(`   ID:       ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Role:     ${user.role}`);
    console.log(`   Created:  ${user.createdAt}`);
    console.log("\n⚠️  RECUERDA: No compartas ni almacenes la contraseña en texto plano.");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.message.includes("no such table")) {
      console.error("\n💡 La base de datos no tiene tablas. Ejecuta primero:");
      console.error("   npx prisma db push");
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
