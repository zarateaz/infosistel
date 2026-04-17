import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    console.log("[UPLOAD_API] Inicio de petición POST");
    
    // 1. Security check: Must be authenticated to upload
    const token = request.cookies.get("infositel_token")?.value;
    console.log("[UPLOAD_API] Token encontrado:", !!token);
    
    if (!token) {
      console.error("[UPLOAD_API] Error: Token ausente");
      return NextResponse.json({ error: "No autorizado (token ausente)" }, { status: 401 });
    }

    const payload = await verifyAuth(token);
    if (!payload) {
      console.error("[UPLOAD_API] Error: Token inválido");
      return NextResponse.json({ error: "No autorizado (token inválido)" }, { status: 401 });
    }
    
    console.log("[UPLOAD_API] Usuario autenticado:", payload.username);

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

    // 3. Security check: Validate file size (max 10MB for product images)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Archivo demasiado grande. Máximo 10MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Nombre único y sanitizado
    const sanitizedName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, "_");
    const uniqueName = `${Date.now()}-${sanitizedName}`;

    // 5. Directorio de uploads — usa UPLOADS_DIR desde env (configurado en PM2)
    // Necesario porque process.cwd() en standalone = .next/standalone/
    const uploadDir = process.env.UPLOADS_DIR 
      ?? join(process.cwd(), "public", "uploads");
    
    console.log("[UPLOAD_API] Directorio de destino:", uploadDir);
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Directorio ya existe — normal
    }

    const path = join(uploadDir, uniqueName);
    await writeFile(path, buffer);
    
    console.log("[UPLOAD_API] Archivo guardado con éxito:", path);

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${uniqueName}` 
    });
  } catch (error: any) {
    console.error("[UPLOAD_API] EXCEPCIÓN:", error.message || error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Error al subir la imagen" 
    }, { status: 500 });
  }
}
