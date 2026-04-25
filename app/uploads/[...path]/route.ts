import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // 1. Obtener la ruta del archivo solicitado (Awaiting params para Next.js 15+)
  const { path: pathSegments } = await params;
  const fileName = pathSegments.join("/");
  
  // 2. Definir la ruta absoluta en la carpeta persistente 'data/uploads'
  const filePath = join(process.cwd(), "data", "uploads", fileName);

  try {
    // 3. Verificar si el archivo existe en 'data/uploads'
    if (existsSync(filePath)) {
      const fileBuffer = await readFile(filePath);
      
      // Determinar el Content-Type básico según la extensión
      const ext = fileName.split(".").pop()?.toLowerCase();
      let contentType = "application/octet-stream";
      
      if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
      else if (ext === "png") contentType = "image/png";
      else if (ext === "webp") contentType = "image/webp";
      else if (ext === "gif") contentType = "image/gif";
      else if (ext === "svg") contentType = "image/svg+xml";

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  } catch (error) {
    console.error("[UPLOADS_PROXY_ERROR]", error);
  }

  // 4. Si no existe en data/uploads, dejar que Next.js intente servirlo desde 'public/uploads' (comportamiento normal)
  // O retornar 404 si es un fallo definitivo
  return new NextResponse("Not Found", { status: 404 });
}
