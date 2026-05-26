import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/apiAuth";
import { log } from "@/lib/audit";

export async function GET() {
  const { err } = await requireManager();
  if (err) return err;
  const sponsors = await prisma.sponsor.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(sponsors);
}

export async function POST(req: NextRequest) {
  const { err } = await requireManager();
  if (err) return err;
  const body = await req.json();
  const sponsor = await prisma.sponsor.create({ data: body });
  await log("CREATE", "Sponsor", sponsor.id, `Sponsor créé: ${sponsor.name}`);
  return NextResponse.json(sponsor, { status: 201 });
}
