import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Sesión cerrada" }, { status: 200 });

  response.cookies.delete("infositel_token");

  return response;
}
