/**
 * scripts/reset-admin.mjs
 * Crea o resetea el usuario admin en la base de datos de producción.
 * 
 * USO en el VPS:
 *   cd /home/zarate/infosistel
 *   node scripts/reset-admin.mjs
 *
 * Luego reinicia la app:
 *   pm2 restart infosistel
 */

import crypto from "crypto";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// ============================================================
// CONFIGURACIÓN — Cambia el password aquí antes de ejecutar
// ============================================================
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Admin2026!!"; // <-- cambia esto en el VPS
const ADMIN_ROLE = "superadmin";
// ============================================================

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

  // Set env vars necesarias para Prisma
  process.env.DATABASE_URL = process.env.DATABASE_URL || `file:${path.join(projectRoot, "prisma/dev.db")}`;
  console.log("📦 DATABASE_URL:", process.env.DATABASE_URL);

  // Importar @prisma/client dinámicamente
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

    // Hash de la nueva contraseña
    console.log(`🔐 Hasheando contraseña para usuario: ${ADMIN_USERNAME}`);
    const { hash, salt } = await hashPassword(ADMIN_PASSWORD);

    // Upsert: crea si no existe, actualiza si ya existe
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
    console.log("\n🔑 Credenciales para el panel:");
    console.log(`   Usuario:  ${ADMIN_USERNAME}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log("\n⚠️  RECUERDA: Cambia el password después del primer login.");

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
