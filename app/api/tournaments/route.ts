import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { tournamentDate: "desc" },
    include: { registrations: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(tournaments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (!body.nameFr || !body.tournamentDate) {
    return NextResponse.json({ error: "Nom et date obligatoires" }, { status: 400 });
  }

  const data = {
    nameFr: body.nameFr,
    nameAr: body.nameAr || "",
    tournamentDate: new Date(body.tournamentDate),
    registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : null,
    categories: body.categories || "MINIMES,CADETS,JUNIORS,SENIORS",
    descriptionFr: body.descriptionFr || null,
    descriptionAr: body.descriptionAr || null,
    isOpen: body.isOpen ?? false,
  };

  try {
    const tournament = await prisma.tournament.create({ data });
    return NextResponse.json(tournament, { status: 201 });
  } catch (err) {
    console.error("Tournament create error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
