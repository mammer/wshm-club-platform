import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Category } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") as Category | null;

  const coaches = await prisma.coach.findMany({
    where: category ? { category } : {},
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json(coaches);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const coach = await prisma.coach.create({ data: body });
  return NextResponse.json(coach, { status: 201 });
}
