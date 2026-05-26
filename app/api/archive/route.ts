import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const year = searchParams.get("year");

  const archives = await prisma.archive.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(year ? { year: parseInt(year) } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(archives);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const archive = await prisma.archive.create({ data: body });
  return NextResponse.json(archive, { status: 201 });
}
