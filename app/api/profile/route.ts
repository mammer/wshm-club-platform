import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, photoUrl } = await req.json();
  const user = await prisma.adminUser.update({
    where: { email: session.user.email },
    data: { name, photoUrl: photoUrl ?? null },
  });
  return NextResponse.json({ ok: true, name: user.name });
}
