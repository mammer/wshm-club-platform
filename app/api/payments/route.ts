import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { log } from "@/lib/audit";

type AuthSession = { user?: { name?: string | null; role?: string } } | null;

function isAdmin(session: AuthSession) {
  return session?.user && (session.user.role ?? "ADMIN") !== "COACH";
}

export async function GET(req: NextRequest) {
  const session = await auth() as AuthSession;
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const playerId = searchParams.get("playerId");
  const season = searchParams.get("season");
  const category = searchParams.get("category");

  const payments = await prisma.payment.findMany({
    where: {
      ...(playerId && { playerId }),
      ...(season && { season }),
      ...(category && { player: { category } }),
    },
    include: { player: { select: { fullName: true, category: true } } },
    orderBy: { paymentDate: "desc" },
  });

  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
  const session = await auth() as AuthSession;
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const payment = await prisma.payment.create({
    data: body,
    include: { player: { select: { fullName: true, category: true } } },
  });
  await log("CREATE", "Payment", payment.id,
    `Paiement ${payment.paymentType} ${payment.amount} MAD — ${payment.player.fullName} — Saison ${payment.season}`,
    session?.user?.name ?? undefined);
  return NextResponse.json(payment, { status: 201 });
}
