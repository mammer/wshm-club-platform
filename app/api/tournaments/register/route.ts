import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { requireManager } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  // 5 registrations per IP per hour
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = rateLimit(`reg:${ip}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de demandes. Réessayez dans une heure." }, { status: 429 });
  }
  const body = await req.json();
  const {
    tournamentId, clubName, contactName, contactPhone, category, playerCount,
    clubAddress, clubCity, presidentName, contactEmail,
    coachName, coachLicense, ageGroupMin, ageGroupMax,
    hasMedicalCerts, paymentMethod, notes,
  } = body;

  if (!tournamentId || !contactName || !contactPhone || !category || !playerCount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament || !tournament.isOpen) {
    return NextResponse.json({ error: "Tournament not open for registration" }, { status: 400 });
  }

  const registration = await prisma.tournamentRegistration.create({
    data: {
      tournamentId, clubName, contactName, contactPhone, category,
      playerCount: Number(playerCount),
      clubAddress: clubAddress ?? null,
      clubCity: clubCity ?? null,
      presidentName: presidentName ?? null,
      contactEmail: contactEmail ?? null,
      coachName: coachName ?? null,
      coachLicense: coachLicense ?? null,
      ageGroupMin: ageGroupMin ? Number(ageGroupMin) : null,
      ageGroupMax: ageGroupMax ? Number(ageGroupMax) : null,
      hasMedicalCerts: hasMedicalCerts ?? false,
      paymentMethod: paymentMethod ?? null,
      notes: notes ?? null,
    },
  });

  return NextResponse.json(registration, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { err } = await requireManager();
  if (err) return err;
  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  const reg = await prisma.tournamentRegistration.update({ where: { id }, data: { status } });
  return NextResponse.json(reg);
}
