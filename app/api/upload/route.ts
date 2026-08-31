/**
 * app/api/upload/route.ts
 *
 * SECURITY FIX (VULN-06): Admin role validation via requireAdminRole helper.
 * SECURITY FIX (S-03): Magic bytes validation to prevent polyglot file uploads.
 */
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, chmod } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import { requireAdminRole } from "@/lib/requireAdminRole";

// Mobile-perf guardrail: every uploaded product photo is re-encoded to WebP
// and capped at 1200px on its longest edge before it ever touches disk —
// admins were uploading straight-from-phone photos of 5-8MB at 2000px+,
// which is what made /tienda crawl on mobile (see the mobile perf audit).
const MAX_DIMENSION = 1200;
const WEBP_QUALITY = 80;

/**
 * S-03: Validate that the file buffer starts with the magic bytes of a known image format.
 * This is the ONLY reliable way to verify file type — Content-Type and extension are spoofable.
 *
 * Magic byte signatures:
 *  - JPEG:  FF D8 FF
 *  - PNG:   89 50 4E 47 0D 0A 1A 0A
 *  - WebP:  52 49 46 46 ?? ?? ?? ?? 57 45 42 50  (RIFF....WEBP)
 *  - GIF:   47 49 46 38 39 61 (GIF89a) or 47 49 46 38 37 61 (GIF87a)
 */
function checkImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;

  // JPEG: starts with FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;

  // PNG: starts with 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
    buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A
  ) return true;

  // WebP: RIFF at bytes 0-3 and WEBP at bytes 8-11
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) return true;

  // GIF87a or GIF89a: starts with GIF8
  if (
    buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) && buffer[5] === 0x61
  ) return true;

  return false;
}

export async function POST(request: NextRequest) {
  try {
    console.log("[UPLOAD_API] Inicio de petición POST");

    // SECURITY FIX (VULN-06): Use requireAdminRole to validate token AND role
    const authError = await requireAdminRole(request);
    if (authError) {
      console.error("[UPLOAD_API] Error: Acceso no autorizado");
      return authError;
    }
    console.log("[UPLOAD_API] Acceso de administrador verificado");

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("[UPLOAD_API] Error: No se recibió ningún archivo");
      return NextResponse.json({ error: "No se encontró ningún archivo" }, { status: 400 });
    }

    console.log("[UPLOAD_API] Archivo recibido:", file.name, "Tipo:", file.type, "Tamaño:", file.size);

    // 2. Security check: Validate file type and extension
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    
    if (!allowedTypes.includes(file.type)) {
      console.error("[UPLOAD_API] Error: Tipo de archivo no permitido:", file.type);
      return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
    }

    const ext = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
    if (!allowedExtensions.includes("." + ext)) {
       console.error("[UPLOAD_API] Error: Extensión no permitida:", ext);
       return NextResponse.json({ error: "Extensión de archivo no permitida" }, { status: 400 });
    }

    // 3. Security check: Validate file size (max 5MB for product images)
    // 100MB was dangerously large and could be used for DoS attacks.
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Archivo demasiado grande. Máximo 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // S-03 SECURITY FIX: Validate magic bytes (file signature) — the REAL identity of the file.
    // Content-Type and file extension are 100% client-controlled and trivially spoofed.
    // Magic bytes are read from the actual binary content and cannot be faked without
    // corrupting the file in a way that browsers won't render as an image.
    const isValidImageMagicBytes = checkImageMagicBytes(buffer);
    if (!isValidImageMagicBytes) {
      console.error("[UPLOAD_API] Error: Magic bytes no corresponden a ninguna imagen válida");
      return NextResponse.json(
        { error: "El archivo no es una imagen válida (firma binaria incorrecta)" },
        { status: 400 }
      );
    }

    // 4. Nombre único y sanitizado — siempre .webp, sin importar el formato de origen
    const baseName = file.name.toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9.]/g, "_");
    const uniqueName = `${Date.now()}-${baseName}.webp`;

    // 5. Directorio de uploads — ruta absoluta persistente
    const uploadDir = join(process.cwd(), "data", "uploads");

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {}

    try {
      // Re-encode + downscale before writing — this is the fix for the
      // multi-MB photos that were choking the catalog on mobile.
      const optimized = await sharp(buffer)
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      const path = join(uploadDir, uniqueName);
      await writeFile(path, optimized);

      // COMANDO SENIOR: Asegurar que el archivo sea legible por el servidor web (chmod 644)
      await chmod(path, 0o644);

      console.log(`[UPLOAD_API] Guardado ${uniqueName} (${(buffer.length / 1024).toFixed(0)}KB → ${(optimized.length / 1024).toFixed(0)}KB), permisos 644 aplicados en:`, path);

      return NextResponse.json({
        success: true,
        url: `/uploads/${uniqueName}`
      });
    } catch (writeError: any) {
      console.error("[UPLOAD_API] ERROR DE ESCRITURA:", writeError.message);
      return NextResponse.json({
        error: "Falla de escritura en disco. Revisa permisos de carpeta."
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[UPLOAD_API] EXCEPCIÓN:", error.message || error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Error al subir la imagen" 
    }, { status: 500 });
  }
}
