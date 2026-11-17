import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type S = { user?: { name?: string | null; role?: string } } | null;

export async function requireAuth(): Promise<{ session: S; err?: NextResponse }> {
  const session = (await auth()) as S;
  if (!session?.user) return { session: null, err: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { session };
}

export async function requireRoles(...roles: string[]): Promise<{ session: S; err?: NextResponse }> {
  const { session, err } = await requireAuth();
  if (err) return { session: null, err };
  const role = session?.user?.role; // no role means no access, never a default one
  if (!role) return { session: null, err: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  if (!roles.includes(role)) return { session: null, err: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { session };
}

// CSRF: verify request Origin matches the configured site URL (for state-changing API calls)
export function checkOrigin(req: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV !== "production") return null; // skip in dev
  const origin = req.headers.get("origin");
  const siteUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (!origin || !siteUrl || !origin.startsWith(siteUrl)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

// Shorthand: ADMIN or SECRETARY
export const requireManager = () => requireRoles("ADMIN", "SECRETARY");
// Shorthand: ADMIN only
export const requireAdmin = () => requireRoles("ADMIN");
