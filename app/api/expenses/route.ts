import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { log } from "@/lib/audit";

type AuthSession = { user?: { name?: string | null; role?: string } } | null;
function canWrite(s: AuthSession) { return s?.user && (s.user.role === "ADMIN" || s.user.role === "SECRETARY"); }

export async function GET(req: NextRequest) {
  const session = await auth() as AuthSession;
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = req.nextUrl;
  const season = searchParams.get("season");
  const expenses = await prisma.expense.findMany({
    where: season ? { season } : {},
    orderBy: { expenseDate: "desc" },
  });
  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const session = await auth() as AuthSession;
  if (!canWrite(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const expense = await prisma.expense.create({ data: body });
  await log("CREATE", "Expense", expense.id, `Dépense ${expense.category} ${expense.amount} MAD — ${expense.description}`, session?.user?.name ?? undefined);
  return NextResponse.json(expense, { status: 201 });
}
