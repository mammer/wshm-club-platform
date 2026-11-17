import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiAuth";

const CAT_COLOR: Record<string, string> = {
  SENIORS: "bg-blue-500", JUNIORS: "bg-green-500",
  CADETS: "bg-orange-500", MINIMES: "bg-purple-500",
};

export async function GET(req: NextRequest) {
  const { err } = await requireAuth();
  if (err) return err;

  const { searchParams } = req.nextUrl;
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  if (!startParam || !endParam) return NextResponse.json({ error: "Missing range" }, { status: 400 });

  const start = new Date(startParam);
  const end = new Date(endParam);

  const [matches, meetings, attendanceSessions, tournaments] = await Promise.all([
    prisma.match.findMany({ where: { matchDate: { gte: start, lte: end } }, orderBy: { matchDate: "asc" } }),
    prisma.meeting.findMany({ where: { meetingDate: { gte: start, lte: end } }, orderBy: { meetingDate: "asc" } }),
    prisma.attendance.findMany({ where: { sessionDate: { gte: start, lte: end } }, orderBy: { sessionDate: "asc" } }),
    prisma.tournament.findMany({ where: { tournamentDate: { gte: start, lte: end } }, orderBy: { tournamentDate: "asc" } }),
  ]);

  const events = [
    ...matches.map((m) => ({
      id: m.id,
      date: m.matchDate.toISOString(),
      title: `${m.homeTeam} vs ${m.awayTeam}`,
      subtitle: m.homeScore != null ? `${m.homeScore} - ${m.awayScore}` : "À venir",
      type: "match" as const,
      color: CAT_COLOR[m.category] ?? "bg-blue-500",
      detail: {
        category: m.category,
        location: m.location,
        competition: m.competition,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        matchday: m.matchday,
      },
    })),
    ...meetings.map((m) => ({
      id: m.id,
      date: m.meetingDate.toISOString(),
      title: m.title,
      subtitle: m.location ?? undefined,
      type: "meeting" as const,
      color: "bg-[#CC0000]",
      detail: {
        location: m.location,
        attendeeCount: m.attendeeCount,
        agenda: m.agenda,
        decisions: m.decisions,
      },
    })),
    ...attendanceSessions.map((s) => ({
      id: s.id,
      date: s.sessionDate.toISOString(),
      title: `${s.sessionType} — ${s.category}`,
      subtitle: s.notes ?? undefined,
      type: "attendance" as const,
      color: "bg-green-500",
      detail: { category: s.category },
    })),
    ...tournaments.map((t) => ({
      id: t.id,
      date: t.tournamentDate.toISOString(),
      title: t.nameFr,
      subtitle: t.isOpen ? "Inscriptions ouvertes" : "Inscriptions fermées",
      type: "tournament" as const,
      color: "bg-yellow-500",
      detail: {},
    })),
  ];

  return NextResponse.json(events);
}
