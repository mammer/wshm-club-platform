import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { log } from "@/lib/audit";

type AuthSession = { user?: { name?: string | null; role?: string } } | null;
function canWrite(s: AuthSession) { return s?.user && (s.user.role === "ADMIN" || s.user.role === "SECRETARY"); }

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth() as AuthSession;
  if (!canWrite(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const expense = await prisma.expense.update({ where: { id }, data: body });
  await log("UPDATE", "Expense", id, `Dépense modifiée: ${expense.description}`, session?.user?.name ?? undefined);
  return NextResponse.json(expense);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth() as AuthSession;
  if (!canWrite(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const e = await prisma.expense.findUnique({ where: { id } });
  await prisma.expense.delete({ where: { id } });
  await log("DELETE", "Expense", id, `Dépense supprimée: ${e?.description}`, session?.user?.name ?? undefined);
  return NextResponse.json({ ok: true });
}
