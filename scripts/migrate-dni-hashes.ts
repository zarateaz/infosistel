import { PrismaClient } from "@prisma/client";
import { decrypt, hashDNI } from "../lib/crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando migración de hashes de DNI para Reparaciones...");

  // 1. Obtener todas las reparaciones
  const repairs = await prisma.repair.findMany({
    select: {
      id: true,
      dni: true,
      dniSearchHash: true,
    },
  });

  console.log(`📋 Encontradas ${repairs.length} reparaciones en la base de datos.`);

  let updatedCount = 0;

  // 2. Iterar y actualizar el dniSearchHash si no está configurado
  for (const repair of repairs) {
    if (!repair.dniSearchHash) {
      try {
        const decryptedDni = decrypt(repair.dni);
        if (decryptedDni && decryptedDni !== "[ERROR_DECRYPTING]") {
          const hashedDni = hashDNI(decryptedDni);
          await prisma.repair.update({
            where: { id: repair.id },
            data: { dniSearchHash: hashedDni },
          });
          updatedCount++;
        }
      } catch (err: any) {
        console.error(`❌ Error migrando reparación ID ${repair.id}:`, err.message);
      }
    }
  }

  console.log(`✅ Migración finalizada. Se actualizaron ${updatedCount} registros.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
