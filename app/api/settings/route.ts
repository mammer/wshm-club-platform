import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const settings = await prisma.clubSettings.findMany();
  const obj: Record<string, string> = {};
  for (const s of settings) obj[s.key] = s.value;
  return NextResponse.json(obj);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body: Record<string, string> = await req.json();
  for (const [key, value] of Object.entries(body)) {
    await prisma.clubSettings.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  return NextResponse.json({ ok: true });
}
