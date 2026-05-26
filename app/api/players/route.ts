import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Category } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") as Category | null;
  const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : null;
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : null;

  const where = { isActive: true, ...(category && { category }) };
  const orderBy = [{ category: "asc" as const }, { jerseyNumber: "asc" as const }, { fullName: "asc" as const }];

  if (page && limit) {
    const [players, total] = await Promise.all([
      prisma.player.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      prisma.player.count({ where }),
    ]);
    return NextResponse.json({ data: players, total, page, totalPages: Math.ceil(total / limit) });
  }

  const players = await prisma.player.findMany({ where, orderBy });
  return NextResponse.json(players);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const player = await prisma.player.create({ data: body });
  return NextResponse.json(player, { status: 201 });
}
