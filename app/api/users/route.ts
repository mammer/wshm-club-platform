import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

type AuthSession = { user?: { role?: string } } | null;
function isAdmin(s: AuthSession) { return s?.user && (s.user.role ?? "ADMIN") === "ADMIN"; }

export async function GET() {
  const session = await auth() as AuthSession;
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await prisma.adminUser.findMany({ select: { id: true, email: true, name: true, role: true, photoUrl: true } });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await auth() as AuthSession;
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { email, name, role, password } = await req.json();
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.adminUser.create({ data: { email, name, role, password: hash } });
  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role }, { status: 201 });
}
