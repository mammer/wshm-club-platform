import { auth } from "@/lib/auth";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { canAccess, ROLE_HOME } from "@/lib/roles";

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin routes: check auth + role
  if (pathname.startsWith("/admin")) {
    const session = await auth();

    if (!session?.user && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    if (session?.user && pathname !== "/admin/login") {
      const role = (session.user as { role?: string }).role ?? "ADMIN";
      if (!canAccess(pathname, role)) {
        const home = ROLE_HOME[role] ?? "/admin/players";
        const url = new URL(home, req.url);
        url.searchParams.set("forbidden", "1");
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  }

  // Public routes: run i18n middleware
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\..*).*)",
  ],
};
