import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

type AuthSession = { user?: { role?: string } } | null;
function isAdmin(s: AuthSession) { return s?.user && (s.user.role ?? "ADMIN") === "ADMIN"; }

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth() as AuthSession;
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { email, name, role, password } = await req.json();
  const data: Record<string, string> = { email, name, role };
  if (password) data.password = await bcrypt.hash(password, 10);
  const user = await prisma.adminUser.update({ where: { id }, data });
  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth() as AuthSession;
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
