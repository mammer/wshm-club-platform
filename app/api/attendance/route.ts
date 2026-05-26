import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const { err } = await requireAuth();
  if (err) return err;
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const sessions = await prisma.attendance.findMany({
    where: category ? { category } : {},
    include: { records: { include: { player: { select: { id: true, fullName: true, jerseyNumber: true } } } } },
    orderBy: { sessionDate: "desc" },
  });
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const { err } = await requireAuth();
  if (err) return err;
  const body = await req.json();
  const { records, ...sessionData } = body;

  const attendance = await prisma.attendance.create({ data: sessionData });

  if (records && Array.isArray(records)) {
    for (const r of records) {
      await prisma.attendanceRecord.create({
        data: { sessionId: attendance.id, playerId: r.playerId, present: r.present, justification: r.justification ?? null },
      });
    }
  }

  return NextResponse.json(attendance, { status: 201 });
}
