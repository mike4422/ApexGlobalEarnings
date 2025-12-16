// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIX = "/dashboard";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read auth cookie
  const token = req.cookies.get("apex_token")?.value ?? null;

  const isDashboardRoute =
    pathname === PROTECTED_PREFIX || pathname.startsWith(`${PROTECTED_PREFIX}/`);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  // ❌ Not logged in but trying to visit /dashboard → redirect to /login
  if (isDashboardRoute && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Already logged in & trying to access /login or /register → send to /dashboard
  if (isAuthPage && token) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
