import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ✅ Allow access to login and NextAuth API
  const publicPaths = ["/login", "/api/auth", "/_next", "/favicon.ico", "/car1.png"];

  if (publicPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 🔒 Redirect unauthenticated users trying to access protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// ✅ Protect ALL routes except /login and NextAuth API
export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
