import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/crypto";
import { signAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash, user.salt);

    if (!isValid) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const token = await signAuth({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({ success: true, message: "Autenticado" }, { status: 200 });

    // SET SECURE COOKIE
    response.cookies.set({
      name: "infositel_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // Strict for admin panel protection
      maxAge: 60 * 60 * 12, // Reduced to 12 hours for better security
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[LOGIN_AUTH_FLOW_ERROR]:", error);
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    return NextResponse.json({ 
      error: "Error en el servidor", 
      details: process.env.NODE_ENV === "development" ? String(error) : "Consulte los logs del servidor" 
    }, { status: 500 });
  }
}
