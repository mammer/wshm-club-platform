import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const isAdmin = searchParams.get("admin") === "1";
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

  if (isAdmin) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : null;
  const pageLimit = limit ?? (page ? 9 : undefined);

  const posts = await prisma.blogPost.findMany({
    where: isAdmin ? {} : { published: true },
    orderBy: { createdAt: "desc" },
    take: pageLimit,
    skip: page && pageLimit ? (page - 1) * pageLimit : undefined,
    select: {
      id: true,
      slug: true,
      titleFr: true,
      titleAr: true,
      coverImageUrl: true,
      author: true,
      published: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (body.published && !body.publishedAt) body.publishedAt = new Date().toISOString();

  const post = await prisma.blogPost.create({ data: body });
  return NextResponse.json(post, { status: 201 });
}
