import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { log } from "@/lib/audit";

type AuthSession = { user?: { name?: string | null; role?: string } } | null;

function isAdmin(session: AuthSession) {
  return session?.user && (session.user.role ?? "ADMIN") !== "COACH";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const player = await prisma.player.findUnique({
    where: { id },
    include: { payments: { orderBy: { paymentDate: "desc" } }, stats: { orderBy: { season: "desc" } } },
  });
  if (!player) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(player);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth() as AuthSession;
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const player = await prisma.player.update({ where: { id }, data: body });
  await log("UPDATE", "Player", id, `Joueur modifié: ${player.fullName}`, session?.user?.name ?? undefined);
  return NextResponse.json(player);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth() as AuthSession;
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const player = await prisma.player.findUnique({ where: { id }, select: { fullName: true } });
  await prisma.player.delete({ where: { id } });
  await log("DELETE", "Player", id, `Joueur supprimé: ${player?.fullName}`, session?.user?.name ?? undefined);
  return NextResponse.json({ ok: true });
}
