import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/apiAuth";

export async function GET() {
  const { err } = await requireManager();
  if (err) return err;
  const members = await prisma.member.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const { err } = await requireManager();
  if (err) return err;
  const body = await req.json();
  const member = await prisma.member.create({ data: body });
  return NextResponse.json(member, { status: 201 });
}
