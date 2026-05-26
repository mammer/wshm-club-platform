import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Category } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") as Category | null;
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
  const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : null;
  const all = searchParams.get("all") === "1";

  const where = {
    ...(category && { category }),
    ...(all ? {} : { homeScore: { not: null } }),
  };

  if (page && limit) {
    const [matches, total] = await Promise.all([
      prisma.match.findMany({ where, orderBy: { matchDate: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.match.count({ where }),
    ]);
    return NextResponse.json({ data: matches, total, page, totalPages: Math.ceil(total / limit) });
  }

  const matches = await prisma.match.findMany({ where, orderBy: { matchDate: "desc" }, take: limit });
  return NextResponse.json(matches);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const match = await prisma.match.create({ data: body });
  return NextResponse.json(match, { status: 201 });
}
