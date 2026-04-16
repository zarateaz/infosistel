import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuth } from "./lib/auth";

/**
 * Middleware: El estándar oficial de Next.js para INFOSISTEL.
 * Protege rutas administrativas y subidas de archivos a nivel de Edge.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Definir qué rutas requieren protección
  // Incluimos /admin (excepto login) y rutas críticas de la API
  const isAdminPath = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const isUploadPath = pathname.startsWith("/api/upload");
  const isSecuredApiPath = pathname.startsWith("/api/secured");

  if (isAdminPath || isUploadPath || isSecuredApiPath) {
    const token = req.cookies.get("infositel_token")?.value;

    // Si no hay token, denegamos el acceso inmediatamente
    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Acceso denegado. Se requiere autenticación." }, 
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // Verificar la validez del token JWT
    const verifiedToken = await verifyAuth(token);

    if (!verifiedToken) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Sesión inválida o expirada." }, 
          { status: 401 }
        );
      }
      // Limpiar cookie corrupta y redirigir
      const response = NextResponse.redirect(new URL("/admin/login", req.url));
      response.cookies.delete("infositel_token");
      return response;
    }
  }

  return NextResponse.next();
}

// Configuración del matcher para optimizar el rendimiento (solo corre en estas rutas)
export const config = {
  matcher: [
    "/admin/:path*", 
    "/api/upload/:path*", 
    "/api/secured/:path*"
  ],
};
