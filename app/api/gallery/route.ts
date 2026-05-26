import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

  const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : null;

  if (page && limit) {
    const where = category ? { category } : {};
    const [photos, total] = await Promise.all([
      prisma.galleryPhoto.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.galleryPhoto.count({ where }),
    ]);
    return NextResponse.json({ data: photos, total, page, totalPages: Math.ceil(total / limit) });
  }

  const photos = await prisma.galleryPhoto.findMany({
    where: category ? { category } : {},
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const photo = await prisma.galleryPhoto.create({ data: body });
  return NextResponse.json(photo, { status: 201 });
}
