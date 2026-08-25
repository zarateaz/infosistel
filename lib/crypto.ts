import crypto from "crypto";

/**
 * Robust password hashing using Node.js Scrypt.
 * Scrypt is memory-hard and much more secure than simple SHA-256.
 */

const SCRYPT_CONFIG = {
  keylen: 64,
  cost: 16384,
  blockSize: 8,
  parallelization: 1,
};

export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const usedSalt = salt ?? crypto.randomBytes(16).toString("hex");
  
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, usedSalt, SCRYPT_CONFIG.keylen, SCRYPT_CONFIG, (err, derivedKey) => {
      if (err) reject(err);
      resolve({
        hash: derivedKey.toString("hex"),
        salt: usedSalt,
      });
    });
  });
}

export async function verifyPassword(password: string, storedHash: string, storedSalt: string): Promise<boolean> {
  const { hash } = await hashPassword(password, storedSalt);
  const buffer1 = Buffer.from(hash, "hex");
  const buffer2 = Buffer.from(storedHash, "hex");
  
  if (buffer1.length !== buffer2.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(buffer1, buffer2);
}

/**
 * Data Encryption using AES-256-GCM.
 * Used for sensitive fields like DNI and Phone.
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard for GCM
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: ENCRYPTION_KEY is missing in production environment!");
    }
    // Consistent 32-byte key for development to avoid buffer size errors
    return Buffer.alloc(32, "dev-encryption-key-infositel-safe");
  }

  try {
    // If it's a 64-char hex string, parse as hex, otherwise try base64
    if (key.length === 64) return Buffer.from(key, "hex");
    
    const buf = Buffer.from(key, "base64");
    // If base64 decoding results in 32 bytes, we are good. 
    // Otherwise, we might have a raw string.
    if (buf.length === 32) return buf;
    
    // Fallback: If it's just a raw string, hash it to get a 32-byte buffer
    return crypto.createHash("sha256").update(key).digest();
  } catch (e) {
    console.error("Error parsing ENCRYPTION_KEY, falling back to hashed key.");
    return crypto.createHash("sha256").update(key).digest();
  }
}

export function encrypt(text: string): string {
  if (!text) return text;
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  // Format: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  if (!encryptedData || !encryptedData.includes(":")) return encryptedData;
  
  try {
    const [ivHex, authTagHex, encryptedHex] = encryptedData.split(":");
    
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return "[ERROR_DECRYPTING]";
  }
}

/**
 * SECURITY FIX (A-01): Generate a keyed HMAC-SHA256 of a DNI for use as a
 * blind search index.
 *
 * WHY HMAC INSTEAD OF PLAIN SHA-256:
 * DNIs peruanos son solo 8 dígitos (00000000–99999999) — solo 100 millones
 * de valores posibles. Un atacante puede pre-computar SHA256(00000000) hasta
 * SHA256(99999999) en segundos y obtener todos los DNIs de la base de datos.
 *
 * HMAC-SHA256 con un secreto del servidor convierte esto en imposible:
 * HMAC(dni, DNI_HMAC_SECRET) solo puede ser verificado con el secreto,
 * que nunca sale del servidor.
 *
 * SETUP REQUERIDO EN PRODUCCIÓN:
 *   export DNI_HMAC_SECRET="$(openssl rand -hex 32)"
 *
 * IMPORTANTE: Cambiar este secreto invalida todos los dniSearchHash existentes
 * en la base de datos — los registros no podrán encontrarse por DNI hasta
 * que se re-hasheen. No cambiarlo una vez en producción.
 */
export function hashDNI(dni: string): string {
  if (!dni) return "";

  const secret = process.env.DNI_HMAC_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL: DNI_HMAC_SECRET is not set. " +
        "All DNI search lookups will fail without it. " +
        "Set it with: export DNI_HMAC_SECRET=\"$(openssl rand -hex 32)\""
      );
    }
    // Development fallback — NOT secure, only for local dev
    console.warn(
      "[DEV] DNI_HMAC_SECRET not set — using insecure dev fallback. " +
      "Set DNI_HMAC_SECRET in production."
    );
    return crypto.createHmac("sha256", "dev-dni-secret-NOT-for-production")
      .update(dni.trim())
      .digest("hex");
  }

  return crypto.createHmac("sha256", secret).update(dni.trim()).digest("hex");
}
