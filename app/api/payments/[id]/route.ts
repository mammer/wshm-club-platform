import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { log } from "@/lib/audit";

type AuthSession = { user?: { name?: string | null; role?: string } } | null;

function isAdmin(session: AuthSession) {
  return session?.user && (session.user.role ?? "ADMIN") !== "COACH";
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth() as AuthSession;
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const pay = await prisma.payment.findUnique({
    where: { id },
    include: { player: { select: { fullName: true } } },
  });
  await prisma.payment.delete({ where: { id } });
  await log("DELETE", "Payment", id,
    `Paiement supprimé: ${pay?.paymentType} ${pay?.amount} MAD — ${pay?.player?.fullName}`,
    session?.user?.name ?? undefined);
  return NextResponse.json({ ok: true });
}
