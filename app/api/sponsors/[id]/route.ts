import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { log } from "@/lib/audit";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const sponsor = await prisma.sponsor.update({ where: { id }, data: body });
  await log("UPDATE", "Sponsor", id, `Sponsor modifié: ${sponsor.name}`);
  return NextResponse.json(sponsor);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.sponsor.delete({ where: { id } });
  await log("DELETE", "Sponsor", id);
  return NextResponse.json({ ok: true });
}
