import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  // Proteger páginas admin y APIs admin (las públicas como POST /api/orders y /api/lookup quedan fuera)
  const session = req.cookies.get("admin_session");

  if (!session || session.value !== "authenticated") {
    // Si es una API, devolver 401 JSON en vez de redirect
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/orders/:path*", "/api/orders", "/api/orders/:path*"],
};
