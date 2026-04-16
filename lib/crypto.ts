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
