import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const playerId = searchParams.get("playerId");
  const season = searchParams.get("season");

  const stats = await prisma.playerStat.findMany({
    where: {
      ...(playerId && { playerId }),
      ...(season && { season }),
    },
    include: { player: { select: { fullName: true, category: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(stats);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const stat = await prisma.playerStat.create({ data: body });
  return NextResponse.json(stat, { status: 201 });
}
