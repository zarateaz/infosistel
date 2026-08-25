/**
 * app/uploads/[...path]/route.ts
 *
 * SECURITY FIX (VULN-07): Path Traversal prevention.
 * Validates that the resolved file path starts with the expected upload directory,
 * blocking any attempt to escape and read arbitrary files (e.g. ../../etc/passwd).
 */
import { NextRequest, NextResponse } from "next/server";
import { join, resolve } from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

// The canonical base upload directory — all served files MUST be under this path
const UPLOAD_DIR = resolve(process.cwd(), "data", "uploads");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;

  // Join path segments with forward slash — safe concatenation
  const rawFileName = pathSegments.join("/");

  // Resolve the absolute path to the requested file
  const resolvedPath = resolve(UPLOAD_DIR, rawFileName);

  // SECURITY FIX (VULN-07): Strict path prefix check.
  // If the resolved path escapes UPLOAD_DIR (e.g. via ../../../etc/passwd),
  // reject the request immediately with 403 Forbidden.
  if (!resolvedPath.startsWith(UPLOAD_DIR + "/") && resolvedPath !== UPLOAD_DIR) {
    console.warn(`[UPLOADS] Path traversal attempt blocked: ${rawFileName}`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Whitelist of allowed file extensions — block any non-image file type
  const ext = resolvedPath.split(".").pop()?.toLowerCase();
  const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
  if (!ext || !allowedExtensions.has(ext)) {
    return new NextResponse("Forbidden: file type not allowed", { status: 403 });
  }

  try {
    if (existsSync(resolvedPath)) {
      const fileBuffer = await readFile(resolvedPath);

      // Determine Content-Type from the whitelisted extension
      const contentTypeMap: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        gif: "image/gif",
      };
      const contentType = contentTypeMap[ext] ?? "application/octet-stream";

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          // Prevent the browser from sniffing the content type
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
  } catch (error) {
    console.error("[UPLOADS_PROXY_ERROR]", error);
  }

  return new NextResponse("Not Found", { status: 404 });
}
