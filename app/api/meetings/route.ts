import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManager } from "@/lib/apiAuth";

export async function GET() {
  const { err } = await requireManager();
  if (err) return err;
  const meetings = await prisma.meeting.findMany({ orderBy: { meetingDate: "desc" } });
  return NextResponse.json(meetings);
}

export async function POST(req: NextRequest) {
  const { err } = await requireManager();
  if (err) return err;
  const body = await req.json();
  const meeting = await prisma.meeting.create({ data: body });
  return NextResponse.json(meeting, { status: 201 });
}
