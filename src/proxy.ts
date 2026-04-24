import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const hasSession =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token");

  const isAdminRoute = pathname.startsWith("/admin");
  const isSuperadminRoute = pathname.startsWith("/superadmin");
  const isLoginPage = pathname === "/auth/login";
  const isApiAdminRoute = pathname.startsWith("/api/admin");
  const isApiSuperadminRoute = pathname.startsWith("/api/superadmin");

  if ((isAdminRoute || isSuperadminRoute) && !isLoginPage && !hasSession) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if ((isApiAdminRoute || isApiSuperadminRoute) && !hasSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*", "/auth/login", "/api/admin/:path*", "/api/superadmin/:path*"],
};
