import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/participant", request.url));
    }
  }

  if (pathname.startsWith("/participant")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (token.role !== "PARTICIPANT") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  if (pathname === "/login" && token?.role) {
    return NextResponse.redirect(new URL(token.role === "ADMIN" ? "/admin" : "/participant", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/participant/:path*", "/login"],
};
